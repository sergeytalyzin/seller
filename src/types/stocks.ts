/**
 * Остатки товара по складам и кластерам Ozon.
 * Источник — POST /v1/analytics/stocks (см. api.md №37): остатки, товары
 * в пути, среднесуточные продажи (ads) и запас в днях (idc) в разрезе
 * кластер × склад. Метрики Ozon считает за последние 28 дней.
 *
 * Нужно уточнить API: заказов по кластерам за произвольный период
 * в Seller API нет — «Заказы» здесь это продажи за 28-дневное окно метрик.
 */

/** Показатели одного склада внутри кластера. null — API не отдал значение. */
export type WarehouseStock = {
  warehouseName: string;
  stockQty: number | null;
  ordersQty: number | null;
  inTransitQty: number | null;
  availableQty: number | null;
  /** Запас в днях по расчёту Ozon (idc); null — в API нет значения */
  stockDays: number | null;
};

/** Показатели кластера; warehouses — разбивка по складам, если она есть в данных. */
export type ClusterStock = {
  clusterName: string;
  stockQty: number | null;
  ordersQty: number | null;
  inTransitQty: number | null;
  availableQty: number | null;
  /** Запас в днях по расчёту Ozon (idc_cluster); null — в API нет значения */
  stockDays: number | null;
  warehouses?: WarehouseStock[];
};

/** Ответ backend по остаткам товара за период. */
export type ProductStocks = {
  periodFrom: string;
  periodTo: string;
  /** Запас в днях по всем кластерам (idc) */
  stockDays: number | null;
  clusters: ClusterStock[];
};
