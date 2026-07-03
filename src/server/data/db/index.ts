import { db } from "@/lib/db";
import type { DataStore } from "..";

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
  };
}
