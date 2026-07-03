import "server-only";

import { z } from "zod";

/**
 * Клиент Ozon Performance API (рекламный кабинет).
 * Источник истины — performance-api.json (OpenAPI Ozon Performance API v2.0).
 *
 * Авторизация: POST /api/client/token с client_id/client_secret
 * (grant_type=client_credentials) → Bearer-токен на 1800 секунд.
 */

const BASE_URL = "https://api-performance.ozon.ru";
const REQUEST_TIMEOUT_MS = 30_000;

export type PerformanceCredentials = {
  clientId: string;
  clientSecret: string;
};

export class PerformanceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PerformanceApiError";
  }
}

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

// Кэш токенов в памяти процесса: токен живёт 30 минут
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getToken(credentials: PerformanceCredentials): Promise<string> {
  const cached = tokenCache.get(credentials.clientId);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const response = await fetch(`${BASE_URL}/api/client/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: "client_credentials",
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new PerformanceApiError(
      "Не удалось авторизоваться в Performance API — проверьте Client ID и Client Secret",
      response.status,
    );
  }

  const parsed = tokenResponseSchema.parse(await response.json());
  tokenCache.set(credentials.clientId, {
    token: parsed.access_token,
    expiresAt: Date.now() + parsed.expires_in * 1000,
  });
  return parsed.access_token;
}

async function perfRequest(
  credentials: PerformanceCredentials,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<unknown> {
  const token = await getToken(credentials);
  const response = await fetch(`${BASE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init?.body != null ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`Performance API ${path}: ${response.status} ${text.slice(0, 300)}`);
    throw new PerformanceApiError(
      "Ошибка запроса к Performance API",
      response.status,
    );
  }

  return response.json();
}

