import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getUserStore } from "@/server/auth";
import {
  fetchPerformanceCampaigns,
  PerformanceApiError,
} from "@/server/performance/client";

const inputSchema = z.object({
  clientId: z
    .string({ message: "Укажите Client ID" })
    .trim()
    .min(1, "Укажите Client ID")
    .max(200, "Слишком длинное значение"),
  clientSecret: z
    .string({ message: "Укажите Client Secret" })
    .trim()
    .min(10, "Client Secret слишком короткий")
    .max(500, "Слишком длинное значение"),
});

export type PerformanceSettingsInfo = {
  connected: boolean;
  clientId: string | null;
  updatedAt: string | null;
};

export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const settings = await db.performanceSettings.findUnique({
    where: { storeId: ctx.store.id },
  });

  const info: PerformanceSettingsInfo = settings
    ? {
        connected: true,
        clientId: settings.clientId,
        updatedAt: settings.updatedAt.toISOString(),
      }
    : { connected: false, clientId: null, updatedAt: null };

  return NextResponse.json(info);
}

export async function PUT(request: NextRequest) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте Client ID и Client Secret" },
      { status: 400 },
    );
  }

  try {
    // Проверяем ключи реальным запросом к рекламному кабинету
    await fetchPerformanceCampaigns(parsed.data);

    const settings = await db.performanceSettings.upsert({
      where: { storeId: ctx.store.id },
      update: parsed.data,
      create: { ...parsed.data, storeId: ctx.store.id },
    });

    const info: PerformanceSettingsInfo = {
      connected: true,
      clientId: settings.clientId,
      updatedAt: settings.updatedAt.toISOString(),
    };
    return NextResponse.json(info);
  } catch (error) {
    if (error instanceof PerformanceApiError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("PUT /api/settings/performance", error);
    return NextResponse.json(
      { error: "Не удалось сохранить настройки" },
      { status: 500 },
    );
  }
}
