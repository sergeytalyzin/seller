"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import type { ProductAnalytics } from "@/types/analytics";
import { ProductThumb } from "./product-thumb";
import { StatusBadge } from "./status-badge";

export type SortKey =
  | "netProfit"
  | "grossRevenue"
  | "marginPercent"
  | "roiPercent"
  | "soldQuantity"
  | "orderedQuantity"
  | "buyoutPercent";

export type SortState = { key: SortKey; dir: "asc" | "desc" };

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === sortKey;
  const Icon = active ? (sort.dir === "desc" ? ArrowDown : ArrowUp) : ArrowUpDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "desc" ? "descending" : "ascending") : undefined}
      className="px-3 py-3 text-right"
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 rounded px-1 text-xs font-medium uppercase tracking-wide transition-colors hover:text-text-primary ${
          active ? "text-violet-300" : "text-text-muted"
        }`}
      >
        {label}
        <Icon className="size-3" aria-hidden />
      </button>
    </th>
  );
}

function profitColor(value: number): string {
  if (value < 0) return "text-red-400";
  if (value > 0) return "text-emerald-400";
  return "text-text-secondary";
}

function marginColor(value: number): string {
  if (value < 0) return "text-red-400";
  if (value < 10) return "text-amber-300";
  return "text-emerald-400";
}

const headerCell =
  "px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted";

export function ProductsTable({
  products,
  sort,
  onSort,
  linkQuery = "",
}: {
  products: ProductAnalytics[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  /** Query-параметры для ссылок на карточку товара (выбранный период) */
  linkQuery?: string;
}) {
  const router = useRouter();

  return (
    <div className="max-h-[calc(100vh-16rem)] overflow-auto rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
      <table className="w-full min-w-4xl border-collapse text-sm">
        <thead className="sticky top-0 z-1 bg-surface-soft">
          <tr className="border-b border-line">
            <th scope="col" className={`${headerCell} w-full min-w-72 text-left!`}>
              Товар
            </th>
            <th scope="col" className={`${headerCell} text-left!`}>SKU</th>
            <th scope="col" className={headerCell}>Цена</th>
            <SortableHeader label="Заказано" sortKey="orderedQuantity" sort={sort} onSort={onSort} />
            <SortableHeader label="Продано" sortKey="soldQuantity" sort={sort} onSort={onSort} />
            <SortableHeader label="% выкупа" sortKey="buyoutPercent" sort={sort} onSort={onSort} />
            <SortableHeader label="Выручка" sortKey="grossRevenue" sort={sort} onSort={onSort} />
            <th scope="col" className={headerCell}>Ср. цена</th>
            <th scope="col" className={headerCell}>Комиссия</th>
            <th scope="col" className={headerCell}>Логистика</th>
            <th scope="col" className={headerCell}>Реклама</th>
            <th scope="col" className={headerCell}>Себестоимость</th>
            <SortableHeader label="Прибыль" sortKey="netProfit" sort={sort} onSort={onSort} />
            <th scope="col" className={headerCell}>Приб./ед.</th>
            <SortableHeader label="Маржа" sortKey="marginPercent" sort={sort} onSort={onSort} />
            <SortableHeader label="ROI" sortKey="roiPercent" sort={sort} onSort={onSort} />
            <th scope="col" className={`${headerCell} text-left!`}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const noCost = p.status === "no_cost";
            return (
              <tr
                key={p.productId}
                onClick={() => router.push(`/products/${p.productId}${linkQuery}`)}
                className="cursor-pointer border-b border-line-soft transition-colors last:border-b-0 hover:bg-white/[0.03]"
              >
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-3">
                    <ProductThumb name={p.name} imageUrl={p.imageUrl} />
                    <span className="min-w-0">
                      <Link
                        href={`/products/${p.productId}${linkQuery}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-medium text-text-primary hover:text-violet-300"
                      >
                        {p.name}
                      </Link>
                      <span className="block text-xs text-text-muted">
                        {p.offerId}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-left text-text-muted tabular-nums">
                  {p.sku ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                  {p.price != null ? formatMoney(p.price) : "—"}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title="Заказано по FBO за период, включая ещё не доставленные"
                >
                  {formatNumber(p.orderedQuantity)}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title="Продано — доставлено покупателю (по финансовым операциям)"
                >
                  {formatNumber(p.soldQuantity)}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title="Доставлено / (доставлено + отменено) по FBO-заказам за период"
                >
                  {p.buyoutPercent != null ? formatPercent(p.buyoutPercent) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-primary">
                  {formatMoney(p.grossRevenue)}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title="Средняя цена продажи за период"
                >
                  {p.avgSalePrice != null ? formatMoney(p.avgSalePrice) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                  {formatMoney(p.commission)}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title="Прямая логистика и последняя миля"
                >
                  {formatMoney(p.logistics + p.lastMile)}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title="Продвижение, списанное с баланса Seller API"
                >
                  {formatMoney(p.advertising)}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title={noCost ? "Добавьте себестоимость, чтобы увидеть реальную прибыль" : undefined}
                >
                  {noCost ? "—" : formatMoney(p.totalProductCost)}
                </td>
                <td
                  className={`px-3 py-2.5 text-right font-semibold tabular-nums ${
                    noCost ? "text-text-muted" : profitColor(p.netProfit)
                  }`}
                >
                  {noCost ? "—" : formatMoney(p.netProfit)}
                </td>
                <td
                  className="px-3 py-2.5 text-right tabular-nums text-text-secondary"
                  title="Прибыль на 1 проданную единицу"
                >
                  {p.profitPerUnit != null ? formatMoney(p.profitPerUnit) : "—"}
                </td>
                <td
                  className={`px-3 py-2.5 text-right tabular-nums ${
                    noCost ? "text-text-muted" : marginColor(p.marginPercent)
                  }`}
                >
                  {noCost ? "—" : formatPercent(p.marginPercent)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                  {noCost ? "—" : formatPercent(p.roiPercent)}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
