/** Дневная рекламная статистика по товару (Performance API) */
export type AdSpendDaily = {
  productId: string | null;
  sku: string;
  date: Date;
  campaignId: string;
  campaignTitle: string | null;
  /** SKU — оплата за клик; SEARCH_PROMO — оплата за заказ */
  campaignType: string;
  views: number;
  clicks: number;
  toCart: number;
  spent: number;
  orders: number;
  ordersMoney: number;
};

/** Строка таблицы рекламы по товару за период */
export type ProductAdStats = {
  productId: string | null;
  sku: string;
  name: string;
  imageUrl: string | null;
  views: number;
  clicks: number;
  /** Клики / показы, % */
  ctrPercent: number | null;
  toCart: number;
  spent: number;
  orders: number;
  ordersMoney: number;
  /** Расход / выручка товара за период, % */
  drrPercent: number | null;
  /** ДРР с учётом процента выкупа, % (Excel '1. UNIT'!CH) */
  drrWithBuyoutPercent: number | null;
  /** Стоимость получения одного заказа, ₽ (Excel '4. Реклама'!D) */
  cpo: number | null;
};

export type CampaignStats = {
  campaignId: string;
  title: string | null;
  campaignType: string;
  spent: number;
  views: number;
  clicks: number;
  orders: number;
  ordersMoney: number;
};

export type AdvertisingData = {
  /** true — ключи Performance API настроены */
  connected: boolean;
  summary: {
    spent: number;
    views: number;
    clicks: number;
    orders: number;
    ordersMoney: number;
    /** Расход / выручка магазина за период, % */
    drrPercent: number | null;
    drrWithBuyoutPercent: number | null;
    cpo: number | null;
  };
  products: ProductAdStats[];
  campaigns: CampaignStats[];
};
