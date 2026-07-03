import { NextRequest, NextResponse } from "next/server";
import { periodQuerySchema } from "@/schemas/analytics";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";
import { buildOneProductAnalytics } from "@/server/services/analytics-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const parsed = periodQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный период" }, { status: 400 });
  }

  try {
    const store = getDataStore(ctx.store.id);
    const product = await store.getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    const [analytics, cost, operations] = await Promise.all([
      buildOneProductAnalytics(ctx.store.id, id, parsed.data),
      store.getProductCost(id),
      store.listFinanceOperations({ ...parsed.data, productId: id }),
    ]);

    return NextResponse.json({ product, analytics, cost, operations });
  } catch (error) {
    console.error(`GET /api/products/${id}`, error);
    return NextResponse.json(
      { error: "Не удалось загрузить товар" },
      { status: 500 },
    );
  }
}
