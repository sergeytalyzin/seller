/** Потоварные метрики из эталонной Excel-таблицы (листы «1. UNIT» и «5.1»). */

/**
 * Процент выкупа: доставленные / (доставленные + отменённые), %
 * (Excel '1. UNIT'!K6). null — заказов не было, метрику посчитать нельзя.
 */
export function calcBuyoutPercent(
  deliveredQty: number,
  cancelledQty: number,
): number | null {
  const total = deliveredQty + cancelledQty;
  if (total <= 0) return null;
  return (deliveredQty / total) * 100;
}

/** Средняя цена продажи: продажи-нетто / чистые штуки (Excel «5. Расчет ЧП» B89) */
export function calcAvgSalePrice(
  netRevenue: number,
  netQuantity: number,
): number | null {
  if (netQuantity <= 0) return null;
  return netRevenue / netQuantity;
}

/** Прибыль на 1 проданную единицу (Excel «5.1» CU) */
export function calcProfitPerUnit(
  netProfit: number,
  netQuantity: number,
): number | null {
  if (netQuantity <= 0) return null;
  return netProfit / netQuantity;
}

/** Наценка: продажи / себестоимость проданного (Excel «5. Расчет ЧП» B87) */
export function calcMarkup(netRevenue: number, totalProductCost: number): number | null {
  if (totalProductCost <= 0) return null;
  return netRevenue / totalProductCost;
}

/** Доля товара в обороте магазина, % (Excel '1. UNIT'!BS6) */
export function calcRevenueSharePercent(
  productRevenue: number,
  totalRevenue: number,
): number {
  if (totalRevenue <= 0) return 0;
  return (productRevenue / totalRevenue) * 100;
}
