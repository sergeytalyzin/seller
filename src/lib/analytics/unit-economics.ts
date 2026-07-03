/**
 * Плановая юнит-экономика: прибыль с одной единицы при текущей цене
 * (Excel '1. UNIT', колонки BW–CB «Чистыми / ROI / Маржа», «+Р» — с рекламой).
 *
 * Проценты и тарифы берутся из фактических операций товара
 * (как «факт»-ветка формулы логистики в Excel), а не из справочника тарифов.
 */

export type UnitEconomicsInput = {
  /** Текущая цена товара, ₽ */
  price: number;
  /** Комиссия Ozon, % от цены */
  commissionPercent: number;
  /** Эквайринг, % от цены */
  acquiringPercent: number;
  /** Прямая логистика на единицу, ₽ */
  logisticsPerUnit: number;
  /** Последняя миля на единицу, ₽ */
  lastMilePerUnit: number;
  /** Себестоимость единицы (закупка + упаковка + доставка + прочее), ₽ */
  unitCost: number;
  /** Накладные расходы на единицу, ₽ */
  overheadPerUnit: number;
  /** Налог на единицу (НДС + УСН от цены), ₽ */
  taxPerUnit: number;
  /** ДРР — доля расходов на рекламу от выручки, % (0 — без рекламы) */
  drrPercent: number;
};

export type UnitEconomics = {
  /** «Чистыми» — прибыль с единицы без рекламы, ₽ (Excel BW) */
  netPerUnit: number;
  /** ROI без рекламы, % (Excel BX: прибыль / (себестоимость + накладные)) */
  roiPercent: number | null;
  /** Маржа без рекламы, % (Excel BY: прибыль / цена) */
  marginPercent: number | null;
  /** «Чистыми +Р» — с учётом рекламы по ДРР, ₽ (Excel BZ) */
  netPerUnitWithAds: number;
  roiWithAdsPercent: number | null;
  marginWithAdsPercent: number | null;
};

export function calcUnitEconomics(input: UnitEconomicsInput): UnitEconomics {
  // Excel BW6: Цена − Цена×(комиссия+эквайринг) − логистика − миля − налог − себ − накладные
  const netPerUnit =
    input.price -
    (input.price * (input.commissionPercent + input.acquiringPercent)) / 100 -
    input.logisticsPerUnit -
    input.lastMilePerUnit -
    input.taxPerUnit -
    input.unitCost -
    input.overheadPerUnit;

  // Excel BZ6: то же минус Цена × ДРР
  const netPerUnitWithAds = netPerUnit - (input.price * input.drrPercent) / 100;

  const investedPerUnit = input.unitCost + input.overheadPerUnit;
  const roi = (net: number) =>
    investedPerUnit > 0 ? (net / investedPerUnit) * 100 : null;
  const margin = (net: number) =>
    input.price > 0 ? (net / input.price) * 100 : null;

  return {
    netPerUnit,
    roiPercent: roi(netPerUnit),
    marginPercent: margin(netPerUnit),
    netPerUnitWithAds,
    roiWithAdsPercent: roi(netPerUnitWithAds),
    marginWithAdsPercent: margin(netPerUnitWithAds),
  };
}
