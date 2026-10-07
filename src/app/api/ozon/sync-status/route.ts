import { NextResponse } from "next/server";
import { getUserStore } from "@/server/auth";
import { getSyncStatus } from "@/server/services/sync-service";

export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const status = await getSyncStatus(ctx.store.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error("GET /api/ozon/sync-status", error);
    return NextResponse.json(
      { error: "Не удалось получить статус синхронизации" },
      { status: 500 },
    );
  }
}
