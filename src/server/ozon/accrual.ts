import {
  classifyAccrualType,
  type ExpenseCategory,
} from "@/lib/analytics/operation-classifier";
import { OzonApiError, ozonRequest, type OzonCredentials } from "./client";
import {
  accrualByDayResponseSchema,
  accrualTypesResponseSchema,
  type OzonAccrual,
} from "./schemas";
import type { NormalizedOzonOperation } from "./finance";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Страховка от зацикливания на пагинации by-day */
const MAX_PAGES_PER_DAY = 100;
/** Сколько дней периода тянем одновременно: by-day даёт один день за запрос */
const DAY_CONCURRENCY = 5;
/** Ozon отвечает 429 при частых запросах — ждём и повторяем */
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRateLimitRetry<T>(request: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const isRateLimit = error instanceof OzonApiError && error.status === 429;
      if (!isRateLimit || attempt >= RETRY_DELAYS_MS.length) throw error;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

/** Справочник типов начислений: id → имя (например, 69 → SaleCommission) */
export async function fetchAccrualTypes(
  credentials: OzonCredentials,
): Promise<Map<number, string>> {
  const response = accrualTypesResponseSchema.parse(
    await ozonRequest({ endpoint: "/v1/finance/accrual/types", body: {}, credentials }),
  );
  return new Map(response.accrual_types.map((t) => [t.id, t.name]));
}

function emptyDeductions(): Record<ExpenseCategory, number> {
  return {
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
}

/**
 * Строка нашей модели из начисления Ozon.
 * Расходы храним положительными числами, как и в прежней схеме:
 * Ozon отдаёт удержания отрицательными, поэтому меняем знак.
 */
function makeRow(params: {
  ozonOperationId: string;
  date: Date;
  operationType: string;
  operationTypeName: string | null;
  sku: string | null;
  quantity: number;
  amount: number;
  returnAmount: number;
  deductions: Record<ExpenseCategory, number>;
  unclassified: number;
  raw: OzonAccrual;
}): NormalizedOzonOperation {
  const { deductions } = params;
  return {
    ozonOperationId: params.ozonOperationId,
    operationDate: params.date,
    operationType: params.operationType,
    operationTypeName: params.operationTypeName,
    sku: params.sku,
    offerId: null,
    productName: null,
    quantity: params.quantity,
    amount: params.amount,
    commission: deductions.commission,
    logistics: deductions.logistics,
    lastMile: deductions.lastMile,
    returnLogistics: deductions.returnLogistics,
    acquiring: deductions.acquiring,
    advertising: deductions.advertising,
    storage: deductions.storage,
    returnAmount: params.returnAmount,
    penalty: deductions.penalty,
    otherDeduction: deductions.other,
    unclassified: params.unclassified,
    raw: params.raw,
  };
}

/** Разносит одно начисление по категориям; расход — положительное число */
function applyFee(
  deductions: Record<ExpenseCategory, number>,
  typeName: string | null,
  accrued: number,
): number {
  const category = typeName ? classifyAccrualType(typeName) : null;
  if (!category) return -accrued; // в unclassified
  deductions[category] += -accrued;
  return 0;
}

/**
 * Начисление Ozon → строки нашей модели.
 *
 * - POSTING — продажа: по строке на товар, выручка из commission.sale_amount,
 *   удержания из commission.commission и delivery.services;
 * - ITEM — услуги с привязкой к товару (item_fees);
 * - NON_ITEM / контейнер — услуги без привязки к товару.
 *
 * Инвариант прежней модели сохранён: сумма (выручка − все расходы) по строкам
 * равна total_amount начисления, расхождение уходит в unclassified отдельной
 * строкой — деньги не теряются.
 */
export function normalizeAccrual(
  accrual: OzonAccrual,
  typeNames: Map<number, string>,
): NormalizedOzonOperation[] {
  const date = new Date(`${accrual.date}T00:00:00Z`);
  const typeName = (id: number | null | undefined) =>
    id != null ? (typeNames.get(id) ?? null) : null;
  const rows: NormalizedOzonOperation[] = [];
  let accountedNet = 0;

  const products = accrual.posting?.products ?? [];
  for (const [index, product] of products.entries()) {
    const deductions = emptyDeductions();
    let unclassified = 0;

    const saleAmount = product.commission?.sale_amount ?? 0;
    const amount = saleAmount > 0 ? saleAmount : 0;
    const returnAmount = saleAmount < 0 ? -saleAmount : 0;

    deductions.commission += -(product.commission?.commission ?? 0);
    for (const service of product.delivery?.services ?? []) {
      unclassified += applyFee(deductions, typeName(service.type_id), service.accrued);
    }

    // Единицы считаем только там, где есть продажа или возврат: по одному
    // отправлению Ozon шлёт ещё и сервисные начисления (sale_amount = 0),
    // они несут quantity, но товар в них не продан — иначе задваивается
    // проданное количество и, следом, себестоимость.
    const quantity =
      saleAmount > 0
        ? product.quantity
        : saleAmount < 0
          ? -product.quantity
          : 0;
    const net =
      amount -
      returnAmount -
      unclassified -
      Object.values(deductions).reduce((sum, value) => sum + value, 0);
    accountedNet += net;

    rows.push(
      makeRow({
        ozonOperationId: `${accrual.accrual_id}-p${index}`,
        date,
        operationType: "AccrualPosting",
        operationTypeName: accrual.unit_number ?? null,
        sku: product.sku != null ? String(product.sku) : null,
        quantity,
        amount,
        returnAmount,
        deductions,
        unclassified,
        raw: accrual,
      }),
    );
  }

  // Услуги с привязкой к товару
  for (const [index, item] of (accrual.item_fees?.fees ?? []).entries()) {
    const deductions = emptyDeductions();
    let unclassified = 0;
    const names: string[] = [];

    for (const fee of item.fees) {
      const name = typeName(fee.type_id);
      if (name) names.push(name);
      unclassified += applyFee(deductions, name, fee.accrued);
    }

    const net =
      -unclassified - Object.values(deductions).reduce((sum, value) => sum + value, 0);
    accountedNet += net;

    rows.push(
      makeRow({
        ozonOperationId: `${accrual.accrual_id}-i${index}`,
        date,
        operationType: "AccrualItem",
        operationTypeName: names.join(", ") || null,
        sku: item.sku != null ? String(item.sku) : null,
        quantity: 0,
        amount: 0,
        returnAmount: 0,
        deductions,
        unclassified,
        raw: accrual,
      }),
    );
  }

  // Услуги без привязки к товару: по продавцу и по контейнеру
  const flatFees = [
    ...(accrual.non_item_fee ? [accrual.non_item_fee] : []),
    ...(accrual.container_fees?.fees ?? []),
  ];
  if (flatFees.length > 0) {
    const deductions = emptyDeductions();
    let unclassified = 0;
    const names: string[] = [];

    for (const fee of flatFees) {
      const name = typeName(fee.type_id);
      if (name) names.push(name);
      unclassified += applyFee(deductions, name, fee.accrued);
    }

    const net =
      -unclassified - Object.values(deductions).reduce((sum, value) => sum + value, 0);
    accountedNet += net;

    rows.push(
      makeRow({
        ozonOperationId: `${accrual.accrual_id}-n`,
        date,
        operationType: "AccrualNonItem",
        operationTypeName: names.join(", ") || null,
        sku: null,
        quantity: 0,
        amount: 0,
        returnAmount: 0,
        deductions,
        unclassified,
        raw: accrual,
      }),
    );
  }

  // Сверка с итогом начисления: расхождение не прячем, а показываем явно
  const residual = accrual.total_amount - accountedNet;
  if (Math.abs(residual) > 0.005) {
    rows.push(
      makeRow({
        ozonOperationId: `${accrual.accrual_id}-r`,
        date,
        operationType: "AccrualResidual",
        operationTypeName: accrual.accrued_category || null,
        sku: null,
        quantity: 0,
        amount: 0,
        returnAmount: 0,
        deductions: emptyDeductions(),
        unclassified: -residual,
        raw: accrual,
      }),
    );
  }

  return rows;
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Начисления за один день; by-day листается через last_id */
async function fetchDay(
  credentials: OzonCredentials,
  day: string,
): Promise<OzonAccrual[]> {
  const accruals: OzonAccrual[] = [];
  let lastId = "";

  for (let page = 0; page < MAX_PAGES_PER_DAY; page += 1) {
    const response = accrualByDayResponseSchema.parse(
      await withRateLimitRetry(() =>
        ozonRequest({
          endpoint: "/v1/finance/accrual/by-day",
          body: { date: day, last_id: lastId },
          credentials,
        }),
      ),
    );
    accruals.push(...response.accruals);
    if (!response.last_id) break;
    lastId = response.last_id;
  }

  return accruals;
}

/**
 * Операции за период из /v1/finance/accrual/by-day.
 * Метод работает по одному дню, поэтому период обходим посуточно —
 * пачками по DAY_CONCURRENCY, иначе 90 дней не укладываются в лимит функции.
 */
export async function fetchOzonAccruals(
  credentials: OzonCredentials,
  dateFrom: Date,
  dateTo: Date,
): Promise<NormalizedOzonOperation[]> {
  const typeNames = await fetchAccrualTypes(credentials);

  const start = new Date(`${toIsoDay(dateFrom)}T00:00:00Z`).getTime();
  const end = new Date(`${toIsoDay(dateTo)}T00:00:00Z`).getTime();

  const days: string[] = [];
  for (let t = start; t <= end; t += DAY_MS) {
    days.push(toIsoDay(new Date(t)));
  }

  // Результат раскладываем по индексу дня, чтобы порядок не зависел от гонки
  const perDay: OzonAccrual[][] = new Array(days.length);
  let next = 0;

  await Promise.all(
    Array.from({ length: Math.min(DAY_CONCURRENCY, days.length) }, async () => {
      for (let index = next++; index < days.length; index = next++) {
        perDay[index] = await fetchDay(credentials, days[index]);
      }
    }),
  );

  const operations: NormalizedOzonOperation[] = [];
  for (const accruals of perDay) {
    for (const accrual of accruals) {
      operations.push(...normalizeAccrual(accrual, typeNames));
    }
  }

  return operations;
}
