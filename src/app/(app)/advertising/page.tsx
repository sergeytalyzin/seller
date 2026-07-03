import type { Metadata } from "next";
import { AdvertisingView } from "@/components/advertising/advertising-view";

export const metadata: Metadata = { title: "Реклама" };

export default function AdvertisingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Реклама
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Расходы на продвижение из Ozon Performance API: ДРР и стоимость
          заказа по каждому товару.
        </p>
      </div>
      <AdvertisingView />
    </div>
  );
}
