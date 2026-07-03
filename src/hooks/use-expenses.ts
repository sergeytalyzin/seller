"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { Expense } from "@/types/expense";

/** Payload для API: дата уходит строкой, сервер приводит через zod */
export type ExpensePayload = {
  title: string;
  category: string;
  amount: number;
  date: string;
  comment: string | null;
};

export function useExpenses() {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: async () => {
      const data = await fetchJson<{ expenses: Expense[] }>("/api/expenses");
      return data.expenses;
    },
  });
}

function useInvalidateExpenses() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: (input: ExpensePayload) =>
      fetchJson<{ expense: Expense }>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpensePayload }) =>
      fetchJson<{ expense: Expense }>(`/api/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: boolean }>(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
