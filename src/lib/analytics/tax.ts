/**
 * Налоги по модели эталонной Excel-таблицы («5. Расчет ЧП» B76–B77):
 * база — продажи-нетто за вычетом баллов Ozon (соплатёж маркетплейса),
 * НДС извлекается из базы «изнутри», УСН «доходы» считается от базы без НДС.
 */

export type TaxInput = {
  /** Продажи минус возвраты за период, ₽ */
  netSales: number;
  /** Баллы Ozon за скидки (соплатёж), уменьшают налоговую базу, ₽ */
  bonusPoints: number;
  /** Ставка упрощённого НДС, % */
  vatPercent: number;
  /** Ставка УСН «доходы», % */
  usnPercent: number;
};

export type TaxResult = {
  vatAmount: number;
  usnAmount: number;
  /** НДС + УСН */
  taxAmount: number;
};

export function calcTaxes(input: TaxInput): TaxResult {
  const base = Math.max(0, input.netSales - input.bonusPoints);
  // Excel B76: (Продажи − Баллы) × ставка / (100% + ставка)
  const vatAmount = (base * input.vatPercent) / (100 + input.vatPercent);
  // Excel B77: (Продажи − Баллы − НДС) × ставка УСН
  const usnAmount = ((base - vatAmount) * input.usnPercent) / 100;
  return { vatAmount, usnAmount, taxAmount: vatAmount + usnAmount };
}

/**
 * Доля баллов Ozon в продажах («Средний СПП», Excel B88).
 * Используется, чтобы распределить баллы магазина по товарам
 * пропорционально их выручке.
 */
export function calcBonusShare(bonusPoints: number, netSales: number): number {
  if (netSales <= 0) return 0;
  return Math.min(1, Math.max(0, bonusPoints / netSales));
}
