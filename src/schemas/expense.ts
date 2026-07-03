import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "Зарплаты",
  "Реклама",
  "Сервисы",
  "Хранение",
  "Упаковка",
  "Налоги",
  "Доставка из Китая",
  "Подписки",
  "Подрядчики",
  "Прочее",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const expenseInputSchema = z.object({
  title: z
    .string({ message: "Укажите название" })
    .trim()
    .min(1, "Укажите название")
    .max(200, "Слишком длинное название"),
  category: z.enum(EXPENSE_CATEGORIES, { message: "Выберите категорию" }),
  amount: z
    .number({ message: "Укажите число" })
    .positive("Сумма должна быть больше нуля")
    .max(1_000_000_000, "Слишком большое значение"),
  date: z.coerce.date({ message: "Укажите дату" }),
  comment: z
    .string()
    .trim()
    .max(500, "Слишком длинный комментарий")
    .nullable()
    .optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseInputSchema>;
