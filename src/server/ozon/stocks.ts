import { ozonRequest, type OzonCredentials } from "./client";
import {
  analyticsStocksResponseSchema,
  type OzonStockAnalyticsItem,
} from "./schemas";
import type { ClusterStock, WarehouseStock } from "@/types/stocks";

/** Окно метрик /v1/analytics/stocks: ads и idc Ozon считает за последние 28 дней */
export const OZON_STOCK_METRICS_DAYS = 28;

/** Всего единиц на FBO: доступно + готовится к продаже + проходит проверку */
function totalOnFbo(item: OzonStockAnalyticsItem): number {
  return (
    item.available_stock_count + item.valid_stock_count + item.other_stock_count
  );
}

/**
 * Продажи за окно метрик, шт — из ads_cluster/ads (среднесуточные продажи
 * за 28 дней). Нужно уточнить API: заказов по кластерам за произвольный
 * период в Seller API нет (в отправлениях /v3/posting/fbo/list есть только
 * склад отгрузки, без кластера).
 */
function salesForWindow(adsPerDay: number | null | undefined): number | null {
  if (adsPerDay == null) return null;
  return Math.round(adsPerDay * OZON_STOCK_METRICS_DAYS);
}

function toWarehouse(item: OzonStockAnalyticsItem): WarehouseStock {
  return {
    warehouseName: item.warehouse_name,
    stockQty: totalOnFbo(item),
    availableQty: item.available_stock_count,
    inTransitQty: item.transit_stock_count,
    // Нужно уточнить API: ads/idc в /v1/analytics/stocks есть только на уровне
    // кластера (ads_cluster/idc_cluster), по конкретному складу их нет
    ordersQty: null,
    stockDays: null,
  };
}

function groupByCluster(items: OzonStockAnalyticsItem[]): ClusterStock[] {
  const clusters = new Map<string, ClusterStock>();

  for (const item of items) {
    const name =
      item.cluster_name ||
      (item.cluster_id != null ? `Кластер ${item.cluster_id}` : "Без кластера");

    let cluster = clusters.get(name);
    if (!cluster) {
      cluster = {
        clusterName: name,
        stockQty: 0,
        ordersQty: salesForWindow(item.ads_cluster),
        inTransitQty: 0,
        availableQty: 0,
        stockDays: item.idc_cluster ?? null,
        warehouses: [],
      };
      clusters.set(name, cluster);
    }

    // Счётчики в ответе даны по строкам (кластер × склад) — суммируем в кластер
    cluster.stockQty = (cluster.stockQty ?? 0) + totalOnFbo(item);
    cluster.availableQty =
      (cluster.availableQty ?? 0) + item.available_stock_count;
    cluster.inTransitQty =
      (cluster.inTransitQty ?? 0) + item.transit_stock_count;

    if (item.warehouse_name) cluster.warehouses?.push(toWarehouse(item));
  }

  return [...clusters.values()].map((cluster) =>
    cluster.warehouses?.length ? cluster : { ...cluster, warehouses: undefined },
  );
}

export type SkuStockSummary = {
  sku: string;
  /** Доступно к продаже на FBO */
  availableQty: number;
  /** В поставках в пути */
  transitQty: number;
};

/**
 * Суммарные остатки по списку SKU (для ежедневных снимков).
 * POST /v1/analytics/stocks, батчами по 100 SKU (лимит параметра skus).
 */
export async function fetchOzonStocksSummary(
  credentials: OzonCredentials,
  skus: string[],
): Promise<SkuStockSummary[]> {
  const BATCH = 100;
  const bySku = new Map<string, SkuStockSummary>();

  for (let i = 0; i < skus.length; i += BATCH) {
    const batch = skus.slice(i, i + BATCH);
    const response = analyticsStocksResponseSchema.parse(
      await ozonRequest({
        endpoint: "/v1/analytics/stocks",
        body: { skus: batch },
        credentials,
      }),
    );

    // Строки ответа — кластер × склад: суммируем по SKU
    for (const item of response.items) {
      if (item.sku == null) continue;
      const key = String(item.sku);
      const entry = bySku.get(key) ?? { sku: key, availableQty: 0, transitQty: 0 };
      entry.availableQty += item.available_stock_count;
      entry.transitQty += item.transit_stock_count;
      bySku.set(key, entry);
    }
  }

  return [...bySku.values()];
}

/**
 * Аналитика остатков товара по кластерам и складам Ozon.
 * POST /v1/analytics/stocks; обязательный параметр — skus (array<string>,
 * максимум 100), идентификатор именно SKU Ozon (не offer_id / product_id).
 */
export async function fetchOzonStockAnalytics(
  credentials: OzonCredentials,
  sku: string,
): Promise<{ stockDays: number | null; clusters: ClusterStock[] }> {
  const response = analyticsStocksResponseSchema.parse(
    await ozonRequest({
      endpoint: "/v1/analytics/stocks",
      body: { skus: [sku] },
      credentials,
    }),
  );

  return {
    // idc — запас в днях по всем кластерам, одинаков во всех строках товара
    stockDays: response.items[0]?.idc ?? null,
    clusters: groupByCluster(response.items),
  };
}
