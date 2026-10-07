import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserStore } from "@/server/auth";
import { buildDigestText } from "@/server/services/digest-service";
import { sendTelegramMessage } from "@/server/telegram/client";

/** Шлёт настоящий дайджест за вчера — проверка связи и предпросмотр разом */
export async function POST() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const settings = await db.telegramSettings.findUnique({
      where: { storeId: ctx.store.id },
    });
    if (!settings) {
      return NextResponse.json(
        { error: "Сначала сохраните Chat ID" },
        { status: 400 },
      );
    }

    const text = await buildDigestText(ctx.store.id);
    await sendTelegramMessage(settings.chatId, text);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/settings/telegram/test", error);
    const message =
      error instanceof Error && error.message.startsWith("Telegram API")
        ? "Telegram отклонил сообщение: проверьте Chat ID и что вы написали боту /start"
        : "Не удалось отправить сообщение";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
