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

/** Единый период по умолчанию для всех страниц приложения */
export const DEFAULT_PERIOD_KEY: PeriodKey = "14d";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Возвращает границы периода для запроса аналитики */
export function resolvePeriod(
  key: PeriodKey,
  custom?: { from: string; to: string },
): { dateFrom: Date; dateTo: Date } {
  const now = new Date();

  switch (key) {
    case "today":
      return { dateFrom: startOfDay(now), dateTo: now };
    case "yesterday": {
      const todayStart = startOfDay(now);
      return {
        dateFrom: new Date(todayStart.getTime() - DAY_MS),
        dateTo: todayStart,
      };
    }
    case "7d":
      return { dateFrom: new Date(now.getTime() - 7 * DAY_MS), dateTo: now };
    case "14d":
      return { dateFrom: new Date(now.getTime() - 14 * DAY_MS), dateTo: now };
    case "month":
      return { dateFrom: new Date(now.getTime() - 30 * DAY_MS), dateTo: now };
    case "60d":
      return { dateFrom: new Date(now.getTime() - 60 * DAY_MS), dateTo: now };
    case "custom": {
      const from = custom?.from ? startOfDay(new Date(custom.from)) : startOfDay(now);
      const toDay = custom?.to ? startOfDay(new Date(custom.to)) : startOfDay(now);
      // Конец периода — конец выбранного дня
      return { dateFrom: from, dateTo: new Date(toDay.getTime() + DAY_MS - 1) };
    }
  }
}
