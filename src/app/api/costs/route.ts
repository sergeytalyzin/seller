import { NextRequest, NextResponse } from "next/server";
import { bulkCostsSchema } from "@/schemas/cost";
import { getUserStore } from "@/server/auth";
import { getDataStore } from "@/server/data";
import type { ProductCostRow } from "@/types/product";

export async function GET() {
  const ctx = await getUserStore();
  if (!ctx) {
    return NextResponse.json({ error: "Войдите в приложение" }, { status: 401 });
  }

  try {
    const store = getDataStore(ctx.store.id);
    const [products, costs] = await Promise.all([
      store.listProducts(),
      store.listProductCosts(),
    ]);
    const costByProduct = new Map(costs.map((c) => [c.productId, c]));

    const rows: ProductCostRow[] = products
      .map((p) => ({
        productId: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        sku: p.sku,
        offerId: p.offerId,
        price: p.price,
        cost: costByProduct.get(p.id) ?? null,
      }))
      // Товары без себестоимости — наверх, это главная задача страницы
      .sort(
        (a, b) =>
          Number(Boolean(a.cost)) - Number(Boolean(b.cost)) ||
          a.name.localeCompare(b.name, "ru"),
      );

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("GET /api/costs", error);
    return NextResponse.json(
      { error: "Не удалось загрузить себестоимость" },
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
  const parsed = bulkCostsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте значения формы" },
      { status: 400 },
    );
  }

  try {
    const store = getDataStore(ctx.store.id);

    for (const item of parsed.data.items) {
      if (!(await store.getProduct(item.productId))) {
        return NextResponse.json(
          { error: "Некоторые товары не найдены, обновите страницу" },
          { status: 400 },
        );
      }
    }

    for (const item of parsed.data.items) {
      const existing = await store.getProductCost(item.productId);
      await store.saveProductCost(item.productId, {
        purchaseCost: item.purchaseCost,
        packagingCost: item.packagingCost,
        deliveryCost: item.deliveryCost,
        otherCost: item.otherCost,
        taxPercent: item.taxPercent,
        // Массовое редактирование не трогает комментарий из карточки товара
        comment: existing?.comment ?? null,
      });
    }

    return NextResponse.json({ saved: parsed.data.items.length });
  } catch (error) {
    console.error("PUT /api/costs", error);
    return NextResponse.json(
      { error: "Не удалось сохранить себестоимость" },
      { status: 500 },
    );
  }
}
