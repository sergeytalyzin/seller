"use client";

import { useState } from "react";
import { useCurrency } from "@/hooks/use-sourcing";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { calcSourcingCost } from "@/lib/analytics/sourcing";
import { calcUnitEconomics } from "@/lib/analytics/unit-economics";
import { calcTaxes } from "@/lib/analytics/tax";
import { formatMoney, formatPercent, parseDecimal } from "@/lib/format";

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm text-text-primary tabular-nums placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none";

type FieldKey =
  | "priceCny"
  | "weightKg"
  | "unitsPerBox"
  | "chinaLogisticsPerBoxCny"
  | "packagingPerBoxUsd"
  | "rfLogisticsPerUnit"
  | "salePrice"
  | "commissionPercent"
  | "ozonLogisticsPerUnit"
  | "drrPercent";

const sourcingFields: { key: FieldKey; label: string; hint?: string }[] = [
  { key: "priceCny", label: "Цена, ¥" },
  { key: "weightKg", label: "Вес единицы, кг" },
  { key: "unitsPerBox", label: "Штук в коробке" },
  { key: "chinaLogisticsPerBoxCny", label: "Логистика по Китаю, ¥/коробка" },
  { key: "packagingPerBoxUsd", label: "Упаковка грузоместа, $" },
  { key: "rfLogisticsPerUnit", label: "Логистика по РФ, ₽/ед" },
];

const ozonFields: { key: FieldKey; label: string; hint?: string }[] = [
  { key: "salePrice", label: "Плановая цена продажи, ₽" },
  {
    key: "commissionPercent",
    label: "Комиссия Ozon, %",
    hint: "Смотрите в кабинете Ozon для категории товара",
  },
  {
    key: "ozonLogisticsPerUnit",
    label: "Логистика Ozon, ₽/ед",
    hint: "Доставка до покупателя с последней милей",
  },
  { key: "drrPercent", label: "Плановый ДРР, %", hint: "Доля расходов на рекламу" },
];

/** Эквайринг Ozon по умолчанию, % — типовое значение тарифа */
const ACQUIRING_PERCENT = 1.5;

