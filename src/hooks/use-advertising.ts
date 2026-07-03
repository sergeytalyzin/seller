"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { AdvertisingData } from "@/types/advertising";
import type { PerformanceSettingsInfo } from "@/app/api/settings/performance/route";

export function useAdvertising(range: { dateFrom: Date; dateTo: Date }) {
  const dateFrom = range.dateFrom.toISOString();
  const dateTo = range.dateTo.toISOString();

  return useQuery({
    queryKey: queryKeys.advertising(`${dateFrom}_${dateTo}`),
    queryFn: () =>
      fetchJson<AdvertisingData>(
        `/api/advertising?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`,
      ),
  });
}

export function usePerformanceSettings() {
  return useQuery({
    queryKey: queryKeys.performanceSettings,
    queryFn: () => fetchJson<PerformanceSettingsInfo>("/api/settings/performance"),
  });
}

export function useSavePerformanceSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { clientId: string; clientSecret: string }) =>
      fetchJson<PerformanceSettingsInfo>("/api/settings/performance", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useSyncPerformance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { days?: number }) =>
      fetchJson<{ updated: number }>("/api/ozon/sync-performance", {
        method: "POST",
        body: JSON.stringify(input ?? {}),
      }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
