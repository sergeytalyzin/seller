"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { ProductSourcing, ProductSourcingInput } from "@/types/sourcing";

/** Действующие курсы валют для расчёта закупки */
export type CurrencyInfo = {
  rates: {
    cnyRate: number;
    usdRate: number;
    cbrCnyRate: number | null;
    cbrUsdRate: number | null;
    manual: boolean;
  } | null;
  cnyChange30dPercent: number | null;
};

export function useCurrency() {
  return useQuery({
    queryKey: queryKeys.currency,
    queryFn: () => fetchJson<CurrencyInfo>("/api/currency"),
    staleTime: 60 * 60 * 1000, // курс меняется раз в день
  });
}

export function useProductSourcing(productId: string) {
  return useQuery({
    queryKey: queryKeys.productSourcing(productId),
    queryFn: () =>
      fetchJson<{ sourcing: ProductSourcing | null }>(
        `/api/products/${productId}/sourcing`,
      ).then((data) => data.sourcing),
  });
}

export function useSaveProductSourcing(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductSourcingInput) =>
      fetchJson<{ sourcing: ProductSourcing }>(
        `/api/products/${productId}/sourcing`,
        { method: "PUT", body: JSON.stringify(input) },
      ),
    // Автосебестоимость могла измениться — устаревает вся аналитика
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
