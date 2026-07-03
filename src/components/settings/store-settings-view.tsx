"use client";

import { useState } from "react";
import { Check, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import {
  useBonusAccruals,
  useCreateBonusAccrual,
  useDeleteBonusAccrual,
  useRecategorizeOperations,
  useSaveStoreSettings,
  useStoreSettings,
} from "@/hooks/use-store-settings";
import { storeSettingsInputSchema } from "@/schemas/settings";
import { formatDate, formatMoney, parseDecimal } from "@/lib/format";
import type { StoreSettings } from "@/types/settings";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm text-text-primary tabular-nums placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none";

const taxFields = [
  {
    key: "usnPercent",
    label: "Ставка УСН «доходы», %",
    hint: "Например, 6 или 7",
  },
  {
    key: "vatPercent",
    label: "Ставка упрощённого НДС, %",
    hint: "0, если не платите НДС",
  },
  {
    key: "overheadPerUnit",
    label: "Накладные расходы на единицу, ₽",
    hint: "Упаковка, маркировка и прочее на каждую проданную штуку",
  },
] as const;

const sourcingFields = [
  {
    key: "agentCommissionPercent",
    label: "Комиссия посредника + страховка, %",
    hint: "Например, 4,5",
  },
  {
    key: "logisticsRatePerKgUsd",
    label: "Международная логистика, $/кг",
    hint: "Ставка карго Китай → РФ",
  },
  {
    key: "currencyMarkupPercent",
    label: "Надбавка к курсу ЦБ, %",
    hint: "Посредники продают валюту дороже официального курса",
  },
  {
    key: "manualCnyRate",
    label: "Фиксированный курс ¥, ₽ (необязательно)",
    hint: "Если заполнить оба курса — они используются вместо курса ЦБ",
  },
  {
    key: "manualUsdRate",
    label: "Фиксированный курс $, ₽ (необязательно)",
    hint: "Оставьте пустым для автоматического курса ЦБ",
  },
] as const;

type TaxFieldKey =
  | (typeof taxFields)[number]["key"]
  | (typeof sourcingFields)[number]["key"];

function TaxSettingsForm() {
  const { data: settings, isPending } = useStoreSettings();

  if (isPending || !settings) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />;
  }

  return <TaxSettingsFormInner initial={settings} />;
}

function TaxSettingsFormInner({ initial }: { initial: StoreSettings }) {
  const saveMutation = useSaveStoreSettings();

  const [values, setValues] = useState<Record<TaxFieldKey, string>>({
    usnPercent: String(initial.usnPercent),
    vatPercent: String(initial.vatPercent),
    overheadPerUnit: String(initial.overheadPerUnit),
    agentCommissionPercent: String(initial.agentCommissionPercent),
    logisticsRatePerKgUsd: String(initial.logisticsRatePerKgUsd),
    currencyMarkupPercent: String(initial.currencyMarkupPercent),
    manualCnyRate: initial.manualCnyRate != null ? String(initial.manualCnyRate) : "",
    manualUsdRate: initial.manualUsdRate != null ? String(initial.manualUsdRate) : "",
  });
  const [errors, setErrors] = useState<Partial<Record<TaxFieldKey, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = storeSettingsInputSchema.safeParse({
      usnPercent: parseDecimal(values.usnPercent),
      vatPercent: parseDecimal(values.vatPercent),
      overheadPerUnit: parseDecimal(values.overheadPerUnit),
      agentCommissionPercent: parseDecimal(values.agentCommissionPercent),
      logisticsRatePerKgUsd: parseDecimal(values.logisticsRatePerKgUsd),
      currencyMarkupPercent: parseDecimal(values.currencyMarkupPercent),
      manualCnyRate:
        values.manualCnyRate.trim() === "" ? null : parseDecimal(values.manualCnyRate),
      manualUsdRate:
        values.manualUsdRate.trim() === "" ? null : parseDecimal(values.manualUsdRate),
    });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<TaxFieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as TaxFieldKey;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    saveMutation.mutate(parsed.data);
  };

  const renderField = ({
    key,
    label,
    hint,
  }: {
    key: TaxFieldKey;
    label: string;
    hint: string;
  }) => (
    <label key={key} className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={values[key]}
        onChange={(e) => {
          setValues((prev) => ({ ...prev, [key]: e.target.value }));
          setErrors((prev) => ({ ...prev, [key]: undefined }));
          saveMutation.reset();
        }}
        placeholder="0"
        aria-invalid={errors[key] ? true : undefined}
        className={inputClass}
      />
      <span className="mt-1 block text-xs text-text-muted">
        {errors[key] ? (
          <span role="alert" className="text-red-400">
            {errors[key]}
          </span>
        ) : (
          hint
        )}
      </span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {taxFields.map(renderField)}

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Закупка в Китае
      </p>
      {sourcingFields.map(renderField)}

      {saveMutation.isError ? (
        <p role="alert" className="text-sm text-red-400">
          {saveMutation.error.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saveMutation.isPending}
        className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saveMutation.isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : saveMutation.isSuccess ? (
          <Check className="size-4 text-emerald-400" aria-hidden />
        ) : null}
        {saveMutation.isPending
          ? "Сохраняем…"
          : saveMutation.isSuccess
            ? "Сохранено"
            : "Сохранить"}
      </button>
    </form>
  );
}

