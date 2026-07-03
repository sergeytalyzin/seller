"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { StoreSettings } from "@/types/settings";

/** Баллы Ozon в ответе API (даты сериализованы строками) */
export type BonusAccrualDto = {
  id: string;
  date: string;
  amount: number;
  comment: string | null;
};

export function useStoreSettings() {
  return useQuery({
    queryKey: queryKeys.storeSettings,
    queryFn: () => fetchJson<StoreSettings>("/api/settings/store"),
  });
}

export function useSaveStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StoreSettings) =>
      fetchJson<StoreSettings>("/api/settings/store", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    // Настройки влияют на все расчёты — сбрасываем весь кэш
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useBonusAccruals() {
  return useQuery({
    queryKey: queryKeys.bonusPoints,
    queryFn: () =>
      fetchJson<{ accruals: BonusAccrualDto[] }>("/api/bonus-points").then(
        (data) => data.accruals,
      ),
  });
}

export function useCreateBonusAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: string; amount: number; comment: string | null }) =>
      fetchJson<BonusAccrualDto>("/api/bonus-points", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useDeleteBonusAccrual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: boolean }>(`/api/bonus-points/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

/** Пересчёт категорий сохранённых операций из raw-данных Ozon */
export function useRecategorizeOperations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson<{ updated: number }>("/api/ozon/recategorize", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
