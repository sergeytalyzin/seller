import { NextRequest, NextResponse } from "next/server";
import { periodQuerySchema } from "@/schemas/analytics";
import { getUserStore } from "@/server/auth";
import { buildDashboard } from "@/server/services/dashboard-service";

const DAY_MS = 24 * 60 * 60 * 1000;

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

  const dateTo = parsed.data.dateTo ?? new Date();
  const dateFrom =
    parsed.data.dateFrom ?? new Date(dateTo.getTime() - 30 * DAY_MS);

  if (dateFrom > dateTo) {
    return NextResponse.json(
      { error: "Начало периода позже его конца" },
      { status: 400 },
    );
  }

  try {
    const data = await buildDashboard(ctx.store.id, dateFrom, dateTo);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/dashboard", error);
    return NextResponse.json(
      { error: "Не удалось загрузить аналитику" },
      { status: 500 },
    );
  }
}
