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

export type DailySalesPoint = {
  ordersQty: number;
  /** Был ли товар в наличии в этот день; null — снимка остатков нет */
  hadStock: boolean | null;
};

/**
 * Скорость продаж, шт/день (Excel '1. UNIT'!BO6): среднее заказов в день,
 * где дни без заказов И без остатка на складе исключаются из знаменателя —
 * отсутствие товара не занижает скорость. Дни без снимка остатков считаются
 * как обычные дни с нулём заказов (как в Excel).
 */
export function calcSalesVelocity(days: DailySalesPoint[]): number | null {
  let sum = 0;
  let count = 0;
  for (const day of days) {
    if (day.ordersQty <= 0 && day.hadStock === false) continue;
    sum += day.ordersQty;
    count += 1;
  }
  if (count === 0) return null;
  return sum / count;
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
