export const queryKeys = {
  products: (period: string) => ["products", period] as const,
  product: (id: string, period: string) => ["product", id, period] as const,
  productStocks: (id: string) => ["product-stocks", id] as const,
  dashboard: (period: string) => ["dashboard", period] as const,
  costs: ["costs"] as const,
  expenses: ["expenses"] as const,
  ozonSettings: ["ozon-settings"] as const,
  storeSettings: ["store-settings"] as const,
  bonusPoints: ["bonus-points"] as const,
};
