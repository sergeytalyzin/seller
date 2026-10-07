"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type {
  TelegramSettingsFormValues,
  TelegramSettingsInfo,
} from "@/schemas/settings";

export function useTelegramSettings() {
  return useQuery({
    queryKey: queryKeys.telegramSettings,
    queryFn: () => fetchJson<TelegramSettingsInfo>("/api/settings/telegram"),
  });
}

export function useSaveTelegramSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TelegramSettingsFormValues) =>
      fetchJson<TelegramSettingsInfo>("/api/settings/telegram", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telegramSettings });
    },
  });
}

export function useTestTelegram() {
  return useMutation({
    mutationFn: () =>
      fetchJson<{ ok: boolean }>("/api/settings/telegram/test", {
        method: "POST",
        body: JSON.stringify({}),
      }),
  });
}
