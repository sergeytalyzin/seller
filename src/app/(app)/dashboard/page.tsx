import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Сколько магазин реально зарабатывает и где теряет деньги.
        </p>
      </div>
      <DashboardView />
    </div>
  );
}
