import type { Metadata } from "next";
import { StoreSettingsView } from "@/components/settings/store-settings-view";

export const metadata: Metadata = { title: "Параметры расчёта" };

export default function StoreSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Параметры расчёта
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Налоги, накладные расходы и баллы Ozon — используются при расчёте
          чистой прибыли.
        </p>
      </div>
      <StoreSettingsView />
    </div>
  );
}
