/**
 * Себестоимость закупки в Китае (Excel «Просчет новинок», колонка «Себес-ть товара»).
 *
 * Отличие от Excel: комиссия посредника считается от рублёвой стоимости товара
 * (в шаблоне формула умножает процент на цену в юанях без пересчёта в рубли —
 * это занижает комиссию в «курс» раз).
 */

export type SourcingParams = {
  /** Цена единицы, ¥ */
  priceCny: number;
  /** Вес единицы, кг */
  weightKg: number;
  /** Штук в коробке */
  unitsPerBox: number;
  /** Логистика по Китаю за коробку, ¥ */
  chinaLogisticsPerBoxCny: number;
  /** Упаковка грузоместа, $ */
  packagingPerBoxUsd: number;
  /** Логистика по РФ за единицу, ₽ */
  rfLogisticsPerUnit: number;
};

export type SourcingRates = {
  /** Курс ₽ за 1 ¥ (с надбавкой посредника) */
  cnyRate: number;
  /** Курс ₽ за 1 $ (с надбавкой посредника) */
  usdRate: number;
  /** Комиссия посредника + страховка, % */
  agentCommissionPercent: number;
  /** Ставка международной логистики, $/кг */
  logisticsRatePerKgUsd: number;
};

export type SourcingCostBreakdown = {
  /** Товар: цена ¥ × курс, ₽ */
  goodsCost: number;
  /** Комиссия посредника от стоимости товара, ₽ */
  commissionCost: number;
  /** Международная логистика по весу, ₽ */
  intlLogisticsCost: number;
  /** Логистика по Китаю и упаковка грузоместа на единицу, ₽ */
  boxCost: number;
  /** Логистика по РФ, ₽ */
  rfLogisticsCost: number;
  /** Итого закупочная себестоимость единицы, ₽ */
  total: number;
};

export function calcSourcingCost(
  params: SourcingParams,
  rates: SourcingRates,
): SourcingCostBreakdown {
  const goodsCost = params.priceCny * rates.cnyRate;
  const commissionCost = (goodsCost * rates.agentCommissionPercent) / 100;
  const intlLogisticsCost =
    params.weightKg * rates.logisticsRatePerKgUsd * rates.usdRate;
  const unitsPerBox = Math.max(1, params.unitsPerBox);
  const boxCost =
    (params.chinaLogisticsPerBoxCny * rates.cnyRate +
      params.packagingPerBoxUsd * rates.usdRate) /
    unitsPerBox;
  const rfLogisticsCost = params.rfLogisticsPerUnit;

  return {
    goodsCost,
    commissionCost,
    intlLogisticsCost,
    boxCost,
    rfLogisticsCost,
    total:
      goodsCost + commissionCost + intlLogisticsCost + boxCost + rfLogisticsCost,
  };
}

/** Курс с надбавкой посредника: официальный курс ЦБ × (1 + надбавка%) */
export function applyCurrencyMarkup(rate: number, markupPercent: number): number {
  return rate * (1 + markupPercent / 100);
}
