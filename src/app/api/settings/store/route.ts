import { NextRequest, NextResponse } from "next/server";
import { storeSettingsInputSchema } from "@/schemas/settings";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";

export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const settings = await getDataStore(ctx.store.id).getStoreSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings/store", error);
    return NextResponse.json(
      { error: "Не удалось загрузить настройки" },
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
  const parsed = storeSettingsInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте значения настроек" },
      { status: 400 },
    );
  }

  try {
    const settings = await getDataStore(ctx.store.id).saveStoreSettings(
      parsed.data,
    );
    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/settings/store", error);
    return NextResponse.json(
      { error: "Не удалось сохранить настройки" },
      { status: 500 },
    );
  }
}
