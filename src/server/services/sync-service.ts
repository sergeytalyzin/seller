import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { OzonApiError, type OzonCredentials } from "@/server/ozon/client";
import { fetchOzonProducts } from "@/server/ozon/products";
import { normalizeOzonOperation } from "@/server/ozon/finance";
import {
  fetchAccrualTypes,
  fetchOzonAccruals,
  normalizeAccrual,
} from "@/server/ozon/accrual";
import { fetchOzonFboPostings } from "@/server/ozon/postings";
import { fetchOzonStocksSummary } from "@/server/ozon/stocks";
import { accrualSchema, financeOperationSchema } from "@/server/ozon/schemas";
import {
  fetchCpcSkuDaily,
  fetchPerformanceCampaigns,
  fetchSearchPromoOrders,
  MAX_REPORT_DAYS,
  type AdSpendRow,
  type PerformanceCredentials,
} from "@/server/performance/client";

export type SyncResult = {
  success: boolean;
  productsCreated: number;
  productsUpdated: number;
  operationsCreated: number;
  operationsUpdated: number;
  postingsCreated: number;
  postingsUpdated: number;
  errors: string[];
};

const emptyResult = (): SyncResult => ({
  success: true,
  productsCreated: 0,
  productsUpdated: 0,
  operationsCreated: 0,
  operationsUpdated: 0,
  postingsCreated: 0,
  postingsUpdated: 0,
  errors: [],
});

async function getCredentials(storeId: string): Promise<OzonCredentials> {
  const settings = await db.ozonSettings.findUnique({ where: { storeId } });
  if (!settings) {
    throw new OzonApiError(
      "Сначала укажите Client ID и API Key в настройках Ozon",
      400,
    );
  }
  return { clientId: settings.clientId, apiKey: settings.apiKey };
}

export async function syncProducts(storeId: string): Promise<SyncResult> {
  const result = emptyResult();
  const credentials = await getCredentials(storeId);
  const products = await fetchOzonProducts(credentials);

  const existing = await db.product.findMany({
    where: { storeId },
    select: { offerId: true },
  });
  const existingOffers = new Set(existing.map((p) => p.offerId));

  for (const product of products) {
    const data = {
      ozonProductId: product.ozonProductId,
      sku: product.sku,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      oldPrice: product.oldPrice,
      currency: product.currency,
      isArchived: product.isArchived,
      raw: product.raw as unknown as Prisma.InputJsonValue,
    };

    await db.product.upsert({
      where: { storeId_offerId: { storeId, offerId: product.offerId } },
      update: data,
      create: { ...data, storeId, offerId: product.offerId },
    });

    if (existingOffers.has(product.offerId)) result.productsUpdated += 1;
    else result.productsCreated += 1;
  }

  return result;
}

