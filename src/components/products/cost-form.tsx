"use client";

import { useState, type ReactNode } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { productCostInputSchema } from "@/schemas/cost";
import { useSaveProductCost } from "@/hooks/use-product";
import { formatMoney, parseDecimal } from "@/lib/format";
import type { ProductCost } from "@/types/product";

type FieldKey =
  | "purchaseCost"
  | "packagingCost"
  | "deliveryCost"
  | "otherCost"
  | "taxPercent";

const fields: { key: FieldKey; label: string }[] = [
  { key: "purchaseCost", label: "Закупка, ₽" },
  { key: "packagingCost", label: "Упаковка, ₽" },
  { key: "deliveryCost", label: "Доставка до склада, ₽" },
  { key: "otherCost", label: "Прочие расходы, ₽" },
  { key: "taxPercent", label: "Налог с выручки, %" },
];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">
        {label}
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function CostForm({
  productId,
  cost,
}: {
  productId: string;
  cost: ProductCost | null;
}) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    purchaseCost: cost ? String(cost.purchaseCost) : "",
    packagingCost: cost ? String(cost.packagingCost) : "",
    deliveryCost: cost ? String(cost.deliveryCost) : "",
    otherCost: cost ? String(cost.otherCost) : "",
    taxPercent: cost ? String(cost.taxPercent) : "6",
  });
  const [comment, setComment] = useState(cost?.comment ?? "");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const mutation = useSaveProductCost(productId);

  const setValue = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    mutation.reset();
  };

  const unitCost =
    parseDecimal(values.purchaseCost) +
    parseDecimal(values.packagingCost) +
    parseDecimal(values.deliveryCost) +
    parseDecimal(values.otherCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      purchaseCost: parseDecimal(values.purchaseCost),
      packagingCost: parseDecimal(values.packagingCost),
      deliveryCost: parseDecimal(values.deliveryCost),
      otherCost: parseDecimal(values.otherCost),
      taxPercent: parseDecimal(values.taxPercent),
      comment: comment.trim() === "" ? null : comment.trim(),
    };

    const parsed = productCostInputSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    mutation.mutate({ ...parsed.data, comment: parsed.data.comment ?? null });
  };

  const highlight = !cost;

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border p-5 shadow-lg shadow-black/20 ${
        highlight
          ? "border-violet-500/40 bg-surface shadow-[0_0_30px_rgba(139,92,246,0.15)]"
          : "border-line bg-surface"
      }`}
    >
      <h2 className="text-base font-semibold text-text-primary">
        Себестоимость
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        {highlight
          ? "Добавьте себестоимость, чтобы увидеть реальную прибыль по товару."
          : "Значения за единицу товара. После сохранения аналитика пересчитается."}
      </p>

      <div className="mt-4 space-y-3">
        {fields.map(({ key, label }) => (
          <Field key={key} label={label} error={errors[key]}>
            <input
              type="text"
              inputMode="decimal"
              value={values[key]}
              onChange={(e) => setValue(key, e.target.value)}
              aria-invalid={errors[key] ? true : undefined}
              placeholder="0"
              className={`h-9 w-full rounded-lg border bg-bg px-3 text-sm text-text-primary tabular-nums placeholder:text-text-muted focus:outline-none ${
                errors[key]
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-line focus:border-violet-500/50"
              }`}
            />
          </Field>
        ))}

        <Field label="Комментарий">
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              mutation.reset();
            }}
            rows={2}
            maxLength={500}
            placeholder="Партия, поставщик, примечания"
            className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none"
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-line-soft bg-bg px-3 py-2.5">
        <span className="text-xs text-text-secondary">Итого за единицу</span>
        <span className="text-sm font-semibold text-text-primary tabular-nums">
          {Number.isFinite(unitCost) ? formatMoney(unitCost) : "—"}
        </span>
      </div>

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
            : "Сохранить"}
      </button>
    </form>
  );
}
