"use client";

import { useMemo, useState } from "react";
import {
  LoaderCircle,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "@/hooks/use-expenses";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import type { Expense } from "@/types/expense";
import { ExpenseForm } from "./expense-form";

type ModalState = { mode: "create" } | { mode: "edit"; expense: Expense } | null;

function ListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line-soft px-4 py-3.5 last:border-b-0"
        >
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
          <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

export function ExpensesView() {
  const { data: expenses, isPending, isError, error, refetch, isRefetching } =
    useExpenses();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const [modal, setModal] = useState<ModalState>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of expenses ?? []) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const total = useMemo(
    () => (expenses ?? []).reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const closeModal = () => {
    setModal(null);
    createMutation.reset();
    updateMutation.reset();
  };

  const addButton = (
    <button
      type="button"
      onClick={() => setModal({ mode: "create" })}
      className="flex h-9 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25"
    >
      <Plus className="size-4" aria-hidden />
      Добавить расход
    </button>
  );

  if (isPending) return <ListSkeleton />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-surface shadow-lg shadow-black/20">
        <EmptyState
          icon={Wallet}
          title="Не удалось загрузить расходы"
          description={error.message}
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
            >
              <RotateCw className={`size-4 ${isRefetching ? "animate-spin" : ""}`} aria-hidden />
              Попробовать снова
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-soft p-5 shadow-lg shadow-black/20">
        <div className="mr-auto">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Всего расходов
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
            {formatMoney(total)}
            <span className="ml-2 text-sm font-normal text-text-muted">
              {formatNumber(expenses.length)} записей
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {byCategory.slice(0, 5).map(([category, sum]) => (
            <Badge key={category}>
              {category} · {formatMoney(sum)}
            </Badge>
          ))}
        </div>
        {addButton}
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <EmptyState
            icon={Wallet}
            title="Расходов пока нет"
            description="Добавьте зарплаты, рекламу, сервисы и другие расходы — они будут учитываться в общей прибыли магазина."
            action={addButton}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-surface-soft">
              <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-text-muted">
                <th scope="col" className="px-4 py-3 text-left">Дата</th>
                <th scope="col" className="w-full px-4 py-3 text-left">Название</th>
                <th scope="col" className="px-4 py-3 text-left">Категория</th>
                <th scope="col" className="px-4 py-3 text-right">Сумма</th>
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const confirming = confirmDeleteId === expense.id;
                const deleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === expense.id;
                return (
                  <tr
                    key={expense.id}
                    className="border-b border-line-soft transition-colors last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary tabular-nums">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-text-primary">
                        {expense.title}
                      </span>
                      {expense.comment ? (
                        <span className="block text-xs text-text-muted">
                          {expense.comment}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{expense.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-text-primary tabular-nums">
                      {formatMoney(expense.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", expense })}
                          aria-label={`Изменить: ${expense.title}`}
                          className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        {confirming ? (
                          <button
                            type="button"
                            onClick={() =>
                              deleteMutation.mutate(expense.id, {
                                onSettled: () => setConfirmDeleteId(null),
                              })
                            }
                            disabled={deleting}
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
                          >
                            {deleting ? (
                              <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
                            ) : null}
                            Удалить?
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(expense.id)}
                            aria-label={`Удалить: ${expense.title}`}
                            className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modal?.mode === "create"}
        onClose={closeModal}
        title="Новый расход"
      >
        <ExpenseForm
          initial={null}
          pending={createMutation.isPending}
          errorMessage={createMutation.isError ? createMutation.error.message : null}
          submitLabel="Добавить"
          onSubmit={(payload) =>
            createMutation.mutate(payload, { onSuccess: closeModal })
          }
        />
      </Modal>

      {modal?.mode === "edit" ? (
        <Modal open onClose={closeModal} title="Изменить расход">
          <ExpenseForm
            initial={modal.expense}
            pending={updateMutation.isPending}
            errorMessage={updateMutation.isError ? updateMutation.error.message : null}
            submitLabel="Сохранить"
            onSubmit={(payload) =>
              updateMutation.mutate(
                { id: modal.expense.id, input: payload },
                { onSuccess: closeModal },
              )
            }
          />
        </Modal>
      ) : null}
    </div>
  );
}