export async function syncFinanceOperations(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<SyncResult> {
  const result = emptyResult();
  const credentials = await getCredentials(storeId);
  const operations = await fetchOzonAccruals(credentials, dateFrom, dateTo);

  // Связь операция → товар по SKU
  const products = await db.product.findMany({
    where: { storeId, sku: { not: null } },
    select: { id: true, sku: true, offerId: true },
  });
  const productBySku = new Map(products.map((p) => [p.sku as string, p]));

  // Перезаливаем период целиком: начисления Ozon уточняет задним числом,
  // а в окне могут лежать строки старого формата из отключённого
  // /v3/finance/transaction/list — иначе они задвоят суммы.
  const windowFrom = new Date(`${dateFrom.toISOString().slice(0, 10)}T00:00:00Z`);
  const windowTo = new Date(`${dateTo.toISOString().slice(0, 10)}T23:59:59.999Z`);
  const removed = await db.financeOperation.deleteMany({
    where: { storeId, operationDate: { gte: windowFrom, lte: windowTo } },
  });
  if (removed.count > 0) {
    console.info(
      `syncFinanceOperations ${storeId}: перезалив ${removed.count} строк за период`,
    );
  }

  const seen = new Set<string>();
  const newOperations = operations.filter((op) => {
    if (seen.has(op.ozonOperationId)) return false;
    seen.add(op.ozonOperationId);
    return true;
  });

  const created = await db.financeOperation.createMany({
    data: newOperations.map((op) => {
      const product = op.sku ? productBySku.get(op.sku) : undefined;
      return {
        storeId,
        productId: product?.id ?? null,
        ozonOperationId: op.ozonOperationId,
        operationDate: op.operationDate,
        operationType: op.operationType,
        operationTypeName: op.operationTypeName,
        sku: op.sku,
        offerId: product?.offerId ?? null,
        productName: op.productName,
        quantity: op.quantity,
        amount: op.amount,
        commission: op.commission,
        logistics: op.logistics,
        lastMile: op.lastMile,
        returnLogistics: op.returnLogistics,
        acquiring: op.acquiring,
        advertising: op.advertising,
        storage: op.storage,
        returnAmount: op.returnAmount,
        penalty: op.penalty,
        otherDeduction: op.otherDeduction,
        unclassified: op.unclassified,
        raw: op.raw as unknown as Prisma.InputJsonValue,
      };
    }),
    skipDuplicates: true,
  });

  result.operationsCreated = created.count;
  return result;
}

/**
 * Пересчёт одной сохранённой строки из её raw.
 * raw бывает двух видов: начисление нового API (одно начисление даёт
 * несколько строк, нужную находим по ozonOperationId) и операция
 * отключённого /v3/finance/transaction/list.
 */
function renormalize(
  ozonOperationId: string,
  raw: unknown,
  typeNames: Map<number, string>,
) {
  const accrual = accrualSchema.safeParse(raw);
  if (accrual.success) {
    return normalizeAccrual(accrual.data, typeNames).find(
      (op) => op.ozonOperationId === ozonOperationId,
    );
  }

  const legacy = financeOperationSchema.safeParse(raw);
  return legacy.success ? normalizeOzonOperation(legacy.data) : undefined;
}

/**
 * Переразложение сохранённых операций по категориям из raw-ответа Ozon.
 * Нужно после изменения словаря категорий: старые строки в БД остаются
 * с прежней разбивкой, пока их не пересчитать.
 */
export async function recategorizeFinanceOperations(
  storeId: string,
): Promise<number> {
  const operations = await db.financeOperation.findMany({
    where: { storeId, raw: { not: Prisma.JsonNull } },
    select: { id: true, ozonOperationId: true, raw: true },
  });

  // Начисления нового API раскладываются по справочнику типов
  const credentials = await getCredentials(storeId);
  const typeNames = await fetchAccrualTypes(credentials);

  let updated = 0;
  const BATCH = 25;
  for (let i = 0; i < operations.length; i += BATCH) {
    const batch = operations.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (row) => {
        const op = renormalize(row.ozonOperationId, row.raw, typeNames);
        if (!op) return;
        await db.financeOperation.update({
          where: { id: row.id },
          data: {
            amount: op.amount,
            commission: op.commission,
            logistics: op.logistics,
            lastMile: op.lastMile,
            returnLogistics: op.returnLogistics,
            acquiring: op.acquiring,
            advertising: op.advertising,
            storage: op.storage,
            returnAmount: op.returnAmount,
            penalty: op.penalty,
            otherDeduction: op.otherDeduction,
            unclassified: op.unclassified,
          },
        });
        updated += 1;
      }),
    );
  }

  return updated;
}

/**
 * Ежедневный снимок остатков FBO по всем товарам магазина —
 * основа расчёта скорости продаж без дней отсутствия товара
 * (аналог листа «Ежедневный сбор остатков» в Excel).
 */
export async function syncStockSnapshots(storeId: string): Promise<number> {
  const credentials = await getCredentials(storeId);
  const products = await db.product.findMany({
    where: { storeId, sku: { not: null } },
    select: { id: true, sku: true },
  });
  if (products.length === 0) return 0;

  const productBySku = new Map(products.map((p) => [p.sku as string, p.id]));
  const summaries = await fetchOzonStocksSummary(
    credentials,
    products.map((p) => p.sku as string),
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const summary of summaries) {
    await db.stockSnapshot.upsert({
      where: {
        storeId_sku_date: { storeId, sku: summary.sku, date: today },
      },
      update: {
        availableQty: summary.availableQty,
        transitQty: summary.transitQty,
        productId: productBySku.get(summary.sku) ?? null,
      },
      create: {
        storeId,
        sku: summary.sku,
        date: today,
        availableQty: summary.availableQty,
        transitQty: summary.transitQty,
        productId: productBySku.get(summary.sku) ?? null,
      },
    });
  }

  return summaries.length;
}

/**
 * FBO-отправления («Заказы со склада Ozon»). В отличие от финансовых операций
 * появляются сразу после оформления заказа, поэтому upsert: статус отправления
 * меняется со временем (awaiting_packaging → delivering → delivered/cancelled).
 */
