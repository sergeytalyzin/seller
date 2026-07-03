import "server-only";

import type {
  DashboardData,
  DashboardMetrics,
  DashboardSeriesPoint,
} from "@/types/analytics";
import type { FinanceOperation } from "@/types/finance";
import { getDataStore } from "@/server/data";
import { calcMarginPercent } from "@/lib/analytics/margin";
import { calcProductUnitCost } from "@/lib/analytics/profit";
import { buildProductAnalytics } from "./analytics-service";

const DAY_MS = 24 * 60 * 60 * 1000;

function opDeductions(op: FinanceOperation): number {
  return (
    op.commission +
    op.logistics +
    op.acquiring +
    op.returnAmount +
    op.penalty +
    op.otherDeduction
  );
}

function dayKey(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

/**
 * Выручка и прибыль по дням из операций Ozon.
 * Прибыль по дню — приближённая: начисления минус удержания,
 * себестоимость проданных единиц и налог (общие расходы магазина не разносятся по дням).
 */
function buildSeries(
  operations: FinanceOperation[],
  unitCosts: Map<string, { unitCost: number; taxPercent: number }>,
  dateFrom: Date,
  dateTo: Date,
): DashboardSeriesPoint[] {
  const byDay = new Map<string, { revenue: number; profit: number }>();

  for (const op of operations) {
    const key = dayKey(op.operationDate);
    const entry = byDay.get(key) ?? { revenue: 0, profit: 0 };

    const cost = op.productId ? unitCosts.get(op.productId) : undefined;
    const productCost =
      cost && op.quantity > 0 ? cost.unitCost * op.quantity : 0;
    const tax = cost ? (op.amount * cost.taxPercent) / 100 : 0;

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

export async function buildDashboard(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<DashboardData> {
  const store = getDataStore(storeId);
  const range = { dateFrom, dateTo };

  const [analytics, operations, expenses, costs] = await Promise.all([
    buildProductAnalytics(storeId, range),
    store.listFinanceOperations(range),
    store.listExpenses(range),
    store.listProductCosts(),
  ]);

  // Удержания уровня магазина (продвижение и т.п.), не привязанные к товарам
  const storeDeductions = operations
    .filter((op) => !op.productId)
    .reduce((sum, op) => sum + opDeductions(op), 0);

  const revenue = analytics.reduce((s, p) => s + p.grossRevenue, 0);
  const productsNetProfit = analytics.reduce((s, p) => s + p.netProfit, 0);
  const totalCommonExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = productsNetProfit - storeDeductions - totalCommonExpenses;
  const ordersCount = operations.filter((op) => op.amount > 0).length;

  const metrics: DashboardMetrics = {
    revenue,
    netProfit,
    marginPercent: calcMarginPercent(netProfit, revenue),
    ordersCount,
    soldQuantity: analytics.reduce((s, p) => s + p.soldQuantity, 0),
    orderedQuantity: analytics.reduce((s, p) => s + p.orderedQuantity, 0),
    averageOrderProfit: ordersCount > 0 ? netProfit / ordersCount : 0,
    lossProductsCount: analytics.filter((p) => p.status === "loss").length,
    noCostProductsCount: analytics.filter((p) => p.status === "no_cost").length,
    lowMarginProductsCount: analytics.filter((p) => p.status === "low_margin")
      .length,
    totalOzonExpenses:
      analytics.reduce((s, p) => s + p.totalOzonExpenses, 0) + storeDeductions,
    totalProductCost: analytics.reduce((s, p) => s + p.totalProductCost, 0),
    totalCommonExpenses,
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
    costs.map((c) => [
      c.productId,
      { unitCost: calcProductUnitCost(c), taxPercent: c.taxPercent },
    ]),
  );

  return {
    metrics,
    topProfitable,
    topLoss,
    expensesByCategory,
    series: buildSeries(operations, unitCosts, dateFrom, dateTo),
  };
}
