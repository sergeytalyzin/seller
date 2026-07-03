import { z } from "zod";

/**
 * Zod-схемы ответов Ozon Seller API.
 * Поля — строго по swagger.json (описываем только используемые,
 * полный исходный объект сохраняется в raw).
 */

// POST /v1/roles — v1RolesByTokenResponse
export const rolesResponseSchema = z.object({
  expires_at: z.string().optional(),
  roles: z
    .array(z.object({ name: z.string().optional().default("") }))
    .optional()
    .default([]),
});

// POST /v3/product/list — productv3GetProductListResponse
export const productListResponseSchema = z.object({
  result: z.object({
    items: z
      .array(
        z.object({
          product_id: z.number(),
          offer_id: z.string(),
          archived: z.boolean().optional().default(false),
        }),
      )
      .optional()
      .default([]),
    last_id: z.string().optional().default(""),
    total: z.number().optional().default(0),
  }),
});

// POST /v3/product/info/list — v3GetProductInfoListResponse
export const productInfoListResponseSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number(),
        offer_id: z.string(),
        sku: z.number().optional(),
        name: z.string().optional().default(""),
        primary_image: z.array(z.string()).optional().default([]),
        images: z.array(z.string()).optional().default([]),
        price: z.string().optional(),
        old_price: z.string().optional(),
        currency_code: z.string().optional(),
        is_archived: z.boolean().optional().default(false),
      }),
    )
    .optional()
    .default([]),
});

export type OzonProductInfo = z.infer<
  typeof productInfoListResponseSchema
>["items"][number];

// POST /v1/analytics/stocks — v1AnalyticsStocksResponse
// Числовые поля реальный API отдаёт как null, когда данных нет
const nullableCount = z
  .number()
  .nullish()
  .transform((v) => v ?? 0);
const nullableText = z
  .string()
  .nullish()
  .transform((v) => v ?? "");

export const analyticsStocksResponseSchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.number().nullish(),
        offer_id: nullableText,
        cluster_id: z.number().nullish(),
        cluster_name: nullableText,
        warehouse_id: z.number().nullish(),
        warehouse_name: nullableText,
        // «Доступно к продаже»
        available_stock_count: nullableCount,
        // «Готовятся к продаже»
        valid_stock_count: nullableCount,
        // Проходят проверку
        other_stock_count: nullableCount,
        // В поставках в пути
        transit_stock_count: nullableCount,
        // В заявках на поставку (ещё не отгружены)
        requested_stock_count: nullableCount,
        // Среднесуточные продажи за последние 28 дней: по всем кластерам / в кластере
        ads: z.number().nullish(),
        ads_cluster: z.number().nullish(),
        // Запас в днях по расчёту Ozon: по всем кластерам / в кластере
        idc: z.number().nullish(),
        idc_cluster: z.number().nullish(),
      }),
    )
    .optional()
    .default([]),
});

export type OzonStockAnalyticsItem = z.infer<
  typeof analyticsStocksResponseSchema
>["items"][number];

// POST /v3/posting/fbo/list — posting.v3.PostingFboListResponse
export const fboPostingListResponseSchema = z.object({
  postings: z
    .array(
      z.object({
        posting_number: z.string(),
        // awaiting_packaging | awaiting_deliver | delivering | delivered | cancelled
        status: nullableText,
        created_at: z.string(),
        in_process_at: z.string().nullish(),
        products: z
          .array(
            z.object({
              sku: z.number().nullish(),
              offer_id: nullableText,
              name: nullableText,
              quantity: z.number().nullish().transform((v) => v ?? 0),
            }),
          )
          .optional()
          .default([]),
      }),
    )
    .optional()
    .default([]),
  cursor: z.string().nullish(),
  has_next: z.boolean().nullish().transform((v) => v ?? false),
});

export type OzonFboPosting = z.infer<
  typeof fboPostingListResponseSchema
>["postings"][number];

// Операция из POST /v3/finance/transaction/list; используется и для
// повторной нормализации сохранённого raw
export const financeOperationSchema = z.object({
  operation_id: z.number(),
  operation_type: z.string(),
  operation_date: z.string(),
  operation_type_name: z.string().optional().default(""),
  accruals_for_sale: z.number().optional().default(0),
  sale_commission: z.number().optional().default(0),
  amount: z.number().optional().default(0),
  type: z.string().optional().default(""),
  delivery_charge: z.number().optional().default(0),
  return_delivery_charge: z.number().optional().default(0),
  items: z
    .array(
      z.object({
        name: z.string().optional().default(""),
        sku: z.number().optional(),
      }),
    )
    .optional()
    .default([]),
  services: z
    .array(
      z.object({
        name: z.string().optional().default(""),
        price: z.number().optional().default(0),
      }),
    )
    .optional()
    .default([]),
});

// POST /v3/finance/transaction/list — financev3FinanceTransactionListV3Response
export const financeTransactionListResponseSchema = z.object({
  result: z.object({
    operations: z.array(financeOperationSchema).optional().default([]),
    page_count: z.number().optional().default(0),
    row_count: z.number().optional().default(0),
  }),
});

export type OzonFinanceOperation = z.infer<typeof financeOperationSchema>;
