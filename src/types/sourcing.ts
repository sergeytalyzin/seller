/** Параметры закупки товара в Китае */
export type ProductSourcing = {
  productId: string;
  link1688: string | null;
  agentComment: string | null;
  /** Цена единицы, ¥ */
  priceCny: number;
  /** Вес единицы, кг */
  weightKg: number;
  unitsPerBox: number;
  /** Логистика по Китаю за коробку, ¥ */
  chinaLogisticsPerBoxCny: number;
  /** Упаковка грузоместа, $ */
  packagingPerBoxUsd: number;
  /** Логистика по РФ за единицу, ₽ */
  rfLogisticsPerUnit: number;
  /** Считать «Закупку» себестоимости автоматически из этих параметров */
  autoCost: boolean;
  /** Закуплено в Китае (ещё не отправлено), шт */
  qtyPurchasing: number;
  /** В пути из Китая, шт */
  qtyInTransit: number;
  /** На нашем складе, шт */
  qtyOwnWarehouse: number;
  updatedAt: Date;
};

export type ProductSourcingInput = Omit<ProductSourcing, "productId" | "updatedAt">;
