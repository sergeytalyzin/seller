import "server-only";

import type { Product, ProductCost, ProductCostInput } from "@/types/product";
import type { FinanceOperation } from "@/types/finance";
import type { FboPosting } from "@/types/posting";
import type { Expense, ExpenseInput } from "@/types/expense";
import type {
  BonusAccrual,
  BonusAccrualInput,
  StoreSettings,
} from "@/types/settings";
import type { ProductSourcing, ProductSourcingInput } from "@/types/sourcing";
import type { AdSpendDaily } from "@/types/advertising";
import { createDbDataStore } from "./db";

export type DateRange = {
  dateFrom?: Date;
  dateTo?: Date;
};

/** Снимок остатков FBO по товару за день */
export type StockSnapshotRow = {
  productId: string | null;
  sku: string;
  date: Date;
  availableQty: number;
  transitQty: number;
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

  getStoreSettings(): Promise<StoreSettings>;
  saveStoreSettings(input: StoreSettings): Promise<StoreSettings>;

  listProductSourcing(): Promise<ProductSourcing[]>;
  getProductSourcing(productId: string): Promise<ProductSourcing | null>;
  saveProductSourcing(
    productId: string,
    input: ProductSourcingInput,
  ): Promise<ProductSourcing>;

  listBonusAccruals(params?: DateRange): Promise<BonusAccrual[]>;
  createBonusAccrual(input: BonusAccrualInput): Promise<BonusAccrual>;
  deleteBonusAccrual(id: string): Promise<boolean>;

  listStockSnapshots(params?: DateRange): Promise<StockSnapshotRow[]>;

  listAdSpend(params?: DateRange): Promise<AdSpendDaily[]>;
};

export function getDataStore(storeId: string): DataStore {
  return createDbDataStore(storeId);
}
