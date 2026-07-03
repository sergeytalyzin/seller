"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { ProductAnalytics } from "@/types/analytics";

export function useProducts(range: { dateFrom: Date; dateTo: Date }) {
  const dateFrom = range.dateFrom.toISOString();
  const dateTo = range.dateTo.toISOString();

  return useQuery({
    queryKey: queryKeys.products(`${dateFrom}_${dateTo}`),
    queryFn: async () => {
      const data = await fetchJson<{ products: ProductAnalytics[] }>(
        `/api/products?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`,
      );
      return data.products;
    },
  });
}
