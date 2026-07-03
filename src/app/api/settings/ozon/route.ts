import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ozonSettingsInputSchema, type OzonSettingsInfo } from "@/schemas/ozon";
import { getUserStore } from "@/server/auth";

function maskApiKey(apiKey: string): string {
  return `${"*".repeat(12)}${apiKey.slice(-4)}`;
}

export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const settings = await db.ozonSettings.findUnique({
    where: { storeId: ctx.store.id },
  });

  const info: OzonSettingsInfo = settings
    ? {
        connected: true,
        clientId: settings.clientId,
        apiKeyMask: maskApiKey(settings.apiKey),
        updatedAt: settings.updatedAt.toISOString(),
      }
    : { connected: false, clientId: null, apiKeyMask: null, updatedAt: null };

  return NextResponse.json(info);
}

export async function PUT(request: NextRequest) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ozonSettingsInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте Client ID и API Key" },
      { status: 400 },
    );
  }

  try {
    const settings = await db.ozonSettings.upsert({
      where: { storeId: ctx.store.id },
      update: parsed.data,
      create: { ...parsed.data, storeId: ctx.store.id },
    });

    const info: OzonSettingsInfo = {
      connected: true,
      clientId: settings.clientId,
      apiKeyMask: maskApiKey(settings.apiKey),
      updatedAt: settings.updatedAt.toISOString(),
    };
    return NextResponse.json(info);
  } catch (error) {
    console.error("PUT /api/settings/ozon", error);
    return NextResponse.json(
      { error: "Не удалось сохранить настройки" },
      { status: 500 },
    );
  }
}
