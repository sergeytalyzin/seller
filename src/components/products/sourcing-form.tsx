"use client";

import { useState } from "react";
import { Check, ExternalLink, LoaderCircle } from "lucide-react";
import { productSourcingInputSchema } from "@/schemas/settings";
import {
  useCurrency,
  useProductSourcing,
  useSaveProductSourcing,
} from "@/hooks/use-sourcing";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { calcSourcingCost } from "@/lib/analytics/sourcing";
import { formatMoney, parseDecimal } from "@/lib/format";
import type { ProductSourcing } from "@/types/sourcing";

type NumericKey =
  | "priceCny"
  | "weightKg"
  | "unitsPerBox"
  | "chinaLogisticsPerBoxCny"
  | "packagingPerBoxUsd"
  | "rfLogisticsPerUnit"
  | "qtyPurchasing"
  | "qtyInTransit"
  | "qtyOwnWarehouse";

const costFields: { key: NumericKey; label: string }[] = [
  { key: "priceCny", label: "Цена, ¥" },
  { key: "weightKg", label: "Вес единицы, кг" },
  { key: "unitsPerBox", label: "Штук в коробке" },
  { key: "chinaLogisticsPerBoxCny", label: "Логистика по Китаю, ¥/коробка" },
  { key: "packagingPerBoxUsd", label: "Упаковка грузоместа, $" },
  { key: "rfLogisticsPerUnit", label: "Логистика по РФ, ₽/ед" },
];

const stageFields: { key: NumericKey; label: string }[] = [
  { key: "qtyPurchasing", label: "Закуплено в Китае, шт" },
  { key: "qtyInTransit", label: "В пути из Китая, шт" },
  { key: "qtyOwnWarehouse", label: "На нашем складе, шт" },
];

const inputClass =
  "h-9 w-full rounded-lg border border-line bg-bg px-3 text-sm text-text-primary tabular-nums placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none";

function initialValues(sourcing: ProductSourcing | null): Record<NumericKey, string> {
  const num = (v: number) => (v !== 0 ? String(v) : "");
  return {
    priceCny: num(sourcing?.priceCny ?? 0),
    weightKg: num(sourcing?.weightKg ?? 0),
    unitsPerBox: sourcing ? String(sourcing.unitsPerBox) : "1",
    chinaLogisticsPerBoxCny: num(sourcing?.chinaLogisticsPerBoxCny ?? 0),
    packagingPerBoxUsd: num(sourcing?.packagingPerBoxUsd ?? 0),
    rfLogisticsPerUnit: num(sourcing?.rfLogisticsPerUnit ?? 0),
    qtyPurchasing: num(sourcing?.qtyPurchasing ?? 0),
    qtyInTransit: num(sourcing?.qtyInTransit ?? 0),
    qtyOwnWarehouse: num(sourcing?.qtyOwnWarehouse ?? 0),
  };
}

