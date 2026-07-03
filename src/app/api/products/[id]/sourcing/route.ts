import { NextRequest, NextResponse } from "next/server";
import { productSourcingInputSchema } from "@/schemas/settings";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";
import { recalcAutoSourcingCosts } from "@/server/services/sourcing-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const sourcing = await getDataStore(ctx.store.id).getProductSourcing(id);
    return NextResponse.json({ sourcing });
  } catch (error) {
    console.error("GET /api/products/[id]/sourcing", error);
    return NextResponse.json(
      { error: "Не удалось загрузить параметры закупки" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = productSourcingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте значения формы закупки" },
      { status: 400 },
    );
  }

  try {
    const sourcing = await getDataStore(ctx.store.id).saveProductSourcing(id, {
      ...parsed.data,
      link1688: parsed.data.link1688 ?? null,
      agentComment: parsed.data.agentComment ?? null,
    });
    // Себестоимость могла зависеть от сохранённых параметров
    await recalcAutoSourcingCosts(ctx.store.id);
    return NextResponse.json({ sourcing });
  } catch (error) {
    console.error("PUT /api/products/[id]/sourcing", error);
    return NextResponse.json(
      { error: "Не удалось сохранить параметры закупки" },
      { status: 500 },
    );
  }
}
