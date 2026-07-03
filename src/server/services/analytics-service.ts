import "server-only";

import type { Product, ProductCost } from "@/types/product";
import type { FinanceOperation } from "@/types/finance";
import type { FboPosting } from "@/types/posting";
import type { ProductAnalytics } from "@/types/analytics";
import { getDataStore, type DateRange } from "@/server/data";
import {
  aggregateOperations,
  calcNetProfit,
  calcProductUnitCost,
  calcTaxAmount,
  calcTotalOzonExpenses,
  getProfitStatus,
} from "@/lib/analytics/profit";
import { calcMarginPercent } from "@/lib/analytics/margin";
import { calcRoiPercent } from "@/lib/analytics/roi";

/** Заказано, шт: строки FBO-отправлений за период, кроме отменённых */
function countOrderedQuantity(postings: FboPosting[]): number {
  let total = 0;
  for (const posting of postings) {
    if (posting.status !== "cancelled") total += posting.quantity;
  }
  return total;
}

function buildAnalyticsForProduct(
  product: Product,
  cost: ProductCost | null,
  operations: FinanceOperation[],
  orderedQuantity: number,
): ProductAnalytics {
  const totals = aggregateOperations(operations);
  const totalOzonExpenses = calcTotalOzonExpenses(totals);

  const unitCost = cost ? calcProductUnitCost(cost) : 0;
  const hasCost = unitCost > 0;
  const soldQuantity = Math.max(0, totals.soldQuantity);

  const totalProductCost = unitCost * soldQuantity;
  const taxAmount = hasCost
    ? calcTaxAmount(totals.grossRevenue, cost?.taxPercent ?? 0)
    : 0;

  const netProfit = calcNetProfit({
    grossRevenue: totals.grossRevenue,
    totalOzonExpenses,
    totalProductCost,
    taxAmount,
  });
  const marginPercent = calcMarginPercent(netProfit, totals.grossRevenue);

  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    offerId: product.offerId,
    imageUrl: product.imageUrl,
    price: product.price,

    soldQuantity,
    orderedQuantity,
    grossRevenue: totals.grossRevenue,

    commission: totals.commission,
    logistics: totals.logistics,
    acquiring: totals.acquiring,
    returnAmount: totals.returnAmount,
    penalty: totals.penalty,
    otherDeduction: totals.otherDeduction,

    purchaseCost: (cost?.purchaseCost ?? 0) * soldQuantity,
    packagingCost: (cost?.packagingCost ?? 0) * soldQuantity,
    deliveryCost: (cost?.deliveryCost ?? 0) * soldQuantity,
    otherCost: (cost?.otherCost ?? 0) * soldQuantity,
    taxAmount,

    totalOzonExpenses,
    totalProductCost,
    totalExpenses: totalOzonExpenses + totalProductCost + taxAmount,

    netProfit,
    marginPercent,
    roiPercent: calcRoiPercent(netProfit, totalProductCost),

    status: getProfitStatus({ hasCost, netProfit, marginPercent }),
  };
}

export async function buildProductAnalytics(
  storeId: string,
  range: DateRange = {},
): Promise<ProductAnalytics[]> {
  const store = getDataStore(storeId);
  const [products, costs, operations, postings] = await Promise.all([
    store.listProducts(),
    store.listProductCosts(),
    store.listFinanceOperations(range),
    store.listFboPostings(range),
  ]);

  const costByProduct = new Map(costs.map((c) => [c.productId, c]));

  const opsByProduct = new Map<string, FinanceOperation[]>();
  for (const op of operations) {
    if (!op.productId) continue;
    const list = opsByProduct.get(op.productId);
    if (list) list.push(op);
    else opsByProduct.set(op.productId, [op]);
  }

  const postingsByProduct = new Map<string, FboPosting[]>();
  for (const posting of postings) {
    if (!posting.productId) continue;
    const list = postingsByProduct.get(posting.productId);
    if (list) list.push(posting);
    else postingsByProduct.set(posting.productId, [posting]);
  }

  return products.map((product) =>
    buildAnalyticsForProduct(
      product,
      costByProduct.get(product.id) ?? null,
      opsByProduct.get(product.id) ?? [],
      countOrderedQuantity(postingsByProduct.get(product.id) ?? []),
    ),
  );
}

export async function buildOneProductAnalytics(
  storeId: string,
  productId: string,
  range: DateRange = {},
): Promise<ProductAnalytics | null> {
  const store = getDataStore(storeId);
  const product = await store.getProduct(productId);
  if (!product) return null;

  const [cost, operations, postings] = await Promise.all([
    store.getProductCost(productId),
    store.listFinanceOperations({ ...range, productId }),
    store.listFboPostings({ ...range, productId }),
  ]);

  return buildAnalyticsForProduct(
    product,
    cost,
    operations,
    countOrderedQuantity(postings),
  );
}