export async function syncFboPostings(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<SyncResult> {
  const result = emptyResult();
  const credentials = await getCredentials(storeId);
  const lines = await fetchOzonFboPostings(credentials, dateFrom, dateTo);

  // Связь строки отправления с товаром: по SKU, запасной вариант — по артикулу
  const products = await db.product.findMany({
    where: { storeId },
    select: { id: true, sku: true, offerId: true },
  });
  const productBySku = new Map(
    products.filter((p) => p.sku).map((p) => [p.sku as string, p]),
  );
  const productByOffer = new Map(products.map((p) => [p.offerId, p]));

  for (const line of lines) {
    const product =
      (line.sku ? productBySku.get(line.sku) : undefined) ??
      (line.offerId ? productByOffer.get(line.offerId) : undefined);

    const data = {
      status: line.status,
      orderedAt: line.orderedAt,
      inProcessAt: line.inProcessAt,
      productId: product?.id ?? null,
      offerId: line.offerId,
      productName: line.productName,
      quantity: line.quantity,
      raw: line.raw as unknown as Prisma.InputJsonValue,
    };

    const existing = await db.fboPosting.findUnique({
      where: {
        storeId_postingNumber_sku: {
          storeId,
          postingNumber: line.postingNumber,
          sku: line.sku ?? "",
        },
      },
      select: { id: true },
    });

    if (existing) {
      await db.fboPosting.update({ where: { id: existing.id }, data });
      result.postingsUpdated += 1;
    } else {
      await db.fboPosting.create({
        data: {
          ...data,
          storeId,
          postingNumber: line.postingNumber,
          sku: line.sku ?? "",
        },
      });
      result.postingsCreated += 1;
    }
  }

  return result;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Рекламная статистика из Performance API: дневной расход по SKU
 * (аналог листа «Трафареты» в Excel). Возвращает число обновлённых строк;
 * 0 — ключи Performance API не настроены.
 */
export async function syncPerformanceStats(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<number> {
  const settings = await db.performanceSettings.findUnique({
    where: { storeId },
  });
  if (!settings) return 0;

  const credentials: PerformanceCredentials = {
    clientId: settings.clientId,
    clientSecret: settings.clientSecret,
  };

  const campaigns = await fetchPerformanceCampaigns(credentials);
  const cpcCampaignIds = campaigns
    .filter((c) => c.advObjectType === "SKU")
    .map((c) => c.id);
  const hasSearchPromo = campaigns.some(
    (c) => c.advObjectType === "SEARCH_PROMO",
  );
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));

  // Лимит Performance API — 62 дня на выгрузку: режем период на куски
  const rows: AdSpendRow[] = [];
  let cursor = dateFrom.getTime();
  while (cursor <= dateTo.getTime()) {
    const chunkEnd = Math.min(
      cursor + (MAX_REPORT_DAYS - 1) * DAY_MS,
      dateTo.getTime(),
    );
    const chunkFrom = new Date(cursor);
    const chunkTo = new Date(chunkEnd);

    if (cpcCampaignIds.length > 0) {
      rows.push(
        ...(await fetchCpcSkuDaily(credentials, cpcCampaignIds, chunkFrom, chunkTo)),
      );
    }
    if (hasSearchPromo) {
      try {
        rows.push(
          ...(await fetchSearchPromoOrders(credentials, chunkFrom, chunkTo)),
        );
      } catch (error) {
        // Отчёт «оплата за заказ» не критичен: расход всё равно попадает
        // в чистую прибыль из финансовых операций Seller API
        console.error("fetchSearchPromoOrders", error);
      }
    }

    cursor = chunkEnd + DAY_MS;
  }

  // Отчёт по заказам может дать несколько строк на SKU за день — агрегируем
  const aggregated = new Map<string, AdSpendRow>();
  for (const row of rows) {
    const key = `${row.campaignId}|${row.sku}|${row.date.toISOString()}`;
    const entry = aggregated.get(key);
    if (!entry) {
      aggregated.set(key, { ...row });
    } else {
      entry.views += row.views;
      entry.clicks += row.clicks;
      entry.toCart += row.toCart;
      entry.spent += row.spent;
      entry.orders += row.orders;
      entry.ordersMoney += row.ordersMoney;
    }
  }

  const products = await db.product.findMany({
    where: { storeId, sku: { not: null } },
    select: { id: true, sku: true },
  });
  const productBySku = new Map(products.map((p) => [p.sku as string, p.id]));

  let upserted = 0;
  for (const row of aggregated.values()) {
    const campaign = campaignById.get(row.campaignId);
    const data = {
      productId: productBySku.get(row.sku) ?? null,
      campaignTitle: campaign?.title ?? null,
      campaignType: campaign?.advObjectType ?? "SEARCH_PROMO",
      views: row.views,
      clicks: row.clicks,
      toCart: row.toCart,
      spent: row.spent,
      orders: row.orders,
      ordersMoney: row.ordersMoney,
    };
    await db.adSpend.upsert({
      where: {
        storeId_campaignId_sku_date: {
          storeId,
          campaignId: row.campaignId,
          sku: row.sku,
          date: row.date,
        },
      },
      update: data,
      create: {
        ...data,
        storeId,
        campaignId: row.campaignId,
        sku: row.sku,
        date: row.date,
      },
    });
    upserted += 1;
  }

  return upserted;
}

export async function syncAll(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<SyncResult> {
  const result = emptyResult();
  // Шаги логируем с длительностью: функция падала по таймауту 300 с,
  // и без этих отметок не видно, какой из них его съедает
  const startedAt = Date.now();
  const step = (name: string) =>
    console.log(`syncAll ${name}: ${Math.round((Date.now() - startedAt) / 1000)}s`);

  try {
    const products = await syncProducts(storeId);
    result.productsCreated = products.productsCreated;
    result.productsUpdated = products.productsUpdated;
    step("товары");
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof OzonApiError ? error.message : "Не удалось загрузить товары",
    );
    return result; // без товаров операции не к чему привязывать
  }

  try {
    const finance = await syncFinanceOperations(storeId, dateFrom, dateTo);
    result.operationsCreated = finance.operationsCreated;
    result.operationsUpdated = finance.operationsUpdated;
    step("финансы");
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof OzonApiError ? error.message : "Не удалось загрузить финансы",
    );
  }

  try {
    const postings = await syncFboPostings(storeId, dateFrom, dateTo);
    result.postingsCreated = postings.postingsCreated;
    result.postingsUpdated = postings.postingsUpdated;
    step("отправления");
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof OzonApiError
        ? error.message
        : "Не удалось загрузить заказы FBO",
    );
  }

  // Снимок остатков не критичен для остальной аналитики — ошибки не фатальны
  try {
    await syncStockSnapshots(storeId);
    step("остатки");
  } catch (error) {
    console.error("syncStockSnapshots", error);
    result.errors.push("Не удалось сохранить снимок остатков");
  }

  // Обновление курса ЦБ и пересчёт автосебестоимости из закупки
  try {
    const { recalcAutoSourcingCosts } = await import("./sourcing-service");
    await recalcAutoSourcingCosts(storeId);
    step("себестоимость");
  } catch (error) {
    console.error("recalcAutoSourcingCosts", error);
    result.errors.push("Не удалось пересчитать себестоимость из закупки");
  }

  // Рекламная статистика Performance API (если ключи настроены)
  try {
    await syncPerformanceStats(storeId, dateFrom, dateTo);
    step("реклама");
  } catch (error) {
    console.error("syncPerformanceStats", error);
    result.errors.push("Не удалось загрузить статистику рекламы");
  }

  return result;
}

