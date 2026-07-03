import { z } from "zod";

export const ozonSettingsInputSchema = z.object({
  clientId: z
    .string({ message: "Укажите Client ID" })
    .trim()
    .min(1, "Укажите Client ID")
    .max(100, "Слишком длинное значение"),
  apiKey: z
    .string({ message: "Укажите API Key" })
    .trim()
    .min(10, "API Key слишком короткий")
    .max(200, "Слишком длинное значение"),
});

export const syncRequestSchema = z.object({
  /** За сколько последних дней тянуть финансовые операции */
  days: z.number().int().min(1).max(365).optional().default(90),
});

/** Ответ GET /api/settings/ozon — ключ наружу не отдаём, только маску */
export type OzonSettingsInfo = {
  connected: boolean;
  clientId: string | null;
  apiKeyMask: string | null;
  updatedAt: string | null;
};