function BonusAccrualsSection() {
  const { data: accruals, isPending } = useBonusAccruals();
  const createMutation = useCreateBonusAccrual();
  const deleteMutation = useDeleteBonusAccrual();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseDecimal(amount);
    if (!date || !(value > 0)) return;
    createMutation.mutate(
      {
        date,
        amount: value,
        comment: comment.trim() === "" ? null : comment.trim(),
      },
      {
        onSuccess: () => {
          setAmount("");
          setComment("");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Дата
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputClass} w-40`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Сумма баллов, ₽
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={`${inputClass} w-36`}
          />
        </label>
        <label className="block min-w-48 flex-1">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Комментарий
          </span>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder="Например: баллы за июнь"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={createMutation.isPending || parseDecimal(amount) <= 0}
          className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : null}
          Добавить
        </button>
      </form>

      {createMutation.isError ? (
        <p role="alert" className="text-sm text-red-400">
          {createMutation.error.message}
        </p>
      ) : null}

      {isPending ? (
        <div className="h-20 animate-pulse rounded-xl bg-white/5" />
      ) : (accruals ?? []).length === 0 ? (
        <p className="text-sm text-text-muted">
          Записей пока нет. Сумму начисленных баллов за месяц можно посмотреть в
          личном кабинете Ozon.
        </p>
      ) : (
        <ul className="divide-y divide-line-soft rounded-xl border border-line-soft">
          {(accruals ?? []).map((accrual) => (
            <li
              key={accrual.id}
              className="flex items-center gap-3 px-4 py-2.5 text-sm"
            >
              <span className="w-24 text-text-secondary tabular-nums">
                {formatDate(accrual.date)}
              </span>
              <span className="font-semibold text-text-primary tabular-nums">
                {formatMoney(accrual.amount)}
              </span>
              <span className="min-w-0 flex-1 truncate text-text-muted">
                {accrual.comment ?? ""}
              </span>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(accrual.id)}
                disabled={deleteMutation.isPending}
                aria-label="Удалить запись"
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecategorizeSection() {
  const mutation = useRecategorizeOperations();

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
        {mutation.isPending ? "Пересчитываем…" : "Пересчитать категории"}
      </button>
      {mutation.isSuccess ? (
        <p className="flex items-center gap-2 text-sm text-emerald-400">
          <Check className="size-4" aria-hidden />
          Обновлено операций: {mutation.data.updated}
        </p>
      ) : null}
      {mutation.isError ? (
        <p role="alert" className="text-sm text-red-400">
          {mutation.error.message}
        </p>
      ) : null}
    </div>
  );
}

export function StoreSettingsView() {
  return (
    <div className="max-w-2xl space-y-4">
      <SectionCard
        title="Налоги, накладные и закупка"
        description="Налог считается от продаж за вычетом баллов Ozon: сначала выделяется НДС, затем от остатка берётся УСН. Параметры закупки используются для автоматического расчёта себестоимости товаров из Китая (курс ЦБ подтягивается сам)."
      >
        <TaxSettingsForm />
      </SectionCard>

      <SectionCard
        title="Баллы Ozon за скидки"
        description="Соплатёж Ozon по программе баллов. Вводится вручную и уменьшает налоговую базу за период."
      >
        <BonusAccrualsSection />
      </SectionCard>

      <SectionCard
        title="Категории расходов"
        description="Разложить уже загруженные операции Ozon по категориям заново (комиссия, логистика, реклама, хранение и т.д.). Достаточно одного запуска после обновления приложения."
      >
        <RecategorizeSection />
      </SectionCard>
    </div>
  );
}
