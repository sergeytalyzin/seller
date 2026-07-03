import type { Metadata } from "next";
import { ExpensesView } from "@/components/expenses/expenses-view";

export const metadata: Metadata = { title: "Расходы" };

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Расходы магазина
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Общие расходы, не привязанные к товарам: зарплаты, реклама, сервисы.
          Учитываются в общей прибыли магазина.
        </p>
      </div>
      <ExpensesView />
    </div>
  );
}
