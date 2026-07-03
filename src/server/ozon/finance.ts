import {
  classifyOperation,
  classifyService,
  type ExpenseCategory,
} from "@/lib/analytics/operation-classifier";
import { ozonRequest, type OzonCredentials } from "./client";
import {
  financeTransactionListResponseSchema,
  type OzonFinanceOperation,
} from "./schemas";

export type NormalizedOzonOperation = {
  ozonOperationId: string;
  operationDate: Date;
  operationType: string;
  operationTypeName: string | null;
  sku: string | null;
  offerId: string | null;
  productName: string | null;
  quantity: number;
  amount: number;
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
  unclassified: number;
  raw: OzonFinanceOperation;
};

const PAGE_SIZE = 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Ozon ограничивает период запроса транзакций одним месяцем */
const CHUNK_DAYS = 28;

/**
 * Разложение операции Ozon на поля нашей модели по словарю категорий
 * (перенесён из эталонной Excel-таблицы, лист «Расшифровка (технич лист)»).
 * Инвариант: amount − все расходы === итоговая сумма операции Ozon (op.amount);
 * нераспознанный остаток попадает в unclassified — деньги не теряются
 * (аналог строки «НЕ РАСШИФРОВАННЫЕ НАЧИСЛЕНИЯ» в Excel).
 */
export function normalizeOzonOperation(
  op: OzonFinanceOperation,
): NormalizedOzonOperation {
  const revenue = op.accruals_for_sale > 0 ? op.accruals_for_sale : 0;

  const deductions: Record<ExpenseCategory, number> = {
    commission: 0,
    logistics: 0,
    lastMile: 0,
    returnLogistics: 0,
    acquiring: 0,
    advertising: 0,
    storage: 0,
    penalty: 0,
    other: 0,
  };
  // Возвраты выручки: отрицательные начисления за продажу
  const returnAmount = op.accruals_for_sale < 0 ? -op.accruals_for_sale : 0;
  let unclassified = 0;

  // Категория самой операции — используется и для остатка,
  // и как запасной вариант для нераспознанных сервисов
  const operationCategory = classifyOperation(
    op.operation_type,
    op.operation_type_name,
  );

  // Комиссия за продажу (при возврате Ozon возвращает комиссию — значение уменьшится)
  deductions.commission += -op.sale_commission;
  deductions.logistics += -op.delivery_charge;
  deductions.returnLogistics += -op.return_delivery_charge;

  for (const service of op.services) {
    const category = classifyService(service.name) ?? operationCategory;
    if (category) deductions[category] += -service.price;
    else unclassified += -service.price;
  }

  // Сверка с фактическим итогом операции: остаток — по типу операции
  const accountedNet =
    revenue -
    returnAmount -
    unclassified -
    Object.values(deductions).reduce((sum, value) => sum + value, 0);
  const residual = accountedNet - op.amount;
  if (Math.abs(residual) > 0.005) {
    if (operationCategory) deductions[operationCategory] += residual;
    else unclassified += residual;
  }

  // В транзакциях Ozon нет количества единиц: считаем 1 доставку = 1 продажа
  let quantity = 0;
  if (op.operation_type === "OperationAgentDeliveredToCustomer") quantity = 1;
  if (op.operation_type === "ClientReturnAgentOperation") quantity = -1;

  const item = op.items[0];

  return {
    ozonOperationId: String(op.operation_id),
    // Дата приходит в формате "YYYY-MM-DD HH:mm:ss"
    operationDate: new Date(`${op.operation_date.replace(" ", "T")}Z`),
    operationType: op.operation_type,
    operationTypeName: op.operation_type_name || null,
    sku: item?.sku != null ? String(item.sku) : null,
    offerId: null,
    productName: item?.name || null,
    quantity,
    amount: revenue,
    commission: deductions.commission,
    logistics: deductions.logistics,
    lastMile: deductions.lastMile,
    returnLogistics: deductions.returnLogistics,
    acquiring: deductions.acquiring,
    advertising: deductions.advertising,
    storage: deductions.storage,
    returnAmount,
    penalty: deductions.penalty,
    otherDeduction: deductions.other,
    unclassified,
    raw: op,
  };
}

async function fetchChunk(
  credentials: OzonCredentials,
  from: Date,
  to: Date,
): Promise<NormalizedOzonOperation[]> {
  const operations: NormalizedOzonOperation[] = [];
  let page = 1;

  for (;;) {
    const response = financeTransactionListResponseSchema.parse(
      await ozonRequest({
        endpoint: "/v3/finance/transaction/list",
        body: {
          filter: {
            date: { from: from.toISOString(), to: to.toISOString() },
            transaction_type: "all",
          },
          page,
          page_size: PAGE_SIZE,
        },
        credentials,
      }),
    );

    operations.push(...response.result.operations.map(normalizeOzonOperation));
    if (page >= response.result.page_count) break;
    page += 1;
  }

  return operations;
}

/** Операции за период; период режется на куски ≤28 дней (лимит Ozon — месяц) */
export async function fetchOzonOperations(
  credentials: OzonCredentials,
  dateFrom: Date,
  dateTo: Date,
): Promise<NormalizedOzonOperation[]> {
  const operations: NormalizedOzonOperation[] = [];

  let cursor = dateFrom.getTime();
  while (cursor < dateTo.getTime()) {
    const chunkEnd = Math.min(cursor + CHUNK_DAYS * DAY_MS, dateTo.getTime());
    operations.push(
      ...(await fetchChunk(credentials, new Date(cursor), new Date(chunkEnd))),
    );
    cursor = chunkEnd + 1;
  }

  return operations;
}
