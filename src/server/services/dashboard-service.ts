import "server-only";

import type {
  DashboardData,
  DashboardMetrics,
  DashboardSeriesPoint,
  ExpenseCategoryTotal,
} from "@/types/analytics";
import type { FinanceOperation } from "@/types/finance";
import { getDataStore } from "@/server/data";
import { calcMarginPercent } from "@/lib/analytics/margin";
import { calcProductUnitCost } from "@/lib/analytics/profit";
import { calcTaxes } from "@/lib/analytics/tax";
import { calcAvgSalePrice, calcBuyoutPercent } from "@/lib/analytics/sku-metrics";
import { calcDrrPercent } from "@/lib/analytics/drr";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/analytics/operation-classifier";
import { getCnyRateChangePercent, getCurrencyRates } from "@/server/currency";
import { buildProductAnalytics } from "./analytics-service";

const DAY_MS = 24 * 60 * 60 * 1000;

function opDeductions(op: FinanceOperation): number {
  return (
    op.commission +
    op.logistics +
    op.lastMile +
    op.returnLogistics +
    op.acquiring +
    op.advertising +
    op.storage +
    op.returnAmount +
    op.penalty +
    op.otherDeduction +
    op.unclassified
  );
}

function dayKey(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

/**
 * Выручка и прибыль по дням из операций Ozon.
 * Прибыль по дню — приближённая: начисления минус удержания,
 * себестоимость проданных единиц и налог по эффективной ставке
 * (общие расходы магазина не разносятся по дням).
 */
function buildSeries(
  operations: FinanceOperation[],
  unitCosts: Map<string, number>,
  effectiveTaxRate: number,
  overheadPerUnit: number,
  dateFrom: Date,
  dateTo: Date,
): DashboardSeriesPoint[] {
  const byDay = new Map<string, { revenue: number; profit: number }>();

  for (const op of operations) {
    const key = dayKey(op.operationDate);
    const entry = byDay.get(key) ?? { revenue: 0, profit: 0 };

    const unitCost = op.productId ? (unitCosts.get(op.productId) ?? 0) : 0;
    const soldQty = Math.max(op.quantity, 0);
    const productCost = (unitCost + overheadPerUnit) * soldQty;
    const tax = (op.amount - op.returnAmount) * effectiveTaxRate;

    entry.revenue += op.amount;
    entry.profit += op.amount - opDeductions(op) - productCost - tax;
    byDay.set(key, entry);
  }

  const series: DashboardSeriesPoint[] = [];
  for (let t = dateFrom.getTime(); t <= dateTo.getTime(); t += DAY_MS) {
    const key = dayKey(new Date(t));
    const entry = byDay.get(key);
    series.push({
      date: key,
      revenue: Math.round(entry?.revenue ?? 0),
      profit: Math.round(entry?.profit ?? 0),
    });
  }
  return series;
}

/** Удержания Ozon по категориям за период (Excel «5. Расчет ЧП», структура расходов) */
function buildOzonExpenseBreakdown(
  operations: FinanceOperation[],
): ExpenseCategoryTotal[] {
  const totals = {
    commission: 0,
    logistics: 0,
    lastMile: 0,
    returnLogistics: 0,
    acquiring: 0,
    advertising: 0,
    storage: 0,
    returnAmount: 0,
    penalty: 0,
    other: 0,
    unclassified: 0,
  };

  for (const op of operations) {
    totals.commission += op.commission;
    totals.logistics += op.logistics;
    totals.lastMile += op.lastMile;
    totals.returnLogistics += op.returnLogistics;
    totals.acquiring += op.acquiring;
    totals.advertising += op.advertising;
    totals.storage += op.storage;
    totals.returnAmount += op.returnAmount;
    totals.penalty += op.penalty;
    totals.other += op.otherDeduction;
    totals.unclassified += op.unclassified;
  }

  return (Object.keys(totals) as (keyof typeof totals)[])
    .map((key) => ({
      category: EXPENSE_CATEGORY_LABELS[key],
      amount: totals[key],
    }))
    .filter((item) => Math.abs(item.amount) >= 0.01)
    .sort((a, b) => b.amount - a.amount);
}

export async function buildDashboard(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<DashboardData> {
  const store = getDataStore(storeId);
  const range = { dateFrom, dateTo };

  const [analytics, operations, expenses, costs, settings, bonusAccruals, postings] =
    await Promise.all([
      buildProductAnalytics(storeId, range),
      store.listFinanceOperations(range),
      store.listExpenses(range),
      store.listProductCosts(),
      store.getStoreSettings(),
      store.listBonusAccruals(range),
      store.listFboPostings(range),
    ]);

  // Удержания уровня магазина (продвижение и т.п.), не привязанные к товарам
  const storeOperations = operations.filter((op) => !op.productId);
  const storeDeductions = storeOperations.reduce(
    (sum, op) => sum + opDeductions(op) - op.amount,
    0,
  );

  const revenue = analytics.reduce((s, p) => s + p.grossRevenue, 0);
  const returnAmount = analytics.reduce((s, p) => s + p.returnAmount, 0);
  const netSales = revenue - returnAmount;
  const soldQuantity = analytics.reduce((s, p) => s + p.soldQuantity, 0);
  const productsNetProfit = analytics.reduce((s, p) => s + p.netProfit, 0);
  const totalCommonExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = productsNetProfit - storeDeductions - totalCommonExpenses;
  const ordersCount = operations.filter((op) => op.amount > 0).length;

  const bonusPoints = bonusAccruals.reduce((sum, b) => sum + b.amount, 0);
  const taxes = calcTaxes({
    netSales,
    bonusPoints,
    vatPercent: settings.vatPercent,
    usnPercent: settings.usnPercent,
  });

  let deliveredQty = 0;
  let cancelledQty = 0;
  for (const posting of postings) {
    if (posting.status === "delivered") deliveredQty += posting.quantity;
    if (posting.status === "cancelled") cancelledQty += posting.quantity;
  }

  // Курс юаня для сигнала о росте себестоимости; ошибки не критичны
  let cnyRate: number | null = null;
  let cnyRateChange30dPercent: number | null = null;
  try {
    const [rates, change] = await Promise.all([
      getCurrencyRates(),
      getCnyRateChangePercent(30),
    ]);
    cnyRate = rates?.cnyRate ?? null;
    cnyRateChange30dPercent = change;
  } catch (error) {
    console.error("dashboard currency", error);
  }

  const metrics: DashboardMetrics = {
    revenue,
    payout: analytics.reduce((s, p) => s + p.payout, 0) - storeDeductions,
    netProfit,
    marginPercent: calcMarginPercent(netProfit, revenue),
    ordersCount,
    soldQuantity,
    returnedQuantity: analytics.reduce((s, p) => s + p.returnedQuantity, 0),
    orderedQuantity: analytics.reduce((s, p) => s + p.orderedQuantity, 0),
    buyoutPercent: calcBuyoutPercent(deliveredQty, cancelledQty),
    avgSalePrice: calcAvgSalePrice(netSales, soldQuantity),
    averageOrderProfit: ordersCount > 0 ? netProfit / ordersCount : 0,
    lossProductsCount: analytics.filter((p) => p.status === "loss").length,
    noCostProductsCount: analytics.filter((p) => p.status === "no_cost").length,
    lowMarginProductsCount: analytics.filter((p) => p.status === "low_margin")
      .length,
    totalOzonExpenses:
      analytics.reduce((s, p) => s + p.totalOzonExpenses, 0) + storeDeductions,
    totalProductCost: analytics.reduce((s, p) => s + p.totalProductCost, 0),
    overheadCost: analytics.reduce((s, p) => s + p.overheadCost, 0),
    totalCommonExpenses,
    bonusPoints,
    vatAmount: taxes.vatAmount,
    usnAmount: taxes.usnAmount,
    taxAmount: taxes.taxAmount,
    unclassified:
      analytics.reduce((s, p) => s + p.unclassified, 0) +
      storeOperations.reduce((s, op) => s + op.unclassified, 0),
    stockValue: analytics.reduce((s, p) => s + (p.stockValue ?? 0), 0),
    stockUnits: analytics.reduce(
      (s, p) => s + (p.stockAvailableQty ?? 0),
      0,
    ),
    cnyRate,
    cnyRateChange30dPercent,
    adSpend: analytics.reduce((s, p) => s + p.adSpend, 0),
    drrPercent: calcDrrPercent(
      analytics.reduce((s, p) => s + p.adSpend, 0),
      netSales,
    ),
  };

  const sold = analytics.filter((p) => p.grossRevenue > 0);
  const topProfitable = sold
    .filter((p) => p.status !== "no_cost" && p.netProfit > 0)
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, 5);
  const topLoss = sold
    .filter((p) => p.status === "loss")
    .sort((a, b) => a.netProfit - b.netProfit)
    .slice(0, 5);

  const categoryTotals = new Map<string, number>();
  for (const expense of expenses) {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(expense.category) ?? 0) + expense.amount,
    );
  }
  const expensesByCategory = [...categoryTotals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const unitCosts = new Map(
    costs.map((c) => [c.productId, calcProductUnitCost(c)]),
  );
  const effectiveTaxRate = netSales > 0 ? taxes.taxAmount / netSales : 0;

  return {
    metrics,
    topProfitable,
    topLoss,
    expensesByCategory,
    ozonExpensesByCategory: buildOzonExpenseBreakdown(operations),
    series: buildSeries(
      operations,
      unitCosts,
      effectiveTaxRate,
      settings.overheadPerUnit,
      dateFrom,
      dateTo,
    ),
  };
}
