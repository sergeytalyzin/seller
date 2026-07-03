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
  /** Прямая логистика: магистраль, сборка, обработка отправления */
  logistics: number;
  /** Последняя миля */
  lastMile: number;
  /** Обратная логистика и обработка возвратов/невыкупов */
  returnLogistics: number;
  acquiring: number;
  /** Продвижение: клик, трафареты, вывод в топ, за заказ, бренд */
  advertising: number;
  /** Хранение/размещение на складе Ozon */
  storage: number;
  /** Возвраты выручки (сторно начислений) */
  returnAmount: number;
  penalty: number;
  otherDeduction: number;
  /** Невязка — часть суммы операции, не попавшая ни в одну категорию */
  unclassified: number;
  raw: unknown;
};
