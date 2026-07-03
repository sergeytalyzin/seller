import { NextRequest, NextResponse } from "next/server";
import { periodQuerySchema } from "@/schemas/analytics";
import { expenseInputSchema } from "@/schemas/expense";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";

export async function GET(request: NextRequest) {
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
    const expenses = await getDataStore(ctx.store.id).listExpenses(parsed.data);
    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("GET /api/expenses", error);
    return NextResponse.json(
      { error: "Не удалось загрузить расходы" },
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
  const parsed = expenseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте значения формы" },
      { status: 400 },
    );
  }

  try {
    const expense = await getDataStore(ctx.store.id).createExpense({
      ...parsed.data,
      comment: parsed.data.comment ?? null,
    });
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses", error);
    return NextResponse.json(
      { error: "Не удалось сохранить расход" },
      { status: 500 },
    );
  }
}
