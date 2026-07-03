import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { OzonApiError, type OzonCredentials } from "@/server/ozon/client";
import { fetchOzonProducts } from "@/server/ozon/products";
import {
  fetchOzonOperations,
  normalizeOzonOperation,
} from "@/server/ozon/finance";
import { fetchOzonFboPostings } from "@/server/ozon/postings";
import { fetchOzonStocksSummary } from "@/server/ozon/stocks";
import { financeOperationSchema } from "@/server/ozon/schemas";

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
  const operations = await fetchOzonOperations(credentials, dateFrom, dateTo);

  // Связь операция → товар по SKU
  const products = await db.product.findMany({
    where: { storeId, sku: { not: null } },
    select: { id: true, sku: true, offerId: true },
  });
  const productBySku = new Map(products.map((p) => [p.sku as string, p]));

  const existing = await db.financeOperation.findMany({
    where: { storeId },
    select: { ozonOperationId: true },
  });
  const existingIds = new Set(existing.map((o) => o.ozonOperationId));

  // На границах месячных кусков Ozon может вернуть операцию дважды
  const seen = new Set<string>();
  const newOperations = operations.filter((op) => {
    if (existingIds.has(op.ozonOperationId) || seen.has(op.ozonOperationId)) {
      return false;
    }
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
 * Переразложение сохранённых операций по категориям из raw-ответа Ozon.
 * Нужно после изменения словаря категорий: старые строки в БД остаются
 * с прежней разбивкой, пока их не пересчитать.
 */
export async function recategorizeFinanceOperations(
  storeId: string,
): Promise<number> {
  const operations = await db.financeOperation.findMany({
    where: { storeId, raw: { not: Prisma.JsonNull } },
    select: { id: true, raw: true },
  });

  let updated = 0;
  const BATCH = 25;
  for (let i = 0; i < operations.length; i += BATCH) {
    const batch = operations.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (row) => {
        const parsed = financeOperationSchema.safeParse(row.raw);
        if (!parsed.success) return;
        const op = normalizeOzonOperation(parsed.data);
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

export async function syncAll(
  storeId: string,
  dateFrom: Date,
  dateTo: Date,
): Promise<SyncResult> {
  const result = emptyResult();

  try {
    const products = await syncProducts(storeId);
    result.productsCreated = products.productsCreated;
    result.productsUpdated = products.productsUpdated;
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
  } catch (error) {
    console.error("syncStockSnapshots", error);
    result.errors.push("Не удалось сохранить снимок остатков");
  }

  return result;
}
