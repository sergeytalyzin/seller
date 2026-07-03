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
  acquiring: number;
  returnAmount: number;
  penalty: number;
  otherDeduction: number;
  raw: OzonFinanceOperation;
};

const PAGE_SIZE = 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Ozon ограничивает период запроса транзакций одним месяцем */
const CHUNK_DAYS = 28;

type DeductionKind = "acquiring" | "logistics" | "return" | "penalty" | "other";

/** Категория услуги по имени из enum OperationService.name (swagger) */
function classifyService(name: string): DeductionKind {
  if (name.includes("Acquiring")) return "acquiring";
  if (name.includes("NotDelivered") || name.includes("Return")) return "return";
  if (
    name.includes("Logistic") ||
    name.includes("LastMile") ||
    name.includes("Deliv") ||
    name.includes("Flow") ||
    name.includes("Drop")
  ) {
    return "logistics";
  }
  if (name.includes("Penalty") || name.includes("Fine")) return "penalty";
  return "other";
}

function classifyOperationType(operationType: string): DeductionKind {
  if (operationType.includes("Penalty") || operationType.includes("Fine")) {
    return "penalty";
  }
  if (operationType.includes("Return") || operationType.includes("NotDelivered")) {
    return "return";
  }
  if (operationType.includes("Acquiring")) return "acquiring";
  return "other";
}

/**
 * Разложение операции Ozon на поля нашей модели.
 * Инвариант: amount − все расходы === итоговая сумма операции Ozon (op.amount);
 * неразобранный остаток относится к категории по типу операции — деньги не теряются.
 */
function normalize(op: OzonFinanceOperation): NormalizedOzonOperation {
  const revenue = op.accruals_for_sale > 0 ? op.accruals_for_sale : 0;

  const deductions: Record<DeductionKind, number> = {
    acquiring: 0,
    logistics: 0,
    return: op.accruals_for_sale < 0 ? -op.accruals_for_sale : 0,
    penalty: 0,
    other: 0,
  };

  // Комиссия за продажу (при возврате Ozon возвращает комиссию — значение уменьшится)
  const commission = -op.sale_commission;

  deductions.logistics += -op.delivery_charge;
  deductions.return += -op.return_delivery_charge;

  for (const service of op.services) {
    deductions[classifyService(service.name)] += -service.price;
  }

  // Сверка с фактическим итогом операции: остаток — в категорию по типу операции
  const accountedNet =
    revenue -
    commission -
    deductions.acquiring -
    deductions.logistics -
    deductions.return -
    deductions.penalty -
    deductions.other;
  const residual = accountedNet - op.amount;
  if (Math.abs(residual) > 0.005) {
    deductions[classifyOperationType(op.operation_type)] += residual;
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
    commission,
    logistics: deductions.logistics,
    acquiring: deductions.acquiring,
    returnAmount: deductions.return,
    penalty: deductions.penalty,
    otherDeduction: deductions.other,
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

    operations.push(...response.result.operations.map(normalize));
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