export function NoveltyCalculator() {
  const { data: currency, isPending: currencyPending } = useCurrency();
  const { data: settings, isPending: settingsPending } = useStoreSettings();

  const [values, setValues] = useState<Record<FieldKey, string>>({
    priceCny: "",
    weightKg: "",
    unitsPerBox: "1",
    chinaLogisticsPerBoxCny: "",
    packagingPerBoxUsd: "",
    rfLogisticsPerUnit: "",
    salePrice: "",
    commissionPercent: "",
    ozonLogisticsPerUnit: "",
    drrPercent: "",
  });

  if (currencyPending || settingsPending) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/5" />;
  }

  const rates = currency?.rates ?? null;

  const setValue = (key: FieldKey, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const breakdown =
    rates && settings
      ? calcSourcingCost(
          {
            priceCny: parseDecimal(values.priceCny),
            weightKg: parseDecimal(values.weightKg),
            unitsPerBox: Math.max(1, Math.round(parseDecimal(values.unitsPerBox) || 1)),
            chinaLogisticsPerBoxCny: parseDecimal(values.chinaLogisticsPerBoxCny),
            packagingPerBoxUsd: parseDecimal(values.packagingPerBoxUsd),
            rfLogisticsPerUnit: parseDecimal(values.rfLogisticsPerUnit),
          },
          {
            cnyRate: rates.cnyRate,
            usdRate: rates.usdRate,
            agentCommissionPercent: settings.agentCommissionPercent,
            logisticsRatePerKgUsd: settings.logisticsRatePerKgUsd,
          },
        )
      : null;

  const salePrice = parseDecimal(values.salePrice);
  const unitCost = breakdown?.total ?? 0;

  const taxPerUnit = settings
    ? calcTaxes({
        netSales: salePrice,
        bonusPoints: 0,
        vatPercent: settings.vatPercent,
        usnPercent: settings.usnPercent,
      }).taxAmount
    : 0;

  const economics =
    settings && salePrice > 0 && unitCost > 0
      ? calcUnitEconomics({
          price: salePrice,
          commissionPercent: parseDecimal(values.commissionPercent),
          acquiringPercent: ACQUIRING_PERCENT,
          logisticsPerUnit: parseDecimal(values.ozonLogisticsPerUnit),
          lastMilePerUnit: 0,
          unitCost,
          overheadPerUnit: settings.overheadPerUnit,
          taxPerUnit,
          drrPercent: parseDecimal(values.drrPercent),
        })
      : null;

  const resultRow = (
    label: string,
    net: number,
    roi: number | null,
    margin: number | null,
  ) => (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`text-right font-semibold tabular-nums ${
          net < 0 ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {formatMoney(net)}
      </span>
      <span className="w-24 text-right tabular-nums text-text-secondary">
        {roi != null ? `ROI ${formatPercent(roi)}` : "—"}
      </span>
      <span className="w-28 text-right tabular-nums text-text-secondary">
        {margin != null ? `маржа ${formatPercent(margin)}` : "—"}
      </span>
    </div>
  );

  const renderFields = (fields: { key: FieldKey; label: string; hint?: string }[]) =>
    fields.map(({ key, label, hint }) => (
      <label key={key} className="block">
        <span className="mb-1.5 block text-xs font-medium text-text-secondary">
          {label}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={values[key]}
          onChange={(e) => setValue(key, e.target.value)}
          placeholder="0"
          className={inputClass}
        />
        {hint ? (
          <span className="mt-1 block text-xs text-text-muted">{hint}</span>
        ) : null}
      </label>
    ));

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-black/20">
          <h2 className="text-base font-semibold text-text-primary">
            Закупка в Китае
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            {rates
              ? `Курс: ¥ ${rates.cnyRate.toFixed(2)} ₽ · $ ${rates.usdRate.toFixed(2)} ₽ · комиссия посредника ${settings?.agentCommissionPercent ?? 0}% · логистика ${settings?.logisticsRatePerKgUsd ?? 0} $/кг (настраивается в «Параметрах расчёта»)`
              : "Курс валют недоступен — задайте ручной курс в «Параметрах расчёта»"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {renderFields(sourcingFields)}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-black/20">
          <h2 className="text-base font-semibold text-text-primary">
            Продажа на Ozon
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Эквайринг {ACQUIRING_PERCENT}% и налоги из «Параметров расчёта»
            учитываются автоматически.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {renderFields(ozonFields)}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-black/20 xl:sticky xl:top-24">
        <h2 className="text-base font-semibold text-text-primary">Результат</h2>

        {breakdown && breakdown.total > 0 ? (
          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Товар ({formatMoney(breakdown.goodsCost)}) + комиссия посредника</span>
              <span className="tabular-nums">
                {formatMoney(breakdown.goodsCost + breakdown.commissionCost)}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Международная логистика (по весу)</span>
              <span className="tabular-nums">
                {formatMoney(breakdown.intlLogisticsCost)}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Коробка: логистика по Китаю + упаковка</span>
              <span className="tabular-nums">{formatMoney(breakdown.boxCost)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Логистика по РФ</span>
              <span className="tabular-nums">
                {formatMoney(breakdown.rfLogisticsCost)}
              </span>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-2 text-base font-semibold text-text-primary">
              <span>Себестоимость единицы</span>
              <span className="tabular-nums">{formatMoney(breakdown.total)}</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">
            Заполните цену в юанях — себестоимость посчитается автоматически.
          </p>
        )}

        {economics ? (
          <div className="mt-6 space-y-2.5 border-t border-line pt-4">
            {resultRow(
              "Чистыми с единицы",
              economics.netPerUnit,
              economics.roiPercent,
              economics.marginPercent,
            )}
            {resultRow(
              "С учётом рекламы",
              economics.netPerUnitWithAds,
              economics.roiWithAdsPercent,
              economics.marginWithAdsPercent,
            )}
            {taxPerUnit > 0 ? (
              <p className="text-xs text-text-muted">
                в том числе налог {formatMoney(taxPerUnit)} с единицы
              </p>
            ) : null}
            {(economics.marginWithAdsPercent ?? 0) < 13 ? (
              <p className="text-sm text-amber-300">
                Маржа ниже 13% — по критерию эталонной таблицы это «плохая
                экономика», закупать рискованно.
              </p>
            ) : null}
          </div>
        ) : breakdown && breakdown.total > 0 ? (
          <p className="mt-4 text-sm text-text-muted">
            Укажите плановую цену продажи и комиссию Ozon, чтобы увидеть
            прибыль с единицы.
          </p>
        ) : null}
      </section>
    </div>
  );
}
