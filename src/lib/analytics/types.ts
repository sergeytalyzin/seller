/** Суммы финансовых операций по товару за период */
export type OperationTotals = {
  /** Чистые проданные штуки: доставки минус возвраты */
  soldQuantity: number;
  /** Возвращено, шт */
  returnedQuantity: number;
  ordersCount: number;
  grossRevenue: number;
  /** Возвраты выручки, ₽ */
  returnAmount: number;
  commission: number;
  logistics: number;
  lastMile: number;
  returnLogistics: number;
  acquiring: number;
  advertising: number;
  storage: number;
  penalty: number;
  otherDeduction: number;
  unclassified: number;
};

/** Слагаемые себестоимости единицы товара */
export type UnitCostInput = {
  purchaseCost: number;
  packagingCost: number;
  deliveryCost: number;
  otherCost: number;
};

export type NetProfitInput = {
  grossRevenue: number;
  totalOzonExpenses: number;
  totalProductCost: number;
  /** Накладные расходы (overheadPerUnit × шт), ₽ */
  overheadCost: number;
  taxAmount: number;
};
