import type { Metadata } from "next";
import { ProductsView } from "@/components/products/products-view";

export const metadata: Metadata = { title: "Товары" };

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Товары
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Чистая прибыль, маржа и статус по каждому SKU за выбранный период.
        </p>
      </div>
      <ProductsView />
    </div>
  );
}
