"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { ProductCostRow } from "@/types/product";
import type { BulkCostItem } from "@/schemas/cost";

export function useCosts() {
  return useQuery({
    queryKey: queryKeys.costs,
    queryFn: async () => {
      const data = await fetchJson<{ rows: ProductCostRow[] }>("/api/costs");
      return data.rows;
    },
  });
}

export function useSaveCosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { items: BulkCostItem[] }) =>
      fetchJson<{ saved: number }>("/api/costs", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.costs });
      // Все открытые карточки товаров, список товаров и dashboard за любой период
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
