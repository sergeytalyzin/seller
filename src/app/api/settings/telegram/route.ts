import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { telegramSettingsInputSchema } from "@/schemas/settings";
import { getUserStore } from "@/server/auth";

export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const settings = await db.telegramSettings.findUnique({
      where: { storeId: ctx.store.id },
    });
    return NextResponse.json(
      settings ? { chatId: settings.chatId, enabled: settings.enabled } : null,
    );
  } catch (error) {
    console.error("GET /api/settings/telegram", error);
    return NextResponse.json(
      { error: "Не удалось загрузить настройки Telegram" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = telegramSettingsInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  try {
    const settings = await db.telegramSettings.upsert({
      where: { storeId: ctx.store.id },
      update: parsed.data,
      create: { ...parsed.data, storeId: ctx.store.id },
    });
    return NextResponse.json({
      chatId: settings.chatId,
      enabled: settings.enabled,
    });
  } catch (error) {
    console.error("PUT /api/settings/telegram", error);
    return NextResponse.json(
      { error: "Не удалось сохранить настройки Telegram" },
      { status: 500 },
    );
  }
}
