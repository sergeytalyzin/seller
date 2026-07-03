import type { Metadata } from "next";
import { NoveltyCalculator } from "@/components/calculator/novelty-calculator";

export const metadata: Metadata = { title: "Просчёт новинок" };

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Просчёт новинок
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Стоит ли возить товар: себестоимость из закупки в Китае и плановая
          прибыль с единицы до того, как вы её закупили.
        </p>
      </div>
      <NoveltyCalculator />
    </div>
  );
}