// GET /api/client/campaign — extcampaignCampaignsList
const campaignsSchema = z.object({
  list: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().optional().default(""),
        state: z.string().optional().default(""),
        // SKU — оплата за клик; SEARCH_PROMO — оплата за заказ;
        // BANNER / VIDEO_BANNER — медийные кампании
        advObjectType: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

export type PerformanceCampaign = z.infer<typeof campaignsSchema>["list"][number];

export async function fetchPerformanceCampaigns(
  credentials: PerformanceCredentials,
): Promise<PerformanceCampaign[]> {
  const data = await perfRequest(credentials, "/api/client/campaign");
  return campaignsSchema.parse(data).list;
}

// POST /api/client/statistics/json → { UUID }
const requestIdSchema = z.object({ UUID: z.string() });
// GET /api/client/statistics/{UUID} → { state: "OK" | "ERROR" | ... , error?: }
const statusSchema = z.object({
  state: z.string().optional().default(""),
  error: z.string().nullish(),
});

/** Числа в отчётах приходят строками с запятой: "405,50" */
function parseReportNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.trim() === "") return 0;
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Дата в отчёте: "01.06.2026" → Date (00:00 UTC) */
function parseReportDate(value: string): Date | null {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  return new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00Z`);
}

// Строка отчёта «Оплата за клик» (groupBy: DATE); формат проверен на реальном
// ответе /api/client/statistics/report: поля-числа — строки с запятой,
// поле orders может отсутствовать в днях без заказов
const cpcReportRowSchema = z
  .object({
    date: z.string(),
    sku: z.string(),
    views: z.string().optional().default("0"),
    clicks: z.string().optional().default("0"),
    toCart: z.string().optional().default("0"),
    moneySpent: z.string().optional().default("0"),
    orders: z.string().optional().default("0"),
    ordersMoney: z.string().optional().default("0"),
  })
  .loose();

// Ответ /api/client/statistics/report для отчёта по кампаниям:
// { "<campaignId>": { title, report: { rows: [...] } } }
const cpcReportSchema = z.record(
  z.string(),
  z.object({
    title: z.string().optional().default(""),
    report: z
      .object({
        rows: z.array(cpcReportRowSchema).optional().default([]),
      })
      .optional()
      .default({ rows: [] }),
  }),
);

export type AdSpendRow = {
  campaignId: string;
  date: Date;
  sku: string;
  views: number;
  clicks: number;
  toCart: number;
  spent: number;
  orders: number;
  ordersMoney: number;
};

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 180_000;

async function waitForReport(
  credentials: PerformanceCredentials,
  uuid: string,
): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    const status = statusSchema.parse(
      await perfRequest(credentials, `/api/client/statistics/${uuid}`),
    );
    if (status.state === "OK") return;
    if (status.state === "ERROR" || status.state === "FAILED") {
      throw new PerformanceApiError(
        `Отчёт Performance API не сформировался: ${status.error ?? status.state}`,
        500,
      );
    }
    if (Date.now() > deadline) {
      throw new PerformanceApiError("Отчёт Performance API формируется слишком долго", 504);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

/** Лимит Performance API: не больше 10 кампаний в одном отчёте */
const MAX_CAMPAIGNS_PER_REPORT = 10;
/** Лимит Performance API: не больше 62 дней в выгрузке */
export const MAX_REPORT_DAYS = 62;

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Дневная статистика по SKU для кампаний «Оплата за клик»:
 * POST /api/client/statistics/json (groupBy: DATE) → poll → download.
 * Лимит «1 одновременная выгрузка» — отчёты запрашиваются последовательно.
 */
export async function fetchCpcSkuDaily(
  credentials: PerformanceCredentials,
  campaignIds: string[],
  dateFrom: Date,
  dateTo: Date,
): Promise<AdSpendRow[]> {
  const rows: AdSpendRow[] = [];

  for (let i = 0; i < campaignIds.length; i += MAX_CAMPAIGNS_PER_REPORT) {
    const batch = campaignIds.slice(i, i + MAX_CAMPAIGNS_PER_REPORT);
    const submitted = requestIdSchema.parse(
      await perfRequest(credentials, "/api/client/statistics/json", {
        method: "POST",
        body: {
          campaigns: batch,
          dateFrom: toIsoDay(dateFrom),
          dateTo: toIsoDay(dateTo),
          groupBy: "DATE",
        },
      }),
    );
    await waitForReport(credentials, submitted.UUID);

    const report = cpcReportSchema.parse(
      await perfRequest(
        credentials,
        `/api/client/statistics/report?UUID=${encodeURIComponent(submitted.UUID)}`,
      ),
    );

    for (const [campaignId, campaign] of Object.entries(report)) {
      for (const row of campaign.report.rows) {
        const date = parseReportDate(row.date);
        if (!date || !row.sku) continue;
        rows.push({
          campaignId,
          date,
          sku: row.sku,
          views: Math.round(parseReportNumber(row.views)),
          clicks: Math.round(parseReportNumber(row.clicks)),
          toCart: Math.round(parseReportNumber(row.toCart)),
          spent: parseReportNumber(row.moneySpent),
          orders: Math.round(parseReportNumber(row.orders)),
          ordersMoney: parseReportNumber(row.ordersMoney),
        });
      }
    }
  }

  return rows;
}

// Отчёт по заказам «Оплата за заказ»:
// POST /api/client/statistic/orders/generate/json {from, to} → poll → { rows }.
// Точная структура строк не описана в performance-api.json (в живых данных
// строк пока не было) — разбираем только поля, совпадающие с описанием отчёта,
// незнакомые строки пропускаем с предупреждением в лог.
const searchPromoReportSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())).optional().default([]),
});

export async function fetchSearchPromoOrders(
  credentials: PerformanceCredentials,
  dateFrom: Date,
  dateTo: Date,
): Promise<AdSpendRow[]> {
  const submitted = requestIdSchema.parse(
    await perfRequest(credentials, "/api/client/statistic/orders/generate/json", {
      method: "POST",
      body: {
        from: `${toIsoDay(dateFrom)}T00:00:00Z`,
        to: `${toIsoDay(dateTo)}T23:59:59Z`,
      },
    }),
  );
  await waitForReport(credentials, submitted.UUID);

  const report = searchPromoReportSchema.parse(
    await perfRequest(
      credentials,
      `/api/client/statistics/report?UUID=${encodeURIComponent(submitted.UUID)}`,
    ),
  );

  const rows: AdSpendRow[] = [];
  for (const raw of report.rows) {
    // Поля по описанию отчёта: дата, SKU, количество, стоимость, расход
    const sku = typeof raw["sku"] === "string" ? raw["sku"] : null;
    const dateValue = typeof raw["date"] === "string" ? raw["date"] : null;
    const date = dateValue
      ? (parseReportDate(dateValue) ?? new Date(`${dateValue.slice(0, 10)}T00:00:00Z`))
      : null;
    if (!sku || !date || Number.isNaN(date.getTime())) {
      console.warn("fetchSearchPromoOrders: незнакомая строка отчёта", raw);
      continue;
    }
    rows.push({
      campaignId: "search_promo",
      date,
      sku,
      views: 0,
      clicks: 0,
      toCart: 0,
      spent: parseReportNumber(raw["expense"] ?? raw["moneySpent"]),
      orders: Math.round(parseReportNumber(raw["quantity"] ?? raw["orders"])),
      ordersMoney: parseReportNumber(raw["price"] ?? raw["ordersMoney"]),
    });
  }
  return rows;
}
