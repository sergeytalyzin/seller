import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserStore } from "@/server/auth";
import { OzonApiError, ozonRequest } from "@/server/ozon/client";
import { rolesResponseSchema } from "@/server/ozon/schemas";

/** Проверка сохранённых ключей через POST /v1/roles */
export async function POST() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const settings = await db.ozonSettings.findUnique({
    where: { storeId: ctx.store.id },
  });
  if (!settings) {
    return NextResponse.json(
      { error: "Сначала сохраните Client ID и API Key" },
      { status: 400 },
    );
  }

  try {
    const response = rolesResponseSchema.parse(
      await ozonRequest({
        endpoint: "/v1/roles",
        body: {},
        credentials: { clientId: settings.clientId, apiKey: settings.apiKey },
      }),
    );

    return NextResponse.json({
      ok: true,
      roles: response.roles.map((r) => r.name).filter(Boolean),
      expiresAt: response.expires_at ?? null,
    });
  } catch (error) {
    if (error instanceof OzonApiError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/settings/ozon/test", error);
    return NextResponse.json(
      { error: "Не удалось проверить подключение" },
      { status: 500 },
    );
  }
}
