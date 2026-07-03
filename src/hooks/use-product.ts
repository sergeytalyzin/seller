"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { Product, ProductCost, ProductCostInput } from "@/types/product";
import type { FinanceOperation } from "@/types/finance";
import type { ProductAnalytics } from "@/types/analytics";
import type { ProductStocks } from "@/types/stocks";

export type ProductDetailData = {
  product: Product;
  analytics: ProductAnalytics;
  cost: ProductCost | null;
  operations: FinanceOperation[];
};

export function useProduct(
  productId: string,
  range: { dateFrom: Date; dateTo: Date },
) {
  const dateFrom = range.dateFrom.toISOString();
  const dateTo = range.dateTo.toISOString();

  return useQuery({
    queryKey: queryKeys.product(productId, `${dateFrom}_${dateTo}`),
    queryFn: () =>
      fetchJson<ProductDetailData>(
        `/api/products/${productId}?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`,
      ),
  });
}

/**
 * Остатки по кластерам и складам Ozon. Дат в запросе нет: /v1/analytics/stocks
 * отдаёт метрики за фиксированное 28-дневное окно (periodFrom/periodTo в ответе).
 */
export function useProductStocks(productId: string) {
  return useQuery({
    queryKey: queryKeys.productStocks(productId),
    queryFn: () => fetchJson<ProductStocks>(`/api/products/${productId}/stocks`),
  });
}

export function useSaveProductCost(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductCostInput) =>
      fetchJson<{ cost: ProductCost }>(`/api/products/${productId}/cost`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      // Префиксы — все периоды карточки, списка товаров и dashboard
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
