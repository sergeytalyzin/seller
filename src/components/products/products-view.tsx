"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PackageSearch, Plug2, RotateCw, Search } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { DEFAULT_PERIOD_KEY, resolvePeriod, type PeriodKey } from "@/lib/period";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodFilter, type CustomRange } from "@/components/dashboard/period-filter";
import type { ProductAnalytics, ProductProfitStatus } from "@/types/analytics";
import { statusMeta } from "./status-badge";
import { ProductsTable, type SortKey, type SortState } from "./products-table";

type StatusFilter = "all" | ProductProfitStatus;

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "profitable", label: statusMeta.profitable.label },
  { value: "low_margin", label: statusMeta.low_margin.label },
  { value: "loss", label: statusMeta.loss.label },
  { value: "no_cost", label: statusMeta.no_cost.label },
];

function applyFilters(
  products: ProductAnalytics[],
  search: string,
  status: StatusFilter,
  sort: SortState,
): ProductAnalytics[] {
  const query = search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.offerId.toLowerCase().includes(query) ||
      (p.sku ?? "").toLowerCase().includes(query)
    );
  });

  const dir = sort.dir === "desc" ? -1 : 1;
  // null (нет данных) всегда в конце списка независимо от направления
  return filtered.sort(
    (a, b) => ((a[sort.key] ?? -Infinity) - (b[sort.key] ?? -Infinity)) * dir,
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
      <div className="border-b border-line bg-surface-soft px-4 py-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line-soft px-4 py-3 last:border-b-0"
        >
          <div className="size-10 animate-pulse rounded-lg bg-white/5" />
          <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

export function ProductsView() {
  const [periodKey, setPeriodKey] = useState<PeriodKey>(DEFAULT_PERIOD_KEY);
  const [custom, setCustom] = useState<CustomRange>(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  });

  const range = useMemo(
    () => resolvePeriod(periodKey, custom),
    [periodKey, custom],
  );

  const { data: products, isPending, isError, error, refetch, isRefetching } =
    useProducts(range);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: "netProfit", dir: "desc" });

  const visible = useMemo(
    () => applyFilters(products ?? [], search, status, sort),
    [products, search, status, sort],
  );

  const countByStatus = useMemo(() => {
    const counts = new Map<StatusFilter, number>([["all", products?.length ?? 0]]);
    for (const p of products ?? []) {
      counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" },
    );

  const filter = (
    <PeriodFilter
      value={periodKey}
      custom={custom}
      onChangeKey={setPeriodKey}
      onChangeCustom={setCustom}
    />
  );

  if (isPending) {
    return (
      <div className="space-y-4">
        {filter}
        <TableSkeleton />
      </div>
    );
  }

  if (products && products.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
        <EmptyState
          icon={Plug2}
          title="Товаров пока нет"
          description="Подключите Ozon API и синхронизируйте магазин — товары появятся здесь."
          action={
            <Link
              href="/settings/ozon"
              className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
            >
              Открыть настройки Ozon
            </Link>
          }
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {filter}
        <div className="rounded-2xl border border-red-500/20 bg-surface shadow-lg shadow-black/20">
        <EmptyState
          icon={PackageSearch}
          title="Не удалось загрузить товары"
          description={error.message}
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
            >
              <RotateCw className={`size-4 ${isRefetching ? "animate-spin" : ""}`} aria-hidden />
              Попробовать снова
            </button>
          }
        />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filter}

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Название, SKU или артикул"
            aria-label="Поиск товаров"
            className="h-9 w-72 rounded-lg border border-line bg-surface pr-3 pl-9 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Фильтр по статусу">
          {statusFilters.map(({ value, label }) => {
            const active = status === value;
            const count = countByStatus.get(value) ?? 0;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={active}
                className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
                  active
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                    : "border-line bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                {label}
                <span className={`text-xs tabular-nums ${active ? "text-violet-400" : "text-text-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Переход в карточку сохраняет выбранный период */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <EmptyState
            icon={PackageSearch}
            title="Ничего не нашлось"
            description="Попробуйте изменить поиск или сбросить фильтры."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
                className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                Сбросить фильтры
              </button>
            }
          />
        </div>
      ) : (
        <ProductsTable
          products={visible}
          sort={sort}
          onSort={toggleSort}
          linkQuery={
            periodKey === "custom"
              ? `?period=custom&from=${custom.from}&to=${custom.to}`
              : `?period=${periodKey}`
          }
        />
      )}
    </div>
  );
}
