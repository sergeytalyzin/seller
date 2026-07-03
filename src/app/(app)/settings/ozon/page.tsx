import type { Metadata } from "next";
import { OzonSettingsView } from "@/components/settings/ozon-settings-view";

export const metadata: Metadata = { title: "Настройки Ozon" };

export default function OzonSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Настройки Ozon
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Подключение магазина к Ozon Seller API и синхронизация данных.
        </p>
      </div>
      <OzonSettingsView />
    </div>
  );
}