const SYNC_RUNNING = "running";
const SYNC_SUCCESS = "success";
const SYNC_ERROR = "error";

/**
 * syncAll с записью прогона в SyncRun: нужен крону и индикатору в интерфейсе,
 * потому что сам syncAll не падает на ошибках отдельных шагов, а копит их в errors.
 */
export async function syncAllTracked(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<SyncResult> {
  const run = await db.syncRun.create({
    data: { storeId, status: SYNC_RUNNING },
  });

  try {
    const result = await syncAll(storeId, dateFrom, dateTo);
    await db.syncRun.update({
      where: { id: run.id },
      data: {
        status: result.success ? SYNC_SUCCESS : SYNC_ERROR,
        finishedAt: new Date(),
        errors: result.errors,
      },
    });
    return result;
  } catch (error) {
    await db.syncRun.update({
      where: { id: run.id },
      data: {
        status: SYNC_ERROR,
        finishedAt: new Date(),
        errors: [
          error instanceof OzonApiError ? error.message : "Синхронизация прервалась",
        ],
      },
    });
    throw error;
  }
}

export type SyncStatus = {
  /** Прогон начат и ещё не завершился */
  running: boolean;
  /** running | success | error; null — синхронизаций ещё не было */
  status: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  errors: string[];
};

/** Последний прогон синхронизации магазина */
export async function getSyncStatus(storeId: string): Promise<SyncStatus> {
  const last = await db.syncRun.findFirst({
    where: { storeId },
    orderBy: { startedAt: "desc" },
  });

  if (!last) {
    return {
      running: false,
      status: null,
      startedAt: null,
      finishedAt: null,
      errors: [],
    };
  }

  return {
    running: last.status === SYNC_RUNNING,
    status: last.status,
    startedAt: last.startedAt,
    finishedAt: last.finishedAt,
    errors: last.errors,
  };
}
