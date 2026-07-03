"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchJson } from "@/lib/api";
import type { DashboardData } from "@/types/analytics";

export function useDashboard(range: { dateFrom: Date; dateTo: Date }) {
  const dateFrom = range.dateFrom.toISOString();
  const dateTo = range.dateTo.toISOString();

  return useQuery({
    queryKey: queryKeys.dashboard(`${dateFrom}_${dateTo}`),
    queryFn: () =>
      fetchJson<DashboardData>(
        `/api/dashboard?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`,
      ),
  });
}
