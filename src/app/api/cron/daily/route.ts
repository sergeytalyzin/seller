import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncAllTracked } from "@/server/services/sync-service";
import { buildDigestText } from "@/server/services/digest-service";
import { sendTelegramMessage } from "@/server/telegram/client";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Ежедневному синку хватает недели: старые операции не меняются */
const SYNC_DAYS = 7;

export const maxDuration = 300;

/**
 * Ежедневный автосинк + Telegram-дайджест по всем магазинам с ключами Ozon.
 * Защита — не сессия, а секрет: Authorization: Bearer <CRON_SECRET>
 * (Vercel Cron подставляет его сам, вручную — curl -H).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("GET /api/cron/daily: CRON_SECRET не задан");
    return NextResponse.json({ error: "CRON_SECRET не задан" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 401 });
  }

  const stores = await db.store.findMany({
    where: { ozonSettings: { isNot: null } },
    select: { id: true, telegramSettings: true },
  });

  const dateTo = new Date();
  const dateFrom = new Date(dateTo.getTime() - SYNC_DAYS * DAY_MS);
  const results: { storeId: string; sync: string; digest: string }[] = [];

  for (const store of stores) {
    const entry = { storeId: store.id, sync: "ok", digest: "skipped" };

    try {
      const result = await syncAllTracked(store.id, dateFrom, dateTo);
      if (!result.success) entry.sync = result.errors.join("; ");
    } catch (error) {
      console.error(`cron sync ${store.id}`, error);
      entry.sync = error instanceof Error ? error.message : "ошибка";
    }

    // Дайджест шлём и при упавшем синке — по данным, которые есть
    if (store.telegramSettings?.enabled) {
      try {
        const text = await buildDigestText(store.id);
        await sendTelegramMessage(store.telegramSettings.chatId, text);
        entry.digest = "sent";
      } catch (error) {
        console.error(`cron digest ${store.id}`, error);
        entry.digest = error instanceof Error ? error.message : "ошибка";
      }
    }

    results.push(entry);
  }

  return NextResponse.json({ stores: results });
}
