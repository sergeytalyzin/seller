/** ДРР и стоимость заказа (Excel, лист «4. Реклама» и '1. UNIT'!CH). */

/**
 * ДРР — доля рекламных расходов от выручки, %.
 * Расход есть, а выручки нет → 100% (как в Excel: IFERROR(расход/выручка, 1)).
 * null — ни расхода, ни выручки.
 */
export function calcDrrPercent(adSpend: number, revenue: number): number | null {
  if (adSpend <= 0 && revenue <= 0) return null;
  if (revenue <= 0) return 100;
  return (adSpend / revenue) * 100;
}

/**
 * ДРР с учётом процента выкупа: расход относится только к выкупленной
 * выручке (Excel '1. UNIT'!CH6: ДРР / (%выкупа × 1%)).
 */
export function calcDrrWithBuyoutPercent(
  drrPercent: number | null,
  buyoutPercent: number | null,
): number | null {
  if (drrPercent == null) return null;
  if (buyoutPercent == null || buyoutPercent <= 0) return drrPercent;
  return drrPercent / (buyoutPercent / 100);
}

/** Стоимость получения одного заказа, ₽ (Excel '4. Реклама'!D7: расход/заказы) */
export function calcCpo(adSpend: number, ordersCount: number): number | null {
  if (adSpend <= 0 || ordersCount <= 0) return null;
  return adSpend / ordersCount;
}
