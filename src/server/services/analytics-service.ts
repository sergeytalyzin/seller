import "server-only";

import type { Product, ProductCost } from "@/types/product";
import type { FboPosting } from "@/types/posting";
import type { ProductAnalytics, ProductUnitEconomics } from "@/types/analytics";
import type { StoreSettings } from "@/types/settings";
import {
  getDataStore,
  type DataStore,
  type DateRange,
  type StockSnapshotRow,
} from "@/server/data";
import {
  aggregateOperations,
  calcNetProfit,
  calcPayout,
  calcProductUnitCost,
  calcTotalOzonExpenses,
  getProfitStatus,
} from "@/lib/analytics/profit";
import { calcMarginPercent } from "@/lib/analytics/margin";
import { calcRoiPercent } from "@/lib/analytics/roi";
import { calcBonusShare, calcTaxes } from "@/lib/analytics/tax";
import {
  calcAvgSalePrice,
  calcBuyoutPercent,
  calcMarkup,
  calcProfitPerUnit,
  calcRevenueSharePercent,
} from "@/lib/analytics/sku-metrics";
import { calcSalesVelocity, type DailySalesPoint } from "@/lib/analytics/stock";
import { calcUnitEconomics } from "@/lib/analytics/unit-economics";
import type { OperationTotals } from "@/lib/analytics/types";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Окно расчёта скорости продаж, дней (Excel '1. UNIT': «Заказы за 31 день») */
export const VELOCITY_WINDOW_DAYS = 31;

/** Заказано, шт: строки FBO-отправлений за период, кроме отменённых */
function countOrderedQuantity(postings: FboPosting[]): number {
  let total = 0;
  for (const posting of postings) {
    if (posting.status !== "cancelled") total += posting.quantity;
  }
  return total;
}

/** Доставлено и отменено, шт — для процента выкупа */
function countBuyout(postings: FboPosting[]): {
  delivered: number;
  cancelled: number;
} {
  let delivered = 0;
  let cancelled = 0;
  for (const posting of postings) {
    if (posting.status === "delivered") delivered += posting.quantity;
    if (posting.status === "cancelled") cancelled += posting.quantity;
  }
  return { delivered, cancelled };
}

function dayKey(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

/**
 * Скорость продаж за последние 31 день: заказы по дням, где дни
 * без заказов и без остатка (по снимкам) исключаются из знаменателя.
 */
function buildVelocity(
  postings: FboPosting[],
  snapshots: StockSnapshotRow[],
  now: Date,
): number | null {
  const ordersByDay = new Map<string, number>();
  for (const posting of postings) {
    if (posting.status === "cancelled") continue;
    const key = dayKey(posting.orderedAt);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + posting.quantity);
  }

  const stockByDay = new Map<string, boolean>();
  for (const snapshot of snapshots) {
    stockByDay.set(dayKey(snapshot.date), snapshot.availableQty > 0);
  }

  const days: DailySalesPoint[] = [];
  for (let i = VELOCITY_WINDOW_DAYS - 1; i >= 0; i -= 1) {
    const key = dayKey(new Date(now.getTime() - i * DAY_MS));
    days.push({
      ordersQty: ordersByDay.get(key) ?? 0,
      hadStock: stockByDay.get(key) ?? null,
    });
  }

  return calcSalesVelocity(days);
}

type StoreContext = {
  settings: StoreSettings;
  /** Доля баллов Ozon в продажах магазина за период */
  bonusShare: number;
  /** Выручка магазина за период — для доли товара в обороте */
  totalRevenue: number;
};

type ProductStockInfo = {
  availableQty: number;
  transitQty: number;
} | null;

function buildUnitEconomics(
  price: number | null,
  totals: OperationTotals,
  unitCost: number,
  ctx: StoreContext,
): ProductUnitEconomics | null {
  if (price == null || price <= 0) return null;
  const netSales = totals.grossRevenue - totals.returnAmount;
  const deliveries = totals.soldQuantity + totals.returnedQuantity;
  if (netSales <= 0 || deliveries <= 0) return null;

  // Налог на единицу — от цены с учётом доли баллов Ozon (Excel '1. UNIT'!V6)
  const taxPerUnit = calcTaxes({
    netSales: price,
    bonusPoints: price * ctx.bonusShare,
    vatPercent: ctx.settings.vatPercent,
    usnPercent: ctx.settings.usnPercent,
  }).taxAmount;

  return calcUnitEconomics({
    price,
    commissionPercent: (totals.commission / netSales) * 100,
    acquiringPercent: (totals.acquiring / netSales) * 100,
    logisticsPerUnit: totals.logistics / deliveries,
    lastMilePerUnit: totals.lastMile / deliveries,
    unitCost,
    overheadPerUnit: ctx.settings.overheadPerUnit,
    taxPerUnit,
    drrPercent: (totals.advertising / netSales) * 100,
  });
}

