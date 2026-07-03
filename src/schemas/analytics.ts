import { z } from "zod";

/** Параметры периода в query: /api/...?dateFrom=...&dateTo=... */
export const periodQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type PeriodQuery = z.infer<typeof periodQuerySchema>;
