import { z } from "zod";

const money = z
  .number({ message: "Укажите число" })
  .min(0, "Не может быть меньше нуля")
  .max(100_000_000, "Слишком большое значение");

export const productCostInputSchema = z.object({
  purchaseCost: money,
  packagingCost: money,
  deliveryCost: money,
  otherCost: money,
  // Налог задаётся на уровне магазина (/settings/store); поле оставлено
  // для совместимости со старыми данными
  taxPercent: z
    .number({ message: "Укажите число" })
    .min(0, "Не может быть меньше нуля")
    .max(100, "Не больше 100%")
    .optional()
    .default(0),
  comment: z
    .string()
    .trim()
    .max(500, "Слишком длинный комментарий")
    .nullable()
    .optional(),
});

export type ProductCostFormValues = z.infer<typeof productCostInputSchema>;

export const bulkCostItemSchema = productCostInputSchema
  .omit({ comment: true })
  .extend({ productId: z.string().min(1) });

export const bulkCostsSchema = z.object({
  items: z.array(bulkCostItemSchema).min(1).max(500),
});

export type BulkCostItem = z.infer<typeof bulkCostItemSchema>;
