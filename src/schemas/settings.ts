import { z } from "zod";

const percent = z
  .number({ message: "Укажите число" })
  .min(0, "Не может быть меньше нуля")
  .max(100, "Не больше 100%");

export const storeSettingsInputSchema = z.object({
  usnPercent: percent,
  vatPercent: percent,
  overheadPerUnit: z
    .number({ message: "Укажите число" })
    .min(0, "Не может быть меньше нуля")
    .max(1_000_000, "Слишком большое значение"),
});

export type StoreSettingsFormValues = z.infer<typeof storeSettingsInputSchema>;

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
