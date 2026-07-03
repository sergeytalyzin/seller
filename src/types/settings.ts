/** Параметры расчёта прибыли на уровне магазина */
export type StoreSettings = {
  /** Ставка УСН «доходы», % */
  usnPercent: number;
  /** Ставка упрощённого НДС, % */
  vatPercent: number;
  /** Накладные расходы на единицу товара, ₽ */
  overheadPerUnit: number;
  /** Комиссия посредника + страховка, % */
  agentCommissionPercent: number;
  /** Ставка международной логистики, $/кг */
  logisticsRatePerKgUsd: number;
  /** Надбавка к курсу ЦБ, % */
  currencyMarkupPercent: number;
  /** Фиксированный курс ¥; null — использовать курс ЦБ с надбавкой */
  manualCnyRate: number | null;
  /** Фиксированный курс $; null — использовать курс ЦБ с надбавкой */
  manualUsdRate: number | null;
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  usnPercent: 0,
  vatPercent: 0,
  overheadPerUnit: 0,
  agentCommissionPercent: 0,
  logisticsRatePerKgUsd: 0,
  currencyMarkupPercent: 0,
  manualCnyRate: null,
  manualUsdRate: null,
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
