/** Запас товара в днях и статус доступности по кластеру/складу. */

export type StockStatus = "no_data" | "out_of_stock" | "low" | "ok" | "surplus";

/** Порог «мало товара», дней запаса */
export const LOW_STOCK_DAYS = 7;
/** Порог «избыток», дней запаса; больше — показываем «30+» */
export const SURPLUS_STOCK_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Длина периода в целых днях (минимум 1); null — период некорректный */
export function calcPeriodDays(from: Date | string, to: Date | string): number | null {
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  if (!Number.isFinite(fromTime) || !Number.isFinite(toTime)) return null;
  if (toTime <= fromTime) return null;
  return Math.max(1, Math.round((toTime - fromTime) / DAY_MS));
}

/**
 * Запас в днях: остаток / (заказы за период / дней в периоде).
 * Infinity — остаток есть, а продаж нет; null — посчитать нельзя.
 */
export function calcStockDays(
  stockQty: number | null,
  ordersQty: number | null,
  periodDays: number | null,
): number | null {
  if (stockQty == null || periodDays == null) return null;
  // null — заказы неизвестны (запас не посчитать); 0 — продаж не было
  if (ordersQty == null) return null;
  if (ordersQty <= 0) {
    return stockQty > 0 ? Infinity : null;
  }
  return stockQty / (ordersQty / periodDays);
}

export function getStockStatus(
  stockQty: number | null,
  ordersQty: number | null,
  stockDays: number | null,
): StockStatus {
  if (stockQty == null && ordersQty == null) return "no_data";
  if (stockQty != null && stockQty <= 0) {
    return (ordersQty ?? 0) > 0 ? "out_of_stock" : "no_data";
  }
  if (stockDays == null) return "no_data";
  if (stockDays < LOW_STOCK_DAYS) return "low";
  if (stockDays > SURPLUS_STOCK_DAYS) return "surplus";
  return "ok";
}
