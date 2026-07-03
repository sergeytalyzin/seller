/**
 * Классификация финансовых операций Ozon по категориям расходов.
 *
 * Подход перенесён из эталонной Excel-таблицы (лист «Расшифровка (технич лист)»):
 * услуги внутри операции раскладываются по точному словарю имён сервисов
 * (enum OperationService в swagger.json), остаток операции — по её типу
 * (operation_type / operation_type_name). Всё, что не распознано,
 * попадает в «unclassified» — аналог строки «НЕ РАСШИФРОВАННЫЕ НАЧИСЛЕНИЯ».
 */

export type ExpenseCategory =
  | "commission"
  | "logistics"
  | "lastMile"
  | "returnLogistics"
  | "acquiring"
  | "advertising"
  | "storage"
  | "penalty"
  | "other";

/** Русские названия категорий для UI */
export const EXPENSE_CATEGORY_LABELS: Record<
  ExpenseCategory | "returnAmount" | "unclassified",
  string
> = {
  commission: "Комиссия Ozon",
  logistics: "Логистика",
  lastMile: "Последняя миля",
  returnLogistics: "Обратная логистика",
  acquiring: "Эквайринг",
  advertising: "Продвижение",
  storage: "Хранение",
  penalty: "Штрафы",
  other: "Прочие услуги",
  returnAmount: "Возвраты",
  unclassified: "Не расшифровано",
};

/**
 * Сервис внутри операции → категория.
 * Имена — enum OperationService из swagger.json.
 */
const SERVICE_CATEGORIES: Record<string, ExpenseCategory> = {
  // Прямая логистика: сборка, обработка отправления, магистраль
  MarketplaceServiceItemFulfillment: "logistics",
  MarketplaceServiceItemPickup: "logistics",
  MarketplaceServiceItemDropoffPVZ: "logistics",
  MarketplaceServiceItemDropoffSC: "logistics",
  MarketplaceServiceItemDropoffFF: "logistics",
  MarketplaceServiceItemDropoffPPZ: "logistics",
  MarketplaceServiceItemDropoff: "logistics",
  MarketplaceServiceItemDirectFlowTrans: "logistics",
  MarketplaceServiceItemDirectFlowLogistic: "logistics",
  MarketplaceServiceItemDirectFlowLogisticSum: "logistics",
  MarketplaceServiceItemDirectFlowLogisticDC: "logistics",
  MarketplaceServiceItemDirectFlowLogisticVDC: "logistics",
  MarketplaceServiceItemDeliveryKGT: "logistics",
  // Последняя миля
  MarketplaceServiceItemDelivToCustomer: "lastMile",
  MarketplaceServiceItemRedistributionLastMileCourier: "lastMile",
  // Обратная логистика и обработка возвратов/невыкупов
  MarketplaceServiceItemReturnFlowTrans: "returnLogistics",
  MarketplaceServiceItemReturnFlowLogistic: "returnLogistics",
  MarketplaceServiceItemReturnAfterDelivToCustomer: "returnLogistics",
  MarketplaceServiceItemReturnNotDelivToCustomer: "returnLogistics",
  MarketplaceServiceItemReturnPartGoodsCustomer: "returnLogistics",
  MarketplaceServiceItemReturnFromStock: "returnLogistics",
  MarketplaceServiceItemRedistributionReturnsPVZ: "returnLogistics",
  // Продвижение
  MarketplaceServiceItemElectronicServiceStencil: "advertising",
  MarketplaceServiceItemElectronicServicesPromotionInSearch: "advertising",
  MarketplaceServiceItemElectronicServicesBrandShelf: "advertising",
  MarketplaceServiceItemInternetSiteAdvertising: "advertising",
  MarketplaceServiceItemMarketingServices: "advertising",
  MarketplaceServiceItemOtherElectronicServices: "advertising",
  // Прочие услуги
  MarketplaceServiceItemSubscribtionPremium: "other",
  MarketplaceServiceItemFlexiblePaymentSchedule: "other",
  MarketplaceServiceItemInstallment: "other",
  MarketplaceServiceItemMarkingItems: "other",
  MarketplaceServiceItemTechnicalServicesAndOtherServices: "other",
};

/** Категория услуги по имени сервиса; null — сервис не распознан */
export function classifyService(name: string): ExpenseCategory | null {
  const exact = SERVICE_CATEGORIES[name];
  if (exact) return exact;
  // Подстраховка на подстроках для новых вариантов имён того же смысла
  if (name.includes("Acquiring")) return "acquiring";
  if (name.includes("Penalty") || name.includes("Fine")) return "penalty";
  if (name.includes("Return")) return "returnLogistics";
  if (name.includes("DelivToCustomer") || name.includes("LastMile")) {
    return "lastMile";
  }
  if (
    name.includes("Logistic") ||
    name.includes("DirectFlow") ||
    name.includes("Dropoff") ||
    name.includes("Fulfillment")
  ) {
    return "logistics";
  }
  if (name.includes("Stencil") || name.includes("Promotion") || name.includes("Marketing")) {
    return "advertising";
  }
  return null;
}

/**
 * Тип операции → категория, в которую относится нераспределённый остаток
 * операции. Источники имён: enum'ы swagger.json и фактические значения
 * operation_type из ответов /v3/finance/transaction/list.
 */
