import { z } from "zod";

const percent = z
  .number({ message: "Укажите число" })
  .min(0, "Не может быть меньше нуля")
  .max(100, "Не больше 100%");

const money = z
  .number({ message: "Укажите число" })
  .min(0, "Не может быть меньше нуля")
  .max(1_000_000, "Слишком большое значение");

const rate = z
  .number({ message: "Укажите число" })
  .gt(0, "Курс должен быть больше нуля")
  .max(100_000, "Слишком большое значение")
  .nullable();

export const storeSettingsInputSchema = z.object({
  usnPercent: percent,
  vatPercent: percent,
  overheadPerUnit: money,
  agentCommissionPercent: percent,
  logisticsRatePerKgUsd: money,
  currencyMarkupPercent: percent,
  manualCnyRate: rate,
  manualUsdRate: rate,
});

export type StoreSettingsFormValues = z.infer<typeof storeSettingsInputSchema>;

/** Параметры закупки товара в Китае */
export const productSourcingInputSchema = z.object({
  link1688: z
    .string()
    .trim()
    .max(1000, "Слишком длинная ссылка")
    .nullable()
    .optional(),
  agentComment: z
    .string()
    .trim()
    .max(500, "Слишком длинный комментарий")
    .nullable()
    .optional(),
  priceCny: money,
  weightKg: z
    .number({ message: "Укажите число" })
    .min(0, "Не может быть меньше нуля")
    .max(10_000, "Слишком большое значение"),
  unitsPerBox: z
    .number({ message: "Укажите число" })
    .int("Целое число")
    .min(1, "Минимум 1")
    .max(100_000, "Слишком большое значение"),
  chinaLogisticsPerBoxCny: money,
  packagingPerBoxUsd: money,
  rfLogisticsPerUnit: money,
  autoCost: z.boolean(),
  qtyPurchasing: z.number().int().min(0).max(1_000_000),
  qtyInTransit: z.number().int().min(0).max(1_000_000),
  qtyOwnWarehouse: z.number().int().min(0).max(1_000_000),
});

export const bonusAccrualInputSchema = z.object({
  date: z.coerce.date({ message: "Укажите дату" }),
  amount: z
    .number({ message: "Укажите число" })
    .min(0, "Не может быть меньше нуля")
    .max(1_000_000_000, "Слишком большое значение"),
  comment: z
    .string()
    .trim()
    .max(500, "Слишком длинный комментарий")
    .nullable()
    .optional(),
});
