"use client";

import { useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { EXPENSE_CATEGORIES, expenseInputSchema } from "@/schemas/expense";
import { parseDecimal } from "@/lib/format";
import type { Expense } from "@/types/expense";
import type { ExpensePayload } from "@/hooks/use-expenses";

type FieldKey = "title" | "amount" | "date" | "category";

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

const inputClass = (invalid: boolean) =>
  `h-9 w-full rounded-lg border bg-bg px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${
    invalid
      ? "border-red-500/60 focus:border-red-500"
      : "border-line focus:border-violet-500/50"
  }`;

export function ExpenseForm({
  initial,
  pending,
  errorMessage,
  submitLabel,
  onSubmit,
}: {
  initial: Expense | null;
  pending: boolean;
  errorMessage: string | null;
  submitLabel: string;
  onSubmit: (payload: ExpensePayload) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(
    (initial ? new Date(initial.date) : new Date()).toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState<string>(
    initial?.category ?? EXPENSE_CATEGORIES[0],
  );
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: title.trim(),
      category,
      amount: parseDecimal(amount),
      date,
      comment: comment.trim() === "" ? null : comment.trim(),
    };

    const parsed = expenseInputSchema.safeParse(payload);
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
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Название" error={errors.title}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: реклама, зарплата, подписка"
          aria-invalid={errors.title ? true : undefined}
          className={inputClass(Boolean(errors.title))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Сумма, ₽" error={errors.amount}>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            aria-invalid={errors.amount ? true : undefined}
            className={`${inputClass(Boolean(errors.amount))} tabular-nums`}
          />
        </Field>
        <Field label="Дата" error={errors.date}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={errors.date ? true : undefined}
            className={inputClass(Boolean(errors.date))}
          />
        </Field>
      </div>

      <Field label="Категория" error={errors.category}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass(Boolean(errors.category))}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Комментарий">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Необязательно"
          className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none"
        />
      </Field>

      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Сохраняем…" : submitLabel}
      </button>
    </form>
  );
}
