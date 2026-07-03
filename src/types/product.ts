export type Product = {
  id: string;
  ozonProductId: string | null;
  offerId: string;
  sku: string | null;
  name: string;
  imageUrl: string | null;
  price: number | null;
  oldPrice: number | null;
  currency: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductCost = {
  productId: string;
  purchaseCost: number;
  packagingCost: number;
  deliveryCost: number;
  taxPercent: number;
  otherCost: number;
  comment: string | null;
  updatedAt: Date;
};

export type ProductCostInput = Omit<ProductCost, "productId" | "updatedAt">;

/** Строка таблицы массового редактирования себестоимости */
export type ProductCostRow = {
  productId: string;
  name: string;
  imageUrl: string | null;
  sku: string | null;
  offerId: string;
  price: number | null;
  cost: ProductCost | null;
};
