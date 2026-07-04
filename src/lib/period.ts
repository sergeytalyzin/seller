export const periodPresets = [
  { key: "today", label: "Сегодня" },
  { key: "yesterday", label: "Вчера" },
  { key: "7d", label: "7 дней" },
  { key: "14d", label: "14 дней" },
  { key: "month", label: "Месяц" },
  { key: "60d", label: "60 дней" },
  { key: "custom", label: "Свой период" },
] as const;

export type PeriodKey = (typeof periodPresets)[number]["key"];

export type CustomRange = { from: string; to: string };

/** Единый период по умолчанию для всех страниц приложения */
export const DEFAULT_PERIOD_KEY: PeriodKey = "14d";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Возвращает границы периода для запроса аналитики.
 *
 * Границы всегда выровнены по дням (00:00:00.000 — 23:59:59.999): в течение
 * дня один и тот же пресет даёт одинаковые границы, поэтому ключи кэша
 * TanStack Query стабильны и переходы между страницами берут данные из кэша.
 * «N дней» — это N календарных дней, включая сегодняшний.
 */
export function resolvePeriod(
  key: PeriodKey,
  custom?: CustomRange,
): { dateFrom: Date; dateTo: Date } {
  const todayStart = startOfDay(new Date());
  const lastDays = (days: number) => ({
    dateFrom: new Date(todayStart.getTime() - (days - 1) * DAY_MS),
    dateTo: new Date(todayStart.getTime() + DAY_MS - 1),
  });

  switch (key) {
    case "today":
      return lastDays(1);
    case "yesterday":
      return {
        dateFrom: new Date(todayStart.getTime() - DAY_MS),
        dateTo: new Date(todayStart.getTime() - 1),
      };
    case "7d":
      return lastDays(7);
    case "14d":
      return lastDays(14);
    case "month":
      return lastDays(30);
    case "60d":
      return lastDays(60);
    case "custom": {
      const from = custom?.from ? startOfDay(new Date(custom.from)) : todayStart;
      const toDay = custom?.to ? startOfDay(new Date(custom.to)) : todayStart;
      // Конец периода — конец выбранного дня
      return { dateFrom: from, dateTo: new Date(toDay.getTime() + DAY_MS - 1) };
    }
  }
}
