"use client";

import { Fragment, useState, type CSSProperties } from "react";
import { Boxes, ChevronDown, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import {
  calcPeriodDays,
  calcStockDays,
  getStockStatus,
  SURPLUS_STOCK_DAYS,
  type StockStatus,
} from "@/lib/analytics/stock";
import type { ClusterStock, ProductStocks } from "@/types/stocks";

const stockStatusMeta: Record<StockStatus, { label: string; tone: BadgeTone }> = {
  ok: { label: "Ок", tone: "success" },
  low: { label: "Мало", tone: "warning" },
  out_of_stock: { label: "Нет остатков", tone: "danger" },
  surplus: { label: "Избыток", tone: "accent" },
  no_data: { label: "Нет данных", tone: "muted" },
};

/** Левый «замороженный» блок; офсеты sticky-колонок считаются по width */
const LEFT_COLS = [
  { label: "Артикул / SKU", width: 180, align: "text-left" },
  { label: "Доступный остаток", width: 110, align: "text-right" },
  { label: "Заказы", width: 90, align: "text-right" },
  { label: "В пути", width: 90, align: "text-right" },
  { label: "Всего FBO", width: 100, align: "text-right" },
  { label: "Статус", width: 128, align: "text-left" },
] as const;

const LEFT_WIDTH = LEFT_COLS.reduce((sum, col) => sum + col.width, 0);

function stickyStyle(index: number): CSSProperties {
  let left = 0;
  for (let i = 0; i < index; i += 1) left += LEFT_COLS[i].width;
  return { left, width: LEFT_COLS[index].width, minWidth: LEFT_COLS[index].width };
}

/** Класс sticky-ячейки; последняя колонка блока отделена бордером от кластеров */
function stickyClass(index: number, extra: string): string {
  const edge = index === LEFT_COLS.length - 1 ? "border-r border-line" : "";
  return `sticky z-10 bg-surface ${edge} ${extra}`;
}

function formatQty(value: number | null): string {
  return value == null ? "—" : `${formatNumber(value)} шт`;
}

function formatStockDays(days: number | null): string {
  if (days == null) return "—";
  if (days > SURPLUS_STOCK_DAYS) return "30+";
  return formatNumber(Math.round(days));
}

function sumField(
  clusters: ClusterStock[],
  field: "stockQty" | "ordersQty" | "inTransitQty" | "availableQty",
): number | null {
  let sum = 0;
  let hasValue = false;
  for (const cluster of clusters) {
    const value = cluster[field];
    if (value != null) {
      sum += value;
      hasValue = true;
    }
  }
  return hasValue ? sum : null;
}

function StatusCell({
  stockQty,
  ordersQty,
  stockDays,
  periodDays,
}: {
  stockQty: number | null;
  ordersQty: number | null;
  stockDays: number | null;
  periodDays: number | null;
}) {
  // Запас в днях приходит из API (idc); свой расчёт — запасной вариант
  const days = stockDays ?? calcStockDays(stockQty, ordersQty, periodDays);
  const meta = stockStatusMeta[getStockStatus(stockQty, ordersQty, days)];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Пять ячеек показателей кластера/склада: остаток, заказы, в пути, запас, статус */
function MetricCells({
  stockQty,
  ordersQty,
  inTransitQty,
  stockDays,
  periodDays,
}: {
  stockQty: number | null;
  ordersQty: number | null;
  inTransitQty: number | null;
  stockDays: number | null;
  periodDays: number | null;
}) {
  const days = stockDays ?? calcStockDays(stockQty, ordersQty, periodDays);
  return (
    <>
      <td className="border-l border-line-soft px-3 py-2.5 text-right tabular-nums text-text-secondary whitespace-nowrap">
        {formatQty(stockQty)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary whitespace-nowrap">
        {formatQty(ordersQty)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary whitespace-nowrap">
        {formatQty(inTransitQty)}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary whitespace-nowrap">
        {formatStockDays(days)}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <StatusCell
          stockQty={stockQty}
          ordersQty={ordersQty}
          stockDays={stockDays}
          periodDays={periodDays}
        />
      </td>
    </>
  );
}

/** Пустая группа ячеек кластера в строке склада другого кластера */
function EmptyMetricCells() {
  return (
    <>
      <td className="border-l border-line-soft px-3 py-2.5 text-right text-text-muted">—</td>
      <td className="px-3 py-2.5 text-right text-text-muted">—</td>
      <td className="px-3 py-2.5 text-right text-text-muted">—</td>
      <td className="px-3 py-2.5 text-right text-text-muted">—</td>
      <td className="px-3 py-2.5 text-text-muted">—</td>
    </>
  );
}

const CLUSTER_METRIC_LABELS = ["Остаток", "Заказы", "В пути", "Запас, дн", "Статус"];

/**
 * Матрица доступности товара по кластерам: слева — сводка по товару,
 * справа — группа колонок на каждый кластер; склады раскрываются строками.
 * Период (dateFrom/dateTo) приходит от страницы — внутри ничего не хардкодим.
 */
export function WarehousesClustersTable({
  offerId,
  sku,
  stocks,
  dateFrom,
  dateTo,
}: {
  offerId: string;
  sku: string | null;
  stocks: ProductStocks | null;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!stocks || stocks.clusters.length === 0) {
    return (
      <EmptyState
        icon={Boxes}
        title="Нет данных по складам и кластерам"
        description="По этому товару пока нет информации об остатках, заказах и товарах в пути по кластерам Ozon."
      />
    );
  }

  const { clusters } = stocks;
  // Период из данных backend, иначе — выбранный на странице диапазон
  const periodDays =
    calcPeriodDays(stocks.periodFrom, stocks.periodTo) ??
    (dateFrom && dateTo ? calcPeriodDays(dateFrom, dateTo) : null);

  const totalStock = sumField(clusters, "stockQty");
  const totalOrders = sumField(clusters, "ordersQty");
  const totalTransit = sumField(clusters, "inTransitQty");
  const totalAvailable = sumField(clusters, "availableQty");
  const hasWarehouses = clusters.some((c) => (c.warehouses?.length ?? 0) > 0);

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth: LEFT_WIDTH + clusters.length * 320 }}
      >
        <thead>
          <tr className="border-b border-line-soft text-xs font-medium text-text-muted">
            <th
              scope="colgroup"
              colSpan={LEFT_COLS.length}
              className="sticky left-0 z-20 border-r border-line bg-surface px-3 py-2 text-left"
              style={{ minWidth: LEFT_WIDTH }}
            >
              Товар
            </th>
            {clusters.map((cluster) => (
              <th
                key={cluster.clusterName}
                scope="colgroup"
                colSpan={CLUSTER_METRIC_LABELS.length}
                className="border-l border-line-soft px-3 py-2 text-left text-violet-300"
                title={cluster.clusterName}
              >
                <span className="block max-w-60 truncate">{cluster.clusterName}</span>
              </th>
            ))}
          </tr>
          <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-text-muted">
            {LEFT_COLS.map((col, i) => (
              <th
                key={col.label}
                scope="col"
                className={stickyClass(i, `z-20 px-3 py-2.5 ${col.align} whitespace-nowrap`)}
                style={stickyStyle(i)}
              >
                {col.label}
              </th>
            ))}
            {clusters.map((cluster) => (
              <Fragment key={cluster.clusterName}>
                {CLUSTER_METRIC_LABELS.map((label, i) => (
                  <th
                    key={label}
                    scope="col"
                    className={`px-3 py-2.5 whitespace-nowrap ${
                      i === 0 ? "border-l border-line-soft" : ""
                    } ${label === "Статус" ? "text-left" : "text-right"}`}
                  >
                    {label}
                  </th>
                ))}
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-line-soft last:border-b-0">
            <td className={stickyClass(0, "px-3 py-2.5")} style={stickyStyle(0)}>
              <div className="flex items-center gap-1.5">
                {hasWarehouses ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    aria-label={expanded ? "Скрыть склады" : "Показать склады"}
                    className="-ml-1 rounded p-0.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                  >
                    {expanded ? (
                      <ChevronDown className="size-4" aria-hidden />
                    ) : (
                      <ChevronRight className="size-4" aria-hidden />
                    )}
                  </button>
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate text-text-primary" title={offerId}>
                    {offerId}
                  </span>
                  <span className="block text-xs text-text-muted">
                    SKU {sku ?? "—"}
                  </span>
                </span>
              </div>
            </td>
            <td
              className={stickyClass(1, "px-3 py-2.5 text-right tabular-nums text-text-primary")}
              style={stickyStyle(1)}
            >
              {formatQty(totalAvailable)}
            </td>
            <td
              className={stickyClass(2, "px-3 py-2.5 text-right tabular-nums text-text-secondary")}
              style={stickyStyle(2)}
            >
              {formatQty(totalOrders)}
            </td>
            <td
              className={stickyClass(3, "px-3 py-2.5 text-right tabular-nums text-text-secondary")}
              style={stickyStyle(3)}
            >
              {formatQty(totalTransit)}
            </td>
            <td
              className={stickyClass(4, "px-3 py-2.5 text-right tabular-nums text-text-secondary")}
              style={stickyStyle(4)}
            >
              {formatQty(totalStock)}
            </td>
            <td className={stickyClass(5, "px-3 py-2.5")} style={stickyStyle(5)}>
              <StatusCell
                stockQty={totalStock}
                ordersQty={totalOrders}
                stockDays={stocks.stockDays}
                periodDays={periodDays}
              />
            </td>
            {clusters.map((cluster) => (
              <MetricCells
                key={cluster.clusterName}
                stockQty={cluster.stockQty}
                ordersQty={cluster.ordersQty}
                inTransitQty={cluster.inTransitQty}
                stockDays={cluster.stockDays}
                periodDays={periodDays}
              />
            ))}
          </tr>

          {expanded
            ? clusters.flatMap((cluster) =>
                (cluster.warehouses ?? []).map((warehouse) => (
                  <tr
                    key={`${cluster.clusterName}:${warehouse.warehouseName}`}
                    className="border-b border-line-soft bg-white/[0.02] last:border-b-0"
                  >
                    <td className={stickyClass(0, "px-3 py-2")} style={stickyStyle(0)}>
                      <span className="block min-w-0 pl-5">
                        <span
                          className="block truncate text-text-secondary"
                          title={warehouse.warehouseName}
                        >
                          {warehouse.warehouseName}
                        </span>
                        <span
                          className="block truncate text-xs text-text-muted"
                          title={cluster.clusterName}
                        >
                          {cluster.clusterName}
                        </span>
                      </span>
                    </td>
                    <td
                      className={stickyClass(1, "px-3 py-2 text-right tabular-nums text-text-secondary")}
                      style={stickyStyle(1)}
                    >
                      {formatQty(warehouse.availableQty)}
                    </td>
                    <td
                      className={stickyClass(2, "px-3 py-2 text-right tabular-nums text-text-secondary")}
                      style={stickyStyle(2)}
                    >
                      {formatQty(warehouse.ordersQty)}
                    </td>
                    <td
                      className={stickyClass(3, "px-3 py-2 text-right tabular-nums text-text-secondary")}
                      style={stickyStyle(3)}
                    >
                      {formatQty(warehouse.inTransitQty)}
                    </td>
                    <td
                      className={stickyClass(4, "px-3 py-2 text-right tabular-nums text-text-secondary")}
                      style={stickyStyle(4)}
                    >
                      {formatQty(warehouse.stockQty)}
                    </td>
                    <td className={stickyClass(5, "px-3 py-2")} style={stickyStyle(5)}>
                      <StatusCell
                        stockQty={warehouse.stockQty}
                        ordersQty={warehouse.ordersQty}
                        stockDays={warehouse.stockDays}
                        periodDays={periodDays}
                      />
                    </td>
                    {clusters.map((other) =>
                      other.clusterName === cluster.clusterName ? (
                        <MetricCells
                          key={other.clusterName}
                          stockQty={warehouse.stockQty}
                          ordersQty={warehouse.ordersQty}
                          inTransitQty={warehouse.inTransitQty}
                          stockDays={warehouse.stockDays}
                          periodDays={periodDays}
                        />
                      ) : (
                        <EmptyMetricCells key={other.clusterName} />
                      ),
                    )}
                  </tr>
                )),
              )
            : null}
        </tbody>
      </table>
    </div>
  );
}
