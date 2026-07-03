"use client";

import { useMemo, useState } from "react";
import { Check, LoaderCircle, PackageSearch, RotateCw, Search } from "lucide-react";
import { useCosts, useSaveCosts } from "@/hooks/use-costs";
import { bulkCostItemSchema, type BulkCostItem } from "@/schemas/cost";
import { formatMoney, parseDecimal } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductThumb } from "@/components/products/product-thumb";
import type { ProductCostRow } from "@/types/product";

const costFields = [
  { key: "purchaseCost", label: "Закупка, ₽" },
  { key: "packagingCost", label: "Упаковка, ₽" },
  { key: "deliveryCost", label: "Доставка, ₽" },
  { key: "otherCost", label: "Прочие, ₽" },
  { key: "taxPercent", label: "Налог, %" },
] as const;

type CostField = (typeof costFields)[number]["key"];
type Edits = Record<string, Partial<Record<CostField, string>>>;

function originalValue(row: ProductCostRow, field: CostField): string {
  return row.cost ? String(row.cost[field]) : "";
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line-soft px-4 py-3 last:border-b-0"
        >
          <div className="size-9 animate-pulse rounded-lg bg-white/5" />
          <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
          {Array.from({ length: 5 }, (_, j) => (
            <div key={j} className="h-8 w-20 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CostsView() {
  const { data: rows, isPending, isError, error, refetch, isRefetching } =
    useCosts();
  const mutation = useSaveCosts();

  const [search, setSearch] = useState("");
  const [onlyNoCost, setOnlyNoCost] = useState(false);
  const [edits, setEdits] = useState<Edits>({});
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());

  const noCostCount = useMemo(
    () => (rows ?? []).filter((r) => !r.cost).length,
    [rows],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (rows ?? []).filter((row) => {
      if (onlyNoCost && row.cost) return false;
      if (!query) return true;
      return (
        row.name.toLowerCase().includes(query) ||
        row.offerId.toLowerCase().includes(query) ||
        (row.sku ?? "").toLowerCase().includes(query)
      );
    });
  }, [rows, search, onlyNoCost]);

  const dirtyCount = Object.keys(edits).length;

  const cellValue = (row: ProductCostRow, field: CostField): string =>
    edits[row.productId]?.[field] ?? originalValue(row, field);

  const setCell = (row: ProductCostRow, field: CostField, value: string) => {
    mutation.reset();
    setInvalidCells((prev) => {
      if (!prev.has(`${row.productId}:${field}`)) return prev;
      const next = new Set(prev);
      next.delete(`${row.productId}:${field}`);
      return next;
    });
    setEdits((prev) => {
      const rowEdits = { ...prev[row.productId], [field]: value };
      // Значение вернулось к исходному — убираем из изменённых
      if (value === originalValue(row, field)) {
        delete rowEdits[field];
        if (Object.keys(rowEdits).length === 0) {
          const rest = { ...prev };
          delete rest[row.productId];
          return rest;
        }
      }
      return { ...prev, [row.productId]: rowEdits };
    });
  };

  const handleSave = () => {
    if (!rows || dirtyCount === 0) return;

    const items: BulkCostItem[] = [];
    const invalid = new Set<string>();

    for (const productId of Object.keys(edits)) {
      const row = rows.find((r) => r.productId === productId);
      if (!row) continue;

      const payload = {
        productId,
        purchaseCost: parseDecimal(cellValue(row, "purchaseCost")),
        packagingCost: parseDecimal(cellValue(row, "packagingCost")),
        deliveryCost: parseDecimal(cellValue(row, "deliveryCost")),
        otherCost: parseDecimal(cellValue(row, "otherCost")),
        taxPercent: parseDecimal(cellValue(row, "taxPercent")),
      };

      const parsed = bulkCostItemSchema.safeParse(payload);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          invalid.add(`${productId}:${String(issue.path[0])}`);
        }
        continue;
      }
      items.push(parsed.data);
    }

    setInvalidCells(invalid);
    if (invalid.size > 0 || items.length === 0) return;

    mutation.mutate({ items }, { onSuccess: () => setEdits({}) });
  };

  if (isPending) return <TableSkeleton />;

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-surface shadow-lg shadow-black/20">
        <EmptyState
          icon={PackageSearch}
          title="Не удалось загрузить данные"
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
    );
  }

  return (
    <div className="space-y-4">
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

        <button
          type="button"
          onClick={() => setOnlyNoCost((v) => !v)}
          aria-pressed={onlyNoCost}
          className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
            onlyNoCost
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-line bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          }`}
        >
          Только без себестоимости
          <span className={`text-xs tabular-nums ${onlyNoCost ? "text-amber-400" : "text-text-muted"}`}>
            {noCostCount}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {invalidCells.size > 0 ? (
            <p role="alert" className="text-sm text-red-400">
              Исправьте выделенные значения
            </p>
          ) : mutation.isError ? (
            <p role="alert" className="text-sm text-red-400">
              {mutation.error.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={dirtyCount === 0 || mutation.isPending}
            className="flex h-9 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : mutation.isSuccess && dirtyCount === 0 ? (
              <Check className="size-4 text-emerald-400" aria-hidden />
            ) : null}
            {mutation.isPending
              ? "Сохраняем…"
              : mutation.isSuccess && dirtyCount === 0
                ? "Сохранено"
                : `Сохранить${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
          </button>
        </div>
      </div>

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
                  setOnlyNoCost(false);
                }}
                className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                Сбросить фильтры
              </button>
            }
          />
        </div>
      ) : (
        <div className="max-h-[calc(100vh-16rem)] overflow-auto rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <table className="w-full min-w-4xl border-collapse text-sm">
            <thead className="sticky top-0 z-1 bg-surface-soft">
              <tr className="border-b border-line">
                <th scope="col" className="w-full min-w-64 px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                  Товар
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                  SKU
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                  Цена
                </th>
                {costFields.map(({ key, label }) => (
                  <th key={key} scope="col" className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                    {label}
                  </th>
                ))}
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted">
                  Итого/ед
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const dirty = Boolean(edits[row.productId]);
                const unitTotal =
                  parseDecimal(cellValue(row, "purchaseCost")) +
                  parseDecimal(cellValue(row, "packagingCost")) +
                  parseDecimal(cellValue(row, "deliveryCost")) +
                  parseDecimal(cellValue(row, "otherCost"));

                return (
                  <tr
                    key={row.productId}
                    className={`border-b border-line-soft transition-colors last:border-b-0 ${
                      dirty ? "bg-violet-500/[0.05]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-3">
                        <ProductThumb name={row.name} imageUrl={row.imageUrl} size={36} />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            {!row.cost ? (
                              <span
                                className="size-1.5 shrink-0 rounded-full bg-amber-400"
                                title="Нет себестоимости"
                              />
                            ) : null}
                            <span className="truncate font-medium text-text-primary">
                              {row.name}
                            </span>
                          </span>
                          <span className="block text-xs text-text-muted">
                            {row.offerId}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-text-muted tabular-nums">
                      {row.sku ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-text-secondary">
                      {row.price != null ? formatMoney(row.price) : "—"}
                    </td>
                    {costFields.map(({ key, label }) => {
                      const invalid = invalidCells.has(`${row.productId}:${key}`);
                      const cellDirty = edits[row.productId]?.[key] !== undefined;
                      return (
                        <td key={key} className="px-2 py-2 text-right">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={cellValue(row, key)}
                            onChange={(e) => setCell(row, key, e.target.value)}
                            placeholder="0"
                            aria-label={`${label} — ${row.name}`}
                            aria-invalid={invalid || undefined}
                            className={`h-8 rounded-md border bg-bg px-2 text-right text-sm text-text-primary tabular-nums placeholder:text-text-muted focus:outline-none ${
                              key === "taxPercent" ? "w-16" : "w-22"
                            } ${
                              invalid
                                ? "border-red-500/70 focus:border-red-500"
                                : cellDirty
                                  ? "border-violet-500/50 focus:border-violet-400"
                                  : "border-line focus:border-violet-500/50"
                            }`}
                          />
                        </td>
                      );
                    })}
                    <td
                      className={`px-3 py-2 text-right font-semibold tabular-nums ${
                        dirty ? "text-violet-300" : "text-text-primary"
                      }`}
                    >
                      {Number.isFinite(unitTotal) ? formatMoney(unitTotal) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
