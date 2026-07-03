import "server-only";

import { db } from "@/lib/db";

/**
 * Курсы валют ЦБ РФ с кэшем в таблице CurrencyRate.
 * Источник — официальный XML: https://www.cbr.ru/scripts/XML_daily.asp
 * (без ключей и лимитов). Ежедневные значения накапливаются в БД,
 * чтобы считать динамику курса и переживать недоступность ЦБ.
 */

const CBR_URL = "https://www.cbr.ru/scripts/XML_daily.asp";
const CURRENCIES = ["CNY", "USD"] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export type CurrencyRates = {
  /** ₽ за 1 ¥ */
  cnyRate: number;
  /** ₽ за 1 $ */
  usdRate: number;
  /** День, на который актуальны курсы */
  date: Date;
};

function todayUtc(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/** Разбор XML ЦБ: значения с запятой, номинал бывает 10/100 единиц валюты */
function parseCbrXml(xml: string): Map<string, number> {
  const rates = new Map<string, number>();
  for (const match of xml.matchAll(/<Valute[^>]*>([\s\S]*?)<\/Valute>/g)) {
    const block = match[1];
    const charCode = block.match(/<CharCode>([A-Z]{3})<\/CharCode>/)?.[1];
    const nominal = Number(block.match(/<Nominal>(\d+)<\/Nominal>/)?.[1] ?? "1");
    const valueRaw = block.match(/<Value>([\d,.]+)<\/Value>/)?.[1];
    if (!charCode || !valueRaw || nominal <= 0) continue;
    rates.set(charCode, Number(valueRaw.replace(",", ".")) / nominal);
  }
  return rates;
}

async function fetchAndCacheRates(date: Date): Promise<Map<string, number>> {
  const response = await fetch(CBR_URL, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`ЦБ РФ ответил ${response.status}`);
  // Кодировка ответа windows-1251 — нужные теги в ASCII, декодируем как latin1
  const xml = Buffer.from(await response.arrayBuffer()).toString("latin1");
  const parsed = parseCbrXml(xml);

  for (const currency of CURRENCIES) {
    const rate = parsed.get(currency);
    if (rate == null) continue;
    await db.currencyRate.upsert({
      where: { date_currency: { date, currency } },
      update: { rate },
      create: { date, currency, rate },
    });
  }
  return parsed;
}

async function latestCachedRate(currency: string): Promise<number | null> {
  const row = await db.currencyRate.findFirst({
    where: { currency },
    orderBy: { date: "desc" },
  });
  return row?.rate ?? null;
}

/**
 * Актуальные курсы: сегодняшний кэш, иначе запрос к ЦБ,
 * при недоступности ЦБ — последние сохранённые значения.
 * null — курсов нет совсем (первый запуск без интернета).
 */
export async function getCurrencyRates(): Promise<CurrencyRates | null> {
  const date = todayUtc();

  const cached = await db.currencyRate.findMany({
    where: { date, currency: { in: [...CURRENCIES] } },
  });
  const byCode = new Map(cached.map((r) => [r.currency, r.rate]));

  if (!byCode.has("CNY") || !byCode.has("USD")) {
    try {
      const fetched = await fetchAndCacheRates(date);
      for (const currency of CURRENCIES) {
        const rate = fetched.get(currency);
        if (rate != null) byCode.set(currency, rate);
      }
    } catch (error) {
      console.error("getCurrencyRates: ЦБ недоступен, используем кэш", error);
    }
  }

  const cnyRate = byCode.get("CNY") ?? (await latestCachedRate("CNY"));
  const usdRate = byCode.get("USD") ?? (await latestCachedRate("USD"));
  if (cnyRate == null || usdRate == null) return null;

  return { cnyRate, usdRate, date };
}

/**
 * Изменение курса юаня за N дней, % (для сигнала на дашборде).
 * null — истории ещё не накопилось.
 */
export async function getCnyRateChangePercent(
  days = 30,
): Promise<number | null> {
  const current = await db.currencyRate.findFirst({
    where: { currency: "CNY" },
    orderBy: { date: "desc" },
  });
  if (!current) return null;

  const threshold = new Date(current.date.getTime() - days * DAY_MS);
  const past =
    (await db.currencyRate.findFirst({
      where: { currency: "CNY", date: { lte: threshold } },
      orderBy: { date: "desc" },
    })) ??
    (await db.currencyRate.findFirst({
      where: { currency: "CNY" },
      orderBy: { date: "asc" },
    }));

  if (!past || past.date.getTime() === current.date.getTime()) return null;
  if (past.rate <= 0) return null;
  return ((current.rate - past.rate) / past.rate) * 100;
}
