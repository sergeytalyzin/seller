import { NextResponse } from "next/server";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";
import { getCnyRateChangePercent } from "@/server/currency";
import { getEffectiveRates } from "@/server/services/sourcing-service";

/** Действующие курсы для расчёта закупки + динамика юаня */
export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const settings = await getDataStore(ctx.store.id).getStoreSettings();
    const [rates, cnyChange30dPercent] = await Promise.all([
      getEffectiveRates(settings),
      getCnyRateChangePercent(30),
    ]);
    return NextResponse.json({ rates, cnyChange30dPercent });
  } catch (error) {
    console.error("GET /api/currency", error);
    return NextResponse.json(
      { error: "Не удалось получить курсы валют" },
      { status: 500 },
    );
  }
}
