import { NextRequest, NextResponse } from "next/server";
import { bonusAccrualInputSchema } from "@/schemas/settings";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";

export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const accruals = await getDataStore(ctx.store.id).listBonusAccruals();
    return NextResponse.json({ accruals });
  } catch (error) {
    console.error("GET /api/bonus-points", error);
    return NextResponse.json(
      { error: "Не удалось загрузить баллы" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bonusAccrualInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте дату и сумму баллов" },
      { status: 400 },
    );
  }

  try {
    const accrual = await getDataStore(ctx.store.id).createBonusAccrual({
      ...parsed.data,
      comment: parsed.data.comment ?? null,
    });
    return NextResponse.json(accrual, { status: 201 });
  } catch (error) {
    console.error("POST /api/bonus-points", error);
    return NextResponse.json(
      { error: "Не удалось сохранить баллы" },
      { status: 500 },
    );
  }
}
