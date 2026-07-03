export type ProductProfitStatus = "profitable" | "low_margin" | "loss" | "no_cost";

export type ProductAnalytics = {
  productId: string;
  name: string;
  sku: string | null;
  offerId: string;
  imageUrl: string | null;
  price: number | null;

  soldQuantity: number;
  /** Заказано за период по FBO-отправлениям (без отменённых), включая ещё не доставленные */
  orderedQuantity: number;
  grossRevenue: number;

  commission: number;
  logistics: number;
  acquiring: number;
  returnAmount: number;
  penalty: number;
  otherDeduction: number;

  purchaseCost: number;
  packagingCost: number;
  deliveryCost: number;
  taxAmount: number;
  otherCost: number;

  totalOzonExpenses: number;
  totalProductCost: number;
  totalExpenses: number;

  netProfit: number;
  marginPercent: number;
  roiPercent: number;

  status: ProductProfitStatus;
};

export type ExpenseCategoryTotal = { category: string; amount: number };

export type DashboardSeriesPoint = {
  /** yyyy-mm-dd */
  date: string;
  revenue: number;
  profit: number;
};

export type DashboardData = {
  metrics: DashboardMetrics;
  topProfitable: ProductAnalytics[];
  topLoss: ProductAnalytics[];
  expensesByCategory: ExpenseCategoryTotal[];
  series: DashboardSeriesPoint[];
};

export type DashboardMetrics = {
  revenue: number;
  netProfit: number;
  marginPercent: number;
  ordersCount: number;
  soldQuantity: number;
  /** Сумма orderedQuantity по товарам — совпадает с колонкой «Заказано» на /products */
  orderedQuantity: number;
  averageOrderProfit: number;
  lossProductsCount: number;
  noCostProductsCount: number;
  lowMarginProductsCount: number;
  totalOzonExpenses: number;
  totalProductCost: number;
  totalCommonExpenses: number;
};