function SourcingFormInner({
  productId,
  sourcing,
}: {
  productId: string;
  sourcing: ProductSourcing | null;
}) {
  const mutation = useSaveProductSourcing(productId);
  const { data: currency } = useCurrency();
  const { data: settings } = useStoreSettings();

  const [values, setValues] = useState<Record<NumericKey, string>>(() =>
    initialValues(sourcing),
  );
  const [link, setLink] = useState(sourcing?.link1688 ?? "");
  const [comment, setComment] = useState(sourcing?.agentComment ?? "");
  const [autoCost, setAutoCost] = useState(sourcing?.autoCost ?? false);
  const [error, setError] = useState<string | null>(null);

  const setValue = (key: NumericKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
    mutation.reset();
  };

  // Предпросмотр себестоимости по текущим курсам
  const rates = currency?.rates ?? null;
  const breakdown =
    rates && settings
      ? calcSourcingCost(
          {
            priceCny: parseDecimal(values.priceCny),
            weightKg: parseDecimal(values.weightKg),
            unitsPerBox: Math.max(1, Math.round(parseDecimal(values.unitsPerBox))),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      link1688: link.trim() === "" ? null : link.trim(),
      agentComment: comment.trim() === "" ? null : comment.trim(),
      priceCny: parseDecimal(values.priceCny),
      weightKg: parseDecimal(values.weightKg),
      unitsPerBox: Math.max(1, Math.round(parseDecimal(values.unitsPerBox) || 1)),
      chinaLogisticsPerBoxCny: parseDecimal(values.chinaLogisticsPerBoxCny),
      packagingPerBoxUsd: parseDecimal(values.packagingPerBoxUsd),
      rfLogisticsPerUnit: parseDecimal(values.rfLogisticsPerUnit),
      autoCost,
      qtyPurchasing: Math.max(0, Math.round(parseDecimal(values.qtyPurchasing))),
      qtyInTransit: Math.max(0, Math.round(parseDecimal(values.qtyInTransit))),
      qtyOwnWarehouse: Math.max(0, Math.round(parseDecimal(values.qtyOwnWarehouse))),
    };

    const parsed = productSourcingInputSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте значения");
      return;
    }

    setError(null);
    mutation.mutate({
      ...parsed.data,
      link1688: parsed.data.link1688 ?? null,
      agentComment: parsed.data.agentComment ?? null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20"
    >
      <h2 className="text-base font-semibold text-text-primary">
        Закупка (Китай)
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        {rates
          ? `Курс: ¥ ${rates.cnyRate.toFixed(2)} ₽ · $ ${rates.usdRate.toFixed(2)} ₽${
              rates.manual ? " (ручной)" : " (ЦБ с надбавкой)"
            }`
          : "Курс валют недоступен — заполните ручной курс в параметрах расчёта"}
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Ссылка на 1688
          </span>
          <span className="flex items-center gap-2">
            <input
              type="url"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                mutation.reset();
              }}
              placeholder="https://detail.1688.com/…"
              className={inputClass}
            />
            {sourcing?.link1688 ? (
              <a
                href={sourcing.link1688}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Открыть товар на 1688"
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-violet-300"
              >
                <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : null}
          </span>
        </label>

        {costFields.map(({ key, label }) => (
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
          </label>
        ))}

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Комментарий для посредника
          </span>
          <input
            type="text"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              mutation.reset();
            }}
            maxLength={500}
            placeholder="Модель, цвет, особенности заказа"
            className={inputClass}
          />
        </label>

        <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Товар в пути (для «Денег в товаре»)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {stageFields.map(({ key, label }) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                {label}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={values[key]}
                onChange={(e) => setValue(key, e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </label>
          ))}
        </div>
      </div>

      {breakdown && breakdown.total > 0 ? (
        <div className="mt-4 space-y-1 rounded-lg border border-line-soft bg-bg px-3 py-2.5 text-xs">
          <div className="flex justify-between text-text-muted">
            <span>Товар + комиссия</span>
            <span className="tabular-nums">
              {formatMoney(breakdown.goodsCost + breakdown.commissionCost)}
            </span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>Логистика (Китай + межд. + РФ)</span>
            <span className="tabular-nums">
              {formatMoney(
                breakdown.intlLogisticsCost +
                  breakdown.boxCost +
                  breakdown.rfLogisticsCost,
              )}
            </span>
          </div>
          <div className="flex justify-between border-t border-line-soft pt-1 text-sm font-semibold text-text-primary">
            <span>Закупка за единицу</span>
            <span className="tabular-nums">{formatMoney(breakdown.total)}</span>
          </div>
        </div>
      ) : null}

      <label className="mt-4 flex items-start gap-2.5 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={autoCost}
          onChange={(e) => {
            setAutoCost(e.target.checked);
            mutation.reset();
          }}
          className="mt-0.5 size-4 accent-violet-500"
        />
        <span>
          Считать «Закупку» себестоимости автоматически
          <span className="block text-xs text-text-muted">
            Поле «Закупка, ₽» будет пересчитываться при изменении курса
            (включает доставку до вашего склада)
          </span>
        </span>
      </label>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      ) : null}
      {mutation.isError ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {mutation.error.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : mutation.isSuccess ? (
          <Check className="size-4 text-emerald-400" aria-hidden />
        ) : null}
        {mutation.isPending
          ? "Сохраняем…"
          : mutation.isSuccess
            ? "Сохранено"
            : "Сохранить закупку"}
      </button>
    </form>
  );
}

export function SourcingForm({ productId }: { productId: string }) {
  const { data: sourcing, isPending } = useProductSourcing(productId);

  if (isPending) {
    return <div className="h-72 animate-pulse rounded-2xl bg-white/5" />;
  }

  return <SourcingFormInner productId={productId} sourcing={sourcing ?? null} />;
}
