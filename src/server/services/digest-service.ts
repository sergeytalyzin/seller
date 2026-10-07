import "server-only";

import { resolvePeriod } from "@/lib/period";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { buildDashboard } from "./dashboard-service";

const digestDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

/** Утренний дайджест: итоги вчерашнего дня для Telegram (HTML parse_mode) */
export async function buildDigestText(storeId: string): Promise<string> {
  const { dateFrom, dateTo } = resolvePeriod("yesterday");
  const { metrics } = await buildDashboard(storeId, dateFrom, dateTo);

  const lines: string[] = [
    `📊 <b>Итоги за ${digestDate.format(dateFrom)}</b>`,
    "",
    `Выручка: <b>${formatMoney(metrics.revenue)}</b> (${formatNumber(metrics.ordersCount)} заказов)`,
    `Чистая прибыль: <b>${formatMoney(metrics.netProfit)}</b>`,
    `Маржинальность: ${formatPercent(metrics.marginPercent)}`,
    `Заказано: ${formatNumber(metrics.orderedQuantity)} шт`,
  ];

  const warnings: string[] = [];
  if (metrics.lossProductsCount > 0) {
    warnings.push(`⚠️ Товаров в минусе: ${metrics.lossProductsCount}`);
  }
  if (metrics.noCostProductsCount > 0) {
    warnings.push(
      `⚠️ Без себестоимости: ${metrics.noCostProductsCount} — прибыль по ним не считается`,
    );
  }
  if (Math.abs(metrics.unclassified) > 0.005) {
    warnings.push(
      `⚠️ Не расшифровано начислений: ${formatMoney(metrics.unclassified)}`,
    );
  }
  if (warnings.length > 0) {
    lines.push("", ...warnings);
  }

  return lines.join("\n");
}
