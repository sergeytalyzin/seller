import { NextRequest, NextResponse } from "next/server";
import { syncRequestSchema } from "@/schemas/ozon";
import { getUserStore } from "@/server/auth";
import { PerformanceApiError } from "@/server/performance/client";
import { syncPerformanceStats } from "@/server/services/sync-service";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = syncRequestSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный период" }, { status: 400 });
  }

  const dateTo = new Date();
  const dateFrom = new Date(dateTo.getTime() - parsed.data.days * DAY_MS);

  try {
    const updated = await syncPerformanceStats(ctx.store.id, dateFrom, dateTo);
    return NextResponse.json({ updated });
  } catch (error) {
    if (error instanceof PerformanceApiError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/ozon/sync-performance", error);
    return NextResponse.json(
      { error: "Не удалось загрузить статистику рекламы" },
      { status: 500 },
    );
  }
}