const OPERATION_TYPE_CATEGORIES: Record<string, ExpenseCategory> = {
  MarketplaceRedistributionOfAcquiringOperation: "acquiring",
  MarketplaceServiceBrandCommission: "advertising",
  CustomerReviews: "other",
  OperationSubscriptionPremiumLite: "other",
  OperationMarketplaceServiceEarlyPaymentAccrual: "other",
  MarketplaceSellerDecompensationItemByTypeDocOperation: "other",
  OperationMarketplaceItemTemporaryStorageRedistribution: "storage",
  DisposalReasonFailedToPickupOnTime: "other",
  DisposalOfGoods: "other",
  OperationMarketplacePackageRedistribution: "other",
  OperationMarketplacePackageMaterialsProvision: "other",
  SellerReturnsDeliveryToPickupPoint: "returnLogistics",
  OperationElectronicServiceStencil: "advertising",
  OperationElectronicServicesPromotionInSearch: "advertising",
  OperationMarketplaceServiceItemElectronicServicesBrandShelf: "advertising",
  MarketplaceMarketingActionCostOperation: "advertising",
  OperationMarketplaceServiceStorage: "storage",
  OperationMarketplaceCrossDockServiceWriteOff: "logistics",
  ClientReturnAgentOperation: "returnLogistics",
  OperationReturnGoodsFBSofRMS: "returnLogistics",
  OperationItemReturn: "returnLogistics",
  MarketplaceSellerReexposureDeliveryReturnOperation: "returnLogistics",
  MarketplaceSellerShippingCompensationReturnOperation: "returnLogistics",
  OperationSubscriptionPremium: "other",
  OperationMarketplaceServicePremiumCashback: "other",
  MarketplaceSaleReviewsOperation: "other",
  OperationClaim: "other",
  OperationCorrectionSeller: "other",
  MarketplaceSellerCorrectionOperation: "other",
  OperationSetOff: "other",
  MarketplaceSellerCompensationOperation: "other",
  MarketplaceSellerCompensationLossOfGoodsOperation: "other",
  OperationDefectiveWriteOff: "other",
  OperationLackWriteOff: "other",
  OperationMarketplaceWithHoldingForUndeliverableGoods: "other",
  OperationMarketplaceAgencyFeeAggregator3PLGlobal: "logistics",
};

/**
 * Русское название типа (operation_type_name) → категория.
 * Словарь — из эталонной таблицы («5. Расчет ЧП», «Расшифровка (технич лист)»);
 * страхует случаи, когда operation_type отсутствует в словаре выше.
 */
const OPERATION_NAME_CATEGORIES: Record<string, ExpenseCategory> = {
  "Оплата эквайринга": "acquiring",
  "Оплата за клик": "advertising",
  "Трафареты": "advertising",
  "Вывод в топ": "advertising",
  "Продвижение в поиске": "advertising",
  "Продвижение с оплатой за заказ": "advertising",
  "Продвижение бренда": "advertising",
  "Иные электронные услуги": "advertising",
  "Услуга продвижения Бонусы продавца": "advertising",
  "Услуга размещения товаров на складе": "storage",
  "Начисление за хранение/утилизацию возвратов": "storage",
  "Временное размещение товара партнерами": "storage",
  "Кросс-докинг": "logistics",
  "Доставка товаров на склад Ozon (кросс-докинг)": "logistics",
  "Обработка товара в составе грузоместа на FBO": "logistics",
  "Получение возврата, отмены, невыкупа от покупателя": "returnLogistics",
  "Доставка покупателю — отмена начисления": "returnLogistics",
  "Доставка и обработка возврата, отмены, невыкупа": "returnLogistics",
  "Вывоз товара со Склада силами Ozon: Доставка до ПВЗ": "returnLogistics",
  "Подписка Управление отзывами": "other",
  "Приобретение отзывов на платформе": "other",
  "Подписка Premium Lite": "other",
  "Premium-подписка": "other",
  "Подписка Premium Plus": "other",
  "Услуга досрочной выплаты": "other",
  "Начисление за гибкий график выплат": "other",
  "Декомпенсации и возвращение товаров на сток": "other",
  "Утилизация": "other",
  "Утилизация товара": "other",
  "Утилизация товара: Вы не забрали в срок": "other",
  "Списание по утилизации в доставке": "other",
  "Упаковка товара партнёрами": "other",
  "Обеспечение материалами для упаковки товара": "other",
  "Начисления по претензиям": "other",
  "Ozon Рассрочка": "other",
};

/**
 * Категория для нераспределённого остатка операции;
 * null — тип неизвестен, остаток должен уйти в «unclassified».
 */
export function classifyOperation(
  operationType: string,
  operationTypeName: string | null | undefined,
): ExpenseCategory | null {
  const byType = OPERATION_TYPE_CATEGORIES[operationType];
  if (byType) return byType;
  if (operationTypeName) {
    const byName = OPERATION_NAME_CATEGORIES[operationTypeName];
    if (byName) return byName;
  }
  if (operationType.includes("Penalty") || operationType.includes("Fine")) {
    return "penalty";
  }
  if (operationType.includes("Acquiring")) return "acquiring";
  if (operationType.includes("Return") || operationType.includes("NotDelivered")) {
    return "returnLogistics";
  }
  return null;
}
