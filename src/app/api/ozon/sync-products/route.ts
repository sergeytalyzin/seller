import { NextResponse } from "next/server";
import { getUserStore } from "@/server/auth";
import { OzonApiError } from "@/server/ozon/client";
import { syncProducts } from "@/server/services/sync-service";

export async function POST() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const result = await syncProducts(ctx.store.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OzonApiError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/ozon/sync-products", error);
    return NextResponse.json(
      { error: "Не удалось загрузить товары" },
      { status: 500 },
    );
  }
}
