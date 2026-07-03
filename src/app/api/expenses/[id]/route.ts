import { NextRequest, NextResponse } from "next/server";
import { expenseInputSchema } from "@/schemas/expense";
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
  const parsed = expenseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте значения формы" },
      { status: 400 },
    );
  }

  try {
    const expense = await getDataStore(ctx.store.id).updateExpense(id, {
      ...parsed.data,
      comment: parsed.data.comment ?? null,
    });
    if (!expense) {
      return NextResponse.json({ error: "Расход не найден" }, { status: 404 });
    }
    return NextResponse.json({ expense });
  } catch (error) {
    console.error(`PUT /api/expenses/${id}`, error);
    return NextResponse.json(
      { error: "Не удалось сохранить расход" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const deleted = await getDataStore(ctx.store.id).deleteExpense(id);
    if (!deleted) {
      return NextResponse.json({ error: "Расход не найден" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/expenses/${id}`, error);
    return NextResponse.json(
      { error: "Не удалось удалить расход" },
      { status: 500 },
    );
  }
}
