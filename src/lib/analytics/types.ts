/** Суммы финансовых операций по товару за период */
export type OperationTotals = {
  soldQuantity: number;
  ordersCount: number;
  grossRevenue: number;
  commission: number;
  logistics: number;
  acquiring: number;
  returnAmount: number;
  penalty: number;
  otherDeduction: number;
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
  taxAmount: number;
};
