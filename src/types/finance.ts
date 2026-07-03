export type FinanceOperation = {
  id: string;
  productId: string | null;
  ozonOperationId: string;
  operationDate: Date;
  operationType: string;
  operationTypeName: string | null;
  sku: string | null;
  offerId: string | null;
  productName: string | null;
  quantity: number;
  /** Начисление за доставленный заказ (выручка), ₽ */
  amount: number;
  /** Все расходные поля хранятся положительными числами, ₽ */
  commission: number;
  logistics: number;
  acquiring: number;
  returnAmount: number;
  penalty: number;
  otherDeduction: number;
  raw: unknown;
};
