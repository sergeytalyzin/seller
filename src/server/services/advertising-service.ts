import "server-only";

import type {
  AdvertisingData,
  CampaignStats,
  ProductAdStats,
} from "@/types/advertising";
import { db } from "@/lib/db";
import { getDataStore } from "@/server/data";
import {
  calcCpo,
  calcDrrPercent,
  calcDrrWithBuyoutPercent,
} from "@/lib/analytics/drr";
import { buildProductAnalytics } from "./analytics-service";

export async function buildAdvertisingData(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<AdvertisingData> {
  const store = getDataStore(storeId);
  const range = { dateFrom, dateTo };

  const [settings, adSpends, analytics] = await Promise.all([
    db.performanceSettings.findUnique({ where: { storeId } }),
    store.listAdSpend(range),
    buildProductAnalytics(storeId, range),
  ]);

  const analyticsById = new Map(analytics.map((p) => [p.productId, p]));
  const analyticsBySku = new Map(
    analytics.filter((p) => p.sku).map((p) => [p.sku as string, p]),
  );

  // Суммируем строки по товару (SKU)
  type Totals = {
    productId: string | null;
    sku: string;
    views: number;
    clicks: number;
    toCart: number;
    spent: number;
    orders: number;
    ordersMoney: number;
  };
  const bySku = new Map<string, Totals>();
  const byCampaign = new Map<string, CampaignStats>();

  for (const row of adSpends) {
    const skuEntry = bySku.get(row.sku) ?? {
      productId: row.productId,
      sku: row.sku,
      views: 0,
      clicks: 0,
      toCart: 0,
      spent: 0,
      orders: 0,
      ordersMoney: 0,
    };
    skuEntry.productId = skuEntry.productId ?? row.productId;
    skuEntry.views += row.views;
    skuEntry.clicks += row.clicks;
    skuEntry.toCart += row.toCart;
    skuEntry.spent += row.spent;
    skuEntry.orders += row.orders;
    skuEntry.ordersMoney += row.ordersMoney;
    bySku.set(row.sku, skuEntry);

    const campaignEntry = byCampaign.get(row.campaignId) ?? {
      campaignId: row.campaignId,
      title: row.campaignTitle,
      campaignType: row.campaignType,
      spent: 0,
      views: 0,
      clicks: 0,
      orders: 0,
      ordersMoney: 0,
    };
    campaignEntry.spent += row.spent;
    campaignEntry.views += row.views;
    campaignEntry.clicks += row.clicks;
    campaignEntry.orders += row.orders;
    campaignEntry.ordersMoney += row.ordersMoney;
    byCampaign.set(row.campaignId, campaignEntry);
  }

  const products: ProductAdStats[] = [...bySku.values()]
    .map((totals) => {
      const product =
        (totals.productId ? analyticsById.get(totals.productId) : undefined) ??
        analyticsBySku.get(totals.sku);
      return {
        productId: product?.productId ?? totals.productId,
        sku: totals.sku,
        name: product?.name ?? `SKU ${totals.sku}`,
        imageUrl: product?.imageUrl ?? null,
        views: totals.views,
        clicks: totals.clicks,
        ctrPercent: totals.views > 0 ? (totals.clicks / totals.views) * 100 : null,
        toCart: totals.toCart,
        spent: totals.spent,
        orders: totals.orders,
        ordersMoney: totals.ordersMoney,
        drrPercent: product?.drrPercent ?? null,
        drrWithBuyoutPercent: product?.drrWithBuyoutPercent ?? null,
        cpo: product?.cpo ?? null,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  const spent = products.reduce((s, p) => s + p.spent, 0);
  const netSales = analytics.reduce(
    (s, p) => s + p.grossRevenue - p.returnAmount,
    0,
  );
  const totalOrdered = analytics.reduce((s, p) => s + p.orderedQuantity, 0);
  const delivered = analytics.reduce(
    (s, p) =>
      s + (p.buyoutPercent != null ? (p.orderedQuantity * p.buyoutPercent) / 100 : 0),
    0,
  );
  const drrPercent = calcDrrPercent(spent, netSales);

  return {
    connected: settings != null,
    summary: {
      spent,
      views: products.reduce((s, p) => s + p.views, 0),
      clicks: products.reduce((s, p) => s + p.clicks, 0),
      orders: products.reduce((s, p) => s + p.orders, 0),
      ordersMoney: products.reduce((s, p) => s + p.ordersMoney, 0),
      drrPercent,
      drrWithBuyoutPercent: calcDrrWithBuyoutPercent(
        drrPercent,
        totalOrdered > 0 ? (delivered / totalOrdered) * 100 : null,
      ),
      cpo: calcCpo(spent, totalOrdered),
    },
    products,
    campaigns: [...byCampaign.values()].sort((a, b) => b.spent - a.spent),
  };
}
