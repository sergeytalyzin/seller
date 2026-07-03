/** Параметры расчёта прибыли на уровне магазина */
export type StoreSettings = {
  /** Ставка УСН «доходы», % */
  usnPercent: number;
  /** Ставка упрощённого НДС, % */
  vatPercent: number;
  /** Накладные расходы на единицу товара, ₽ */
  overheadPerUnit: number;
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  usnPercent: 0,
  vatPercent: 0,
  overheadPerUnit: 0,
};

/** Баллы Ozon за скидки (соплатёж) — вручную, уменьшают налоговую базу */
export type BonusAccrual = {
  id: string;
  date: Date;
  amount: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BonusAccrualInput = {
  date: Date;
  amount: number;
  comment: string | null;
};
