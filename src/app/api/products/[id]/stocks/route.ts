import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";
import { OzonApiError } from "@/server/ozon/client";
import {
  fetchOzonStockAnalytics,
  OZON_STOCK_METRICS_DAYS,
} from "@/server/ozon/stocks";
import type { ProductStocks } from "@/types/stocks";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Остатки товара по кластерам и складам Ozon (метрики за последние 28 дней) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const store = getDataStore(ctx.store.id);
    const product = await store.getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    // /v1/analytics/stocks принимает только SKU Ozon; окно метрик фиксировано
    const periodTo = new Date();
    const periodFrom = new Date(
      periodTo.getTime() - OZON_STOCK_METRICS_DAYS * DAY_MS,
    );
    const empty: ProductStocks = {
      periodFrom: periodFrom.toISOString(),
      periodTo: periodTo.toISOString(),
      stockDays: null,
      clusters: [],
    };

    // Без SKU товара нет на FBO — остатков по кластерам не существует
    if (!product.sku) return NextResponse.json(empty);

    const settings = await db.ozonSettings.findUnique({
      where: { storeId: ctx.store.id },
    });
    if (!settings) {
      return NextResponse.json(
        { error: "Сначала укажите Client ID и API Key в настройках Ozon" },
        { status: 400 },
      );
    }

    const { stockDays, clusters } = await fetchOzonStockAnalytics(
      { clientId: settings.clientId, apiKey: settings.apiKey },
      product.sku,
    );

    return NextResponse.json({ ...empty, stockDays, clusters });
  } catch (error) {
    if (error instanceof OzonApiError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(`GET /api/products/${id}/stocks`, error);
    return NextResponse.json(
      { error: "Не удалось загрузить остатки по складам" },
      { status: 500 },
    );
  }
}
