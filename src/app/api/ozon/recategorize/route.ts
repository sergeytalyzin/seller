import { NextResponse } from "next/server";
import { getUserStore } from "@/server/auth";
import { recategorizeFinanceOperations } from "@/server/services/sync-service";

/**
 * Переразложение сохранённых финансовых операций по категориям расходов
 * из raw-данных Ozon. Нужно один раз после обновления словаря категорий.
 */
export async function POST() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const updated = await recategorizeFinanceOperations(ctx.store.id);
    return NextResponse.json({ updated });
  } catch (error) {
    console.error("POST /api/ozon/recategorize", error);
    return NextResponse.json(
      { error: "Не удалось пересчитать операции" },
      { status: 500 },
    );
  }
}
