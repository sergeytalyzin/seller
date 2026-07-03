/** Строка FBO-отправления (заказ со склада Ozon): отправление × товар */
export type FboPosting = {
  id: string;
  postingNumber: string;
  /** awaiting_packaging | awaiting_deliver | delivering | delivered | cancelled */
  status: string;
  orderedAt: Date | string;
  productId: string | null;
  sku: string | null;
  offerId: string | null;
  productName: string | null;
  quantity: number;
};
