import "server-only";

import type { Product, ProductCost, ProductCostInput } from "@/types/product";
import type { FinanceOperation } from "@/types/finance";
import type { FboPosting } from "@/types/posting";
import type { Expense, ExpenseInput } from "@/types/expense";
import { createDbDataStore } from "./db";

export type DateRange = {
  dateFrom?: Date;
  dateTo?: Date;
};

/**
 * Единый интерфейс доступа к данным магазина.
 * Реализация — Prisma + Supabase PostgreSQL; UI, hooks и аналитика
 * работают только через этот интерфейс.
 */
export type DataStore = {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;

  listProductCosts(): Promise<ProductCost[]>;
  getProductCost(productId: string): Promise<ProductCost | null>;
  saveProductCost(
    productId: string,
    input: ProductCostInput,
  ): Promise<ProductCost>;

  listFinanceOperations(
    params?: DateRange & { productId?: string },
  ): Promise<FinanceOperation[]>;

  listFboPostings(
    params?: DateRange & { productId?: string },
  ): Promise<FboPosting[]>;

  listExpenses(params?: DateRange): Promise<Expense[]>;
  createExpense(input: ExpenseInput): Promise<Expense>;
  updateExpense(id: string, input: ExpenseInput): Promise<Expense | null>;
  deleteExpense(id: string): Promise<boolean>;
};

export function getDataStore(storeId: string): DataStore {
  return createDbDataStore(storeId);
}
