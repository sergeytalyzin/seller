const moneyFormat = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const numberFormat = new Intl.NumberFormat("ru-RU");

export function formatMoney(value: number): string {
  return moneyFormat.format(value);
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Парсит пользовательский ввод «1 234,5» в число; пустая строка — 0 */
export function parseDecimal(value: string): number {
  return value.trim() === "" ? 0 : Number(value.replace(/\s/g, "").replace(",", "."));
}

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDate(value: Date | string): string {
  return dateFormat.format(new Date(value));
}