function buildAnalyticsForProduct(params: {
  product: Product;
  cost: ProductCost | null;
  totals: OperationTotals;
  postings: FboPosting[];
  salesVelocity: number | null;
  stock: ProductStockInfo;
  ctx: StoreContext;
}): ProductAnalytics {
  const { product, cost, totals, postings, salesVelocity, stock, ctx } = params;

  const totalOzonExpenses = calcTotalOzonExpenses(totals);
  const payout = calcPayout(totals);

  const unitCost = cost ? calcProductUnitCost(cost) : 0;
  const hasCost = unitCost > 0;
  const soldQuantity = Math.max(0, totals.soldQuantity);
  const netSales = totals.grossRevenue - totals.returnAmount;

  const totalProductCost = unitCost * soldQuantity;
  const overheadCost = ctx.settings.overheadPerUnit * soldQuantity;

  // Налог: НДС + УСН от продаж-нетто минус доля баллов Ozon (Excel B76–B77)
  const taxes = calcTaxes({
    netSales,
    bonusPoints: netSales * ctx.bonusShare,
    vatPercent: ctx.settings.vatPercent,
    usnPercent: ctx.settings.usnPercent,
  });

  const netProfit = calcNetProfit({
    grossRevenue: totals.grossRevenue,
    totalOzonExpenses,
    totalProductCost,
    overheadCost,
    taxAmount: taxes.taxAmount,
  });
  const marginPercent = calcMarginPercent(netProfit, totals.grossRevenue);

  const buyout = countBuyout(postings);
  const stockUnits = stock ? stock.availableQty + stock.transitQty : null;

  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    offerId: product.offerId,
    imageUrl: product.imageUrl,
    price: product.price,

    soldQuantity,
    returnedQuantity: totals.returnedQuantity,
    orderedQuantity: countOrderedQuantity(postings),
    buyoutPercent: calcBuyoutPercent(buyout.delivered, buyout.cancelled),
    grossRevenue: totals.grossRevenue,

    commission: totals.commission,
    logistics: totals.logistics,
    lastMile: totals.lastMile,
    returnLogistics: totals.returnLogistics,
    acquiring: totals.acquiring,
    advertising: totals.advertising,
    storage: totals.storage,
    returnAmount: totals.returnAmount,
    penalty: totals.penalty,
    otherDeduction: totals.otherDeduction,
    unclassified: totals.unclassified,

    payout,

    purchaseCost: (cost?.purchaseCost ?? 0) * soldQuantity,
    packagingCost: (cost?.packagingCost ?? 0) * soldQuantity,
    deliveryCost: (cost?.deliveryCost ?? 0) * soldQuantity,
    otherCost: (cost?.otherCost ?? 0) * soldQuantity,
    overheadCost,
    vatAmount: taxes.vatAmount,
    usnAmount: taxes.usnAmount,
    taxAmount: taxes.taxAmount,

    totalOzonExpenses,
    totalProductCost,
    totalExpenses:
      totalOzonExpenses + totalProductCost + overheadCost + taxes.taxAmount,

    netProfit,
    marginPercent,
    // Excel B83: ЧП / (себестоимость + накладные)
    roiPercent: calcRoiPercent(netProfit, totalProductCost + overheadCost),

    avgSalePrice: calcAvgSalePrice(netSales, soldQuantity),
    profitPerUnit: hasCost ? calcProfitPerUnit(netProfit, soldQuantity) : null,
    markup: hasCost ? calcMarkup(netSales, totalProductCost) : null,
    revenueSharePercent: calcRevenueSharePercent(
      totals.grossRevenue,
      ctx.totalRevenue,
    ),

    salesVelocity,
    stockAvailableQty: stock?.availableQty ?? null,
    stockDays:
      stock && salesVelocity != null && salesVelocity > 0
        ? stock.availableQty / salesVelocity
        : null,
    stockValue: hasCost && stockUnits != null ? stockUnits * unitCost : null,

    unitEconomics: buildUnitEconomics(product.price, totals, unitCost, ctx),

    status: getProfitStatus({ hasCost, netProfit, marginPercent }),
  };
}

