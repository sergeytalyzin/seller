export type ProductProfitStatus = "profitable" | "low_margin" | "loss" | "no_cost";

/** Плановая юнит-экономика при текущей цене (Excel '1. UNIT' BW–CB) */
export type ProductUnitEconomics = {
  netPerUnit: number;
  roiPercent: number | null;
  marginPercent: number | null;
  netPerUnitWithAds: number;
  roiWithAdsPercent: number | null;
  marginWithAdsPercent: number | null;
};

export type ProductAnalytics = {
  productId: string;
  name: string;
  sku: string | null;
  offerId: string;
  imageUrl: string | null;
  price: number | null;

  /** Чистые проданные штуки: доставки минус возвраты */
  soldQuantity: number;
  /** Возвращено, шт */
  returnedQuantity: number;
  /** Заказано за период по FBO-отправлениям (без отменённых), включая ещё не доставленные */
  orderedQuantity: number;
  /** Процент выкупа: доставлено / (доставлено + отменено), null — заказов не было */
  buyoutPercent: number | null;
  grossRevenue: number;

  commission: number;
  logistics: number;
  lastMile: number;
  returnLogistics: number;
  acquiring: number;
  advertising: number;
  storage: number;
  returnAmount: number;
  penalty: number;
  otherDeduction: number;
  /** Невязка: начисления, не попавшие ни в одну категорию */
  unclassified: number;

  /** Поступление на р/с: начисления минус все удержания Ozon */
  payout: number;

  purchaseCost: number;
  packagingCost: number;
  deliveryCost: number;
  otherCost: number;
  /** Накладные расходы магазина: overheadPerUnit × шт */
  overheadCost: number;
  vatAmount: number;
  usnAmount: number;
  taxAmount: number;

  totalOzonExpenses: number;
  totalProductCost: number;
  totalExpenses: number;

  netProfit: number;
  marginPercent: number;
  roiPercent: number;

  /** Расход на рекламу по SKU из Performance API за период, ₽ */
  adSpend: number;
  /** ДРР: расход рекламы / выручка товара, % */
  drrPercent: number | null;
  /** ДРР с учётом процента выкупа, % */
  drrWithBuyoutPercent: number | null;
  /** Стоимость получения одного заказа, ₽ */
  cpo: number | null;
  /** Чистая прибыль минус реклама по SKU из рекламного кабинета */
  netProfitWithAds: number;

  /** Средняя цена продажи за период */
  avgSalePrice: number | null;
  /** Прибыль на 1 проданную единицу */
  profitPerUnit: number | null;
  /** Наценка: выручка / себестоимость проданного (коэффициент) */
  markup: number | null;
  /** Доля товара в обороте магазина, % */
  revenueSharePercent: number;

  /** Скорость продаж за последние 31 день, шт/день (без дней отсутствия товара) */
  salesVelocity: number | null;
  /** Доступно к продаже на FBO по последнему снимку остатков */
  stockAvailableQty: number | null;
  /** Запас в днях: остаток / скорость продаж */
  stockDays: number | null;
  /** Стадии до FBO (вводятся вручную в блоке «Закупка»): закуплено в Китае */
  stockPurchasingQty: number;
  /** В пути из Китая, шт */
  stockInTransitChinaQty: number;
  /** На нашем складе, шт */
  stockOwnWarehouseQty: number;
  /** Деньги в товаре: (все стадии + FBO + в пути) × себестоимость единицы */
  stockValue: number | null;

  /** Плановая прибыль с единицы при текущей цене; null — нет цены или данных */
  unitEconomics: ProductUnitEconomics | null;

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
  /** Удержания Ozon по категориям за период (комиссия, логистика, реклама, …) */
  ozonExpensesByCategory: ExpenseCategoryTotal[];
  series: DashboardSeriesPoint[];
};

export type DashboardMetrics = {
  revenue: number;
  /** Поступление на р/с: все начисления минус все удержания Ozon */
  payout: number;
  netProfit: number;
  marginPercent: number;
  ordersCount: number;
  soldQuantity: number;
  returnedQuantity: number;
  /** Сумма orderedQuantity по товарам — совпадает с колонкой «Заказано» на /products */
  orderedQuantity: number;
  /** Процент выкупа по магазину за период */
  buyoutPercent: number | null;
  /** Средняя цена продажи (средний чек) */
  avgSalePrice: number | null;
  averageOrderProfit: number;
  lossProductsCount: number;
  noCostProductsCount: number;
  lowMarginProductsCount: number;
  totalOzonExpenses: number;
  totalProductCost: number;
  /** Накладные расходы: overheadPerUnit × проданные штуки */
  overheadCost: number;
  totalCommonExpenses: number;
  /** Баллы Ozon за период (введены вручную), уменьшают налоговую базу */
  bonusPoints: number;
  vatAmount: number;
  usnAmount: number;
  taxAmount: number;
  /** Невязка: начисления Ozon, не попавшие ни в одну категорию */
  unclassified: number;
  /** Деньги в товаре: себестоимость остатков по всем стадиям (Китай → FBO) */
  stockValue: number;
  /** Штук на FBO и в пути (по товарам с заполненной себестоимостью и без) */
  stockUnits: number;
  /** Курс ¥ ЦБ РФ на сегодня; null — курс ещё не загружался */
  cnyRate: number | null;
  /** Изменение курса ¥ за 30 дней, %; null — истории нет */
  cnyRateChange30dPercent: number | null;
  /** Расход на рекламу из Performance API за период, ₽ */
  adSpend: number;
  /** ДРР магазина: расход рекламы / выручка, % */
  drrPercent: number | null;
};
