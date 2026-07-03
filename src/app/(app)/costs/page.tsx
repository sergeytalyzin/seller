import type { Metadata } from "next";
import { CostsView } from "@/components/costs/costs-view";

export const metadata: Metadata = { title: "Себестоимость" };

export default function CostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Себестоимость
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Заполните закупку, упаковку, доставку и налог — можно сразу для
          нескольких товаров. Товары без себестоимости показаны первыми.
        </p>
      </div>
      <CostsView />
    </div>
  );
}