function groupBy<T>(items: T[], key: (item: T) => string | null): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    const list = groups.get(k);
    if (list) list.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}

async function loadVelocityData(store: DataStore, now: Date) {
  const velocityFrom = new Date(now.getTime() - (VELOCITY_WINDOW_DAYS - 1) * DAY_MS);
  velocityFrom.setUTCHours(0, 0, 0, 0);
  const [postings, snapshots] = await Promise.all([
    store.listFboPostings({ dateFrom: velocityFrom }),
    store.listStockSnapshots({ dateFrom: velocityFrom }),
  ]);
  return { postings, snapshots };
}

/** Последний снимок остатков по каждому SKU */
function latestStockBySku(snapshots: StockSnapshotRow[]): Map<string, ProductStockInfo> {
  const latest = new Map<string, StockSnapshotRow>();
  for (const snapshot of snapshots) {
    const prev = latest.get(snapshot.sku);
    if (!prev || snapshot.date > prev.date) latest.set(snapshot.sku, snapshot);
  }
  const result = new Map<string, ProductStockInfo>();
  for (const [sku, snapshot] of latest) {
    result.set(sku, {
      availableQty: snapshot.availableQty,
      transitQty: snapshot.transitQty,
    });
  }
  return result;
}

export async function buildProductAnalytics(
  storeId: string,
  range: DateRange = {},
): Promise<ProductAnalytics[]> {
  const store = getDataStore(storeId);
  const now = new Date();

  const [products, costs, operations, postings, settings, bonusAccruals, velocity] =
    await Promise.all([
      store.listProducts(),
      store.listProductCosts(),
      store.listFinanceOperations(range),
      store.listFboPostings(range),
      store.getStoreSettings(),
      store.listBonusAccruals(range),
      loadVelocityData(store, now),
    ]);

  const costByProduct = new Map(costs.map((c) => [c.productId, c]));
  const opsByProduct = groupBy(operations, (op) => op.productId);
  const postingsByProduct = groupBy(postings, (p) => p.productId);
  const velocityPostingsByProduct = groupBy(velocity.postings, (p) => p.productId);
  const stockBySku = latestStockBySku(velocity.snapshots);
  const snapshotsBySku = groupBy(velocity.snapshots, (s) => s.sku);

  // Первый проход: агрегаты операций — нужны для итогов магазина
  const totalsByProduct = new Map(
    products.map((product) => [
      product.id,
      aggregateOperations(opsByProduct.get(product.id) ?? []),
    ]),
  );

  let totalRevenue = 0;
  let totalNetSales = 0;
  for (const totals of totalsByProduct.values()) {
    totalRevenue += totals.grossRevenue;
    totalNetSales += totals.grossRevenue - totals.returnAmount;
  }

  const bonusPoints = bonusAccruals.reduce((sum, b) => sum + b.amount, 0);
  const ctx: StoreContext = {
    settings,
    bonusShare: calcBonusShare(bonusPoints, totalNetSales),
    totalRevenue,
  };

  return products.map((product) =>
    buildAnalyticsForProduct({
      product,
      cost: costByProduct.get(product.id) ?? null,
      totals: totalsByProduct.get(product.id) as OperationTotals,
      postings: postingsByProduct.get(product.id) ?? [],
      salesVelocity: buildVelocity(
        velocityPostingsByProduct.get(product.id) ?? [],
        product.sku ? (snapshotsBySku.get(product.sku) ?? []) : [],
        now,
      ),
      stock: product.sku ? (stockBySku.get(product.sku) ?? null) : null,
      ctx,
    }),
  );
}

export async function buildOneProductAnalytics(
  storeId: string,
  productId: string,
  range: DateRange = {},
): Promise<ProductAnalytics | null> {
  const analytics = await buildProductAnalytics(storeId, range);
  return analytics.find((item) => item.productId === productId) ?? null;
}
