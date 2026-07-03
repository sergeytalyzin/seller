import { ozonRequest, type OzonCredentials } from "./client";
import {
  productInfoListResponseSchema,
  productListResponseSchema,
  type OzonProductInfo,
} from "./schemas";

export type NormalizedOzonProduct = {
  ozonProductId: string;
  offerId: string;
  sku: string | null;
  name: string;
  imageUrl: string | null;
  price: number | null;
  oldPrice: number | null;
  currency: string | null;
  isArchived: boolean;
  raw: OzonProductInfo;
};

const LIST_PAGE_SIZE = 1000;
const INFO_CHUNK_SIZE = 100;

function parsePrice(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalize(item: OzonProductInfo): NormalizedOzonProduct {
  return {
    ozonProductId: String(item.id),
    offerId: item.offer_id,
    sku: item.sku != null ? String(item.sku) : null,
    name: item.name || item.offer_id,
    imageUrl: item.primary_image[0] ?? item.images[0] ?? null,
    price: parsePrice(item.price),
    oldPrice: parsePrice(item.old_price),
    currency: item.currency_code ?? null,
    isArchived: item.is_archived,
    raw: item,
  };
}

/** Полный каталог: /v3/product/list (пагинация по last_id) + /v3/product/info/list */
export async function fetchOzonProducts(
  credentials: OzonCredentials,
): Promise<NormalizedOzonProduct[]> {
  const productIds: number[] = [];
  let lastId = "";

  do {
    const response = productListResponseSchema.parse(
      await ozonRequest({
        endpoint: "/v3/product/list",
        body: {
          filter: { visibility: "ALL" },
          last_id: lastId,
          limit: LIST_PAGE_SIZE,
        },
        credentials,
      }),
    );

    const items = response.result.items;
    productIds.push(...items.map((i) => i.product_id));
    lastId = response.result.last_id;
    if (items.length < LIST_PAGE_SIZE) break;
  } while (lastId);

  const products: NormalizedOzonProduct[] = [];
  for (let i = 0; i < productIds.length; i += INFO_CHUNK_SIZE) {
    const chunk = productIds.slice(i, i + INFO_CHUNK_SIZE);
    const response = productInfoListResponseSchema.parse(
      await ozonRequest({
        endpoint: "/v3/product/info/list",
        // По swagger product_id — array<string>
        body: { product_id: chunk.map(String) },
        credentials,
      }),
    );
    products.push(...response.items.map(normalize));
  }

  return products;
}
