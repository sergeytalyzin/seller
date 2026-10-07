import { ozonRequest, type OzonCredentials } from "./client";
import { fboPostingListResponseSchema, type OzonFboPosting } from "./schemas";

/**
 * Строка FBO-отправления: одно отправление × один товар.
 * FBS-отправления (POST /v4/posting/fbs/list) пока не синхронизируются —
 * магазин работает по схеме FBO; при необходимости добавить аналогично.
 */
export type NormalizedFboPostingLine = {
  postingNumber: string;
  status: string;
  orderedAt: Date;
  inProcessAt: Date | null;
  sku: string | null;
  offerId: string | null;
  productName: string;
  quantity: number;
  raw: OzonFboPosting;
};

// Ozon: limit должен быть в диапазоне (0, 100]
const PAGE_SIZE = 100;
const MAX_PAGES = 200;

function toLines(posting: OzonFboPosting): NormalizedFboPostingLine[] {
  return posting.products.map((product) => ({
    postingNumber: posting.posting_number,
    status: posting.status,
    orderedAt: new Date(posting.created_at),
    inProcessAt: posting.in_process_at ? new Date(posting.in_process_at) : null,
    sku: product.sku != null ? String(product.sku) : null,
    offerId: product.offer_id || null,
    productName: product.name,
    quantity: product.quantity,
    raw: posting,
  }));
}

/**
 * FBO-отправления («Заказы со склада Ozon») за период:
 * POST /v3/posting/fbo/list с cursor-пагинацией; filter.since/to — RFC3339.
 */
export async function fetchOzonFboPostings(
  credentials: OzonCredentials,
  dateFrom: Date,
  dateTo: Date,
): Promise<NormalizedFboPostingLine[]> {
  const lines: NormalizedFboPostingLine[] = [];
  let cursor = "";
  let page = 0;

  for (; page < MAX_PAGES; page += 1) {
    const response = fboPostingListResponseSchema.parse(
      await ozonRequest({
        endpoint: "/v3/posting/fbo/list",
        body: {
          filter: {
            since: dateFrom.toISOString(),
            to: dateTo.toISOString(),
          },
          limit: PAGE_SIZE,
          cursor,
        },
        credentials,
      }),
    );

    lines.push(...response.postings.flatMap(toLines));

    // Выходим, если страница пустая или курсор не сдвинулся: иначе цикл
    // крутит одну и ту же выборку до MAX_PAGES и съедает лимит функции
    if (!response.has_next || !response.cursor) break;
    if (response.postings.length === 0 || response.cursor === cursor) break;
    cursor = response.cursor;
  }

  console.log(
    `fetchOzonFboPostings: ${page + 1} страниц, ${lines.length} строк`,
  );

  return lines;
}
