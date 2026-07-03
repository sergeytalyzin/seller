import { NextRequest, NextResponse } from "next/server";
import { periodQuerySchema } from "@/schemas/analytics";
import { getUserStore } from "@/server/auth";
import { buildProductAnalytics } from "@/server/services/analytics-service";

export async function GET(request: NextRequest) {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  const parsed = periodQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный период" }, { status: 400 });
  }

  try {
    const products = await buildProductAnalytics(ctx.store.id, parsed.data);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products", error);
    return NextResponse.json(
      { error: "Не удалось загрузить товары" },
      { status: 500 },
    );
  }
}
