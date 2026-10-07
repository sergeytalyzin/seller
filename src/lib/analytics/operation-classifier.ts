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

/**
 * Тип начисления /v1/finance/accrual/* → категория расхода.
 * Имена — из справочника /v1/finance/accrual/types (132 типа);
 * метод пришёл на смену отключённому /v3/finance/transaction/list,
 * где категории определялись по именам MarketplaceServiceItem*.
 * Чего нет в словаре — попадает в unclassified, деньги не теряются.
 */
const ACCRUAL_TYPE_CATEGORIES: Record<string, ExpenseCategory> = {
  // Комиссия за продажу и её корректировки
  SaleCommission: "commission",
  CorrectionCommission: "commission",
  ClaimCommission: "commission",
  RfbsServiceFee: "commission",
  RfbsDomesticAgentFee: "commission",
  RfbsGlobalAgentFee: "commission",

  // Эквайринг
  Acquiring: "acquiring",

  // Прямая логистика: магистраль, сборка, упаковка, приёмка поставки
  Logistic: "logistics",
  Fulfillment: "logistics",
  CrossDock: "logistics",
  CrossDockPickUpCourierDelivery: "logistics",
  "Drop-Off": "logistics",
  "Drop-Off Agent": "logistics",
  "B2C Drop-Off": "logistics",
  "B2C Drop-Off Agent": "logistics",
  Shipment: "logistics",
  PackageCost: "logistics",
  PackingFee: "logistics",
  ItemPacking: "logistics",
  ItemSealing: "logistics",
  PackmanCisPacking: "logistics",
  PackageUnitProcessing: "logistics",
  B2CContainerPacking: "logistics",
  B2CContainerPackage: "logistics",
  B2CLogistics: "logistics",
  "Pick-Up": "logistics",
  PickUpCourierArrangement: "logistics",
  PickUpCourierDelivery: "logistics",
  CourierPickUpByOzon: "logistics",
  CourierPickUpReinvoice: "logistics",
  SupplyInbound: "logistics",
  Replenishment: "logistics",
  QuantProcessingDrop: "logistics",
  VolumeWeightCharacteristicsProcessing: "logistics",
  OversizedExtraHandling: "logistics",
  InternationalLogisticDelta: "logistics",
  OzonGlobalLogisticsDelivery: "logistics",
  MicroFulfillmentSupply: "logistics",
  MicroFulfillmentPicking: "logistics",
  Marking: "logistics",
  LabelOriginal: "logistics",

  // Последняя миля
  LastMile: "lastMile",
  LastMileCourier: "lastMile",
  LastMilePickUpPoint: "lastMile",
  DeliveryToHandoverPlaceByOzon: "lastMile",
  B2CDeliveryToHandoverPlaceByOzon: "lastMile",
  B2CCourierClientReinvoice: "lastMile",
  B2CPickUpPointClientReinvoice: "lastMile",
  ClickAndCollect: "lastMile",
  RfbsBuyerDelivery: "lastMile",
  RfbsClientDeliveryCharge: "lastMile",
  RfbsDomesticDelivery: "lastMile",
  RfbsGlobalDelivery: "lastMile",

  // Обратная логистика, возвраты, отмены, утилизация
  BackwardShipment: "returnLogistics",
  B2CBackwardLogistics: "returnLogistics",
  ClientReturn: "returnLogistics",
  SellerReturns: "returnLogistics",
  PartialReturn: "returnLogistics",
  PreparingToReturn: "returnLogistics",
  ReturnFlowLogistic: "returnLogistics",
  ReturnStorageInTheWarehouse: "returnLogistics",
  PickUpPointReturnAcceptance: "returnLogistics",
  B2CPickUpPointReturnAcceptance: "returnLogistics",
  RfbsEasyReturn: "returnLogistics",
  Cancellation: "returnLogistics",
  Disposal: "returnLogistics",
  B2CDisposal: "returnLogistics",

  // Продвижение
  PayPerClick: "advertising",
  Promotion: "advertising",
  BrandPromotion: "advertising",
  BrandCommission: "advertising",
  BrandShelf: "advertising",
  BrandDeposit: "advertising",
  Stencil: "advertising",
  ExternalPromotion: "advertising",
  InternetSiteAdvertising: "advertising",
  SocialMediaAdvertising: "advertising",
  DisplayAdvertisingPlacement: "advertising",
  Marketing: "advertising",
  PushCampaign: "advertising",
  LeadGeneration: "advertising",
  VideoCover: "advertising",
  PremiumMailingCommission: "advertising",
  PremiumCashbackPromotion: "advertising",
  PremiumCashbackIndividualPoints: "advertising",
  PointsForReviews: "advertising",
  SaleReview: "advertising",
  ReviewsPin: "advertising",
  AcceleratedReviewCollection: "advertising",
  FirstCustomerReview: "advertising",
  CustomerChatPoints: "advertising",
  LabelBrandVerified: "advertising",

  // Хранение и размещение
  TemporaryPlacement: "storage",
  TemporaryPlacementsAgent: "storage",
  B2CTemporaryPlacement: "storage",
  Placements: "storage",
  StockInsurance: "storage",

  // Штрафы
  DefectRate: "penalty",
  DefectFineModeration: "penalty",
  DefectFineProhibitedGoods: "penalty",
  DefectFineCounterfeitGoods: "penalty",
  DefectFineComplaint: "penalty",
  DefectFineErrors: "penalty",
  DefectFineShipmentDelayRate: "penalty",

  // Прочие услуги и подписки
  PremiumMembership: "other",
  PremiumSubscription: "other",
  StarsMembership: "other",
  AnalyticsLite: "other",
  AnalyticsPremium: "other",
  AnalyticsPlus: "other",
  AnalyticsPro: "other",
  AnalyticsCorrection: "other",
  EarlyPayment: "other",
  FlexiblePayments: "other",
  Installment: "other",
  KazakhstanBuyerInstallment: "other",
  ItemCloning: "other",
  ItemCompensation: "other",
  Compensation: "other",
  B2CInsuranceCompensation: "other",
  B2CInsuranceShipping: "other",
  Moderation: "other",
  OzonData: "other",
  SetOff: "other",
  RealizationReportCorrection: "other",
  IncreaseAssortmentLimit: "other",
  VolumeObligationReward: "other",
  OrdersBooking: "other",
  Charity: "other",
  CustomerReviews: "other",
  RfbsGlobalIntermediaryService: "other",
  RfbsGlobalPlatformConnectionService: "other",
};

/** Категория начисления по имени типа; null — тип не распознан */
export function classifyAccrualType(name: string): ExpenseCategory | null {
  return ACCRUAL_TYPE_CATEGORIES[name] ?? null;
}
