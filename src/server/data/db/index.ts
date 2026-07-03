import { db } from "@/lib/db";
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "@/types/settings";
import type { DataStore } from "..";

function toStoreSettings(row: {
  usnPercent: number;
  vatPercent: number;
  overheadPerUnit: number;
  agentCommissionPercent: number;
  logisticsRatePerKgUsd: number;
  currencyMarkupPercent: number;
  manualCnyRate: number | null;
  manualUsdRate: number | null;
}): StoreSettings {
  return {
    usnPercent: row.usnPercent,
    vatPercent: row.vatPercent,
    overheadPerUnit: row.overheadPerUnit,
    agentCommissionPercent: row.agentCommissionPercent,
    logisticsRatePerKgUsd: row.logisticsRatePerKgUsd,
    currencyMarkupPercent: row.currencyMarkupPercent,
    manualCnyRate: row.manualCnyRate,
    manualUsdRate: row.manualUsdRate,
  };
}

/** Реализация data-слоя на Prisma. Все запросы ограничены магазином storeId. */
export function createDbDataStore(storeId: string): DataStore {
  return {
    async listProducts() {
      return db.product.findMany({
        where: { storeId },
        orderBy: { name: "asc" },
      });
    },

    async getProduct(id) {
      return db.product.findFirst({ where: { id, storeId } });
    },

    async listProductCosts() {
      return db.productCost.findMany({
        where: { product: { storeId } },
      });
    },

    async getProductCost(productId) {
      return db.productCost.findFirst({
        where: { productId, product: { storeId } },
      });
    },

    async saveProductCost(productId, input) {
      const product = await db.product.findFirst({
        where: { id: productId, storeId },
        select: { id: true },
      });
      if (!product) {
        throw new Error(`Товар ${productId} не найден`);
      }
      return db.productCost.upsert({
        where: { productId },
        update: input,
        create: { ...input, productId },
      });
    },

    async listFinanceOperations(params = {}) {
      const { dateFrom, dateTo, productId } = params;
      return db.financeOperation.findMany({
        where: {
          storeId,
          ...(productId ? { productId } : {}),
          ...(dateFrom || dateTo
            ? { operationDate: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
            : {}),
        },
        orderBy: { operationDate: "desc" },
      });
    },

    async listFboPostings(params = {}) {
      const { dateFrom, dateTo, productId } = params;
      return db.fboPosting.findMany({
        where: {
          storeId,
          ...(productId ? { productId } : {}),
          ...(dateFrom || dateTo
            ? { orderedAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
            : {}),
        },
        orderBy: { orderedAt: "desc" },
      });
    },

    async listExpenses(params = {}) {
      const { dateFrom, dateTo } = params;
      return db.expense.findMany({
        where: {
          storeId,
          ...(dateFrom || dateTo
            ? { date: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
            : {}),
        },
        orderBy: { date: "desc" },
      });
    },

    async createExpense(input) {
      return db.expense.create({ data: { ...input, storeId } });
    },

    async updateExpense(id, input) {
      const existing = await db.expense.findFirst({
        where: { id, storeId },
        select: { id: true },
      });
      if (!existing) return null;
      return db.expense.update({ where: { id }, data: input });
    },

    async deleteExpense(id) {
      const existing = await db.expense.findFirst({
        where: { id, storeId },
        select: { id: true },
      });
      if (!existing) return false;
      await db.expense.delete({ where: { id } });
      return true;
    },

    async getStoreSettings() {
      const settings = await db.storeSettings.findUnique({ where: { storeId } });
      if (!settings) return DEFAULT_STORE_SETTINGS;
      return toStoreSettings(settings);
    },

    async saveStoreSettings(input) {
      const settings = await db.storeSettings.upsert({
        where: { storeId },
        update: input,
        create: { ...input, storeId },
      });
      return toStoreSettings(settings);
    },

    async listProductSourcing() {
      return db.productSourcing.findMany({
        where: { product: { storeId } },
      });
    },

    async getProductSourcing(productId) {
      return db.productSourcing.findFirst({
        where: { productId, product: { storeId } },
      });
    },

    async saveProductSourcing(productId, input) {
      const product = await db.product.findFirst({
        where: { id: productId, storeId },
        select: { id: true },
      });
      if (!product) {
        throw new Error(`Товар ${productId} не найден`);
      }
      return db.productSourcing.upsert({
        where: { productId },
        update: input,
        create: { ...input, productId },
      });
    },

    async listBonusAccruals(params = {}) {
      const { dateFrom, dateTo } = params;
      return db.bonusAccrual.findMany({
        where: {
          storeId,
          ...(dateFrom || dateTo
            ? { date: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
            : {}),
        },
        orderBy: { date: "desc" },
      });
    },

    async createBonusAccrual(input) {
      return db.bonusAccrual.create({ data: { ...input, storeId } });
    },

    async deleteBonusAccrual(id) {
      const existing = await db.bonusAccrual.findFirst({
        where: { id, storeId },
        select: { id: true },
      });
      if (!existing) return false;
      await db.bonusAccrual.delete({ where: { id } });
      return true;
    },

    async listStockSnapshots(params = {}) {
      const { dateFrom, dateTo } = params;
      return db.stockSnapshot.findMany({
        where: {
          storeId,
          ...(dateFrom || dateTo
            ? { date: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
            : {}),
        },
        orderBy: { date: "asc" },
      });
    },

    async listAdSpend(params = {}) {
      const { dateFrom, dateTo } = params;
      return db.adSpend.findMany({
        where: {
          storeId,
          ...(dateFrom || dateTo
            ? { date: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
            : {}),
        },
        orderBy: { date: "asc" },
      });
    },
  };
}
