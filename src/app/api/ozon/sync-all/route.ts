import { NextRequest, NextResponse } from "next/server";
import { syncRequestSchema } from "@/schemas/ozon";
import { getUserStore } from "@/server/auth";
import { OzonApiError } from "@/server/ozon/client";
import { syncAll } from "@/server/services/sync-service";

const DAY_MS = 24 * 60 * 60 * 1000;

// /v1/finance/accrual/by-day отдаёт по одному дню за запрос,
// поэтому синхронизация за 90 дней идёт минутами
export const maxDuration = 300;

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
    const result = await syncAll(ctx.store.id, dateFrom, dateTo);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OzonApiError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/ozon/sync-all", error);
    return NextResponse.json(
      { error: "Не удалось выполнить синхронизацию" },
      { status: 500 },
    );
  }
}
