import { NextRequest, NextResponse } from "next/server";
import { productCostInputSchema } from "@/schemas/cost";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productCostInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте значения формы" },
      { status: 400 },
    );
  }

  try {
    const store = getDataStore(ctx.store.id);
    const product = await store.getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    const cost = await store.saveProductCost(id, {
      ...parsed.data,
      comment: parsed.data.comment ?? null,
    });
    return NextResponse.json({ cost });
  } catch (error) {
    console.error(`PUT /api/products/${id}/cost`, error);
    return NextResponse.json(
      { error: "Не удалось сохранить себестоимость" },
      { status: 500 },
    );
  }
}
