"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { OzonSettingsInfo } from "@/schemas/ozon";
import type { SyncResult } from "@/server/services/sync-service";

export function useOzonSettings() {
  return useQuery({
    queryKey: queryKeys.ozonSettings,
    queryFn: () => fetchJson<OzonSettingsInfo>("/api/settings/ozon"),
  });
}

export function useSaveOzonSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { clientId: string; apiKey: string }) =>
      fetchJson<OzonSettingsInfo>("/api/settings/ozon", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ozonSettings });
    },
  });
}

export type TestConnectionResult = {
  ok: boolean;
  roles: string[];
  expiresAt: string | null;
};

export function useTestOzonConnection() {
  return useMutation({
    mutationFn: () =>
      fetchJson<TestConnectionResult>("/api/settings/ozon/test", {
        method: "POST",
        body: JSON.stringify({}),
      }),
  });
}

function useSyncMutation(endpoint: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { days?: number }) =>
      fetchJson<SyncResult>(endpoint, {
        method: "POST",
        body: JSON.stringify(input ?? {}),
      }),
    // После синхронизации устарело всё: товары, аналитика, dashboard
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useSyncProducts() {
  return useSyncMutation("/api/ozon/sync-products");
}

export function useSyncFinance() {
  return useSyncMutation("/api/ozon/sync-finance");
}

export function useSyncAll() {
  return useSyncMutation("/api/ozon/sync-all");
}
