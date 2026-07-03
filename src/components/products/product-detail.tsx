"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageX, RotateCw } from "lucide-react";
import { useProduct, useProductStocks } from "@/hooks/use-product";
import { ApiError } from "@/lib/api";
import { DEFAULT_PERIOD_KEY, periodPresets, resolvePeriod, type PeriodKey } from "@/lib/period";
import { formatDate, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { PeriodFilter, type CustomRange } from "@/components/dashboard/period-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { BarChart, type BarChartPoint } from "@/components/ui/bar-chart";
import { calcProductUnitCost } from "@/lib/analytics/profit";
import type { ProductAnalytics } from "@/types/analytics";
import type { FinanceOperation } from "@/types/finance";
import type { ProductCost } from "@/types/product";
import { ProductThumb } from "./product-thumb";
import { StatusBadge } from "./status-badge";
import { CostForm } from "./cost-form";
import { OperationsTable } from "./operations-table";
import { WarehousesClustersTable } from "./warehouses-clusters-table";

function BackLink() {
  return (
    <Link
      href="/products"
      className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Все товары
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-xl bg-white/5" />
        <div className="space-y-2">
          <div className="h-5 w-72 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-40 animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

/** Разбивка «куда уходят деньги» с барами относительно самой большой статьи */
function ExpenseBreakdown({ analytics }: { analytics: ProductAnalytics }) {
  const hasCost = analytics.status !== "no_cost";

  const items = [
    { label: "Комиссия Ozon", value: analytics.commission },
    { label: "Логистика", value: analytics.logistics },
    { label: "Последняя миля", value: analytics.lastMile },
    { label: "Обратная логистика", value: analytics.returnLogistics },
    { label: "Эквайринг", value: analytics.acquiring },
    { label: "Продвижение", value: analytics.advertising },
    { label: "Хранение", value: analytics.storage },
    { label: "Возвраты", value: analytics.returnAmount },
    { label: "Штрафы", value: analytics.penalty },
    { label: "Прочие удержания", value: analytics.otherDeduction },
    { label: "Не расшифровано", value: analytics.unclassified },
    ...(hasCost
      ? [
          { label: "Себестоимость", value: analytics.totalProductCost },
          { label: "Накладные", value: analytics.overheadCost },
          { label: "Налог", value: analytics.taxAmount },
        ]
      : []),
  ].filter((item) => item.value > 0);

  const max = Math.max(...items.map((i) => i.value), 1);
  const revenue = analytics.grossRevenue;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-text-primary">
        Куда уходят деньги
      </h2>
      {!hasCost ? (
        <p className="mt-1 text-xs text-amber-300">
          Себестоимость и налог не учтены — заполните форму справа.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {items.map(({ label, value }) => (
          <div key={label} className="grid grid-cols-[9rem_1fr_auto] items-center gap-3">
            <span className="text-sm text-text-secondary">{label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-violet-500/60 to-violet-400/80"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </span>
            <span className="text-right text-sm text-text-primary tabular-nums">
              {formatMoney(value)}
              <span className="ml-2 text-xs text-text-muted">
                {revenue > 0 ? formatPercent((value / revenue) * 100) : "—"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Плановая юнит-экономика при текущей цене (Excel «Чистыми / ROI / Маржа») */
function UnitEconomicsCard({ analytics }: { analytics: ProductAnalytics }) {
  const ue = analytics.unitEconomics;

  const row = (
    label: string,
    net: number,
    roi: number | null,
    margin: number | null,
  ) => (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span
        className={`text-right font-semibold tabular-nums ${
          net < 0 ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {formatMoney(net)}
      </span>
      <span className="w-20 text-right tabular-nums text-text-secondary">
        {roi != null ? `ROI ${formatPercent(roi)}` : "—"}
      </span>
      <span className="w-24 text-right tabular-nums text-text-secondary">
        {margin != null ? `маржа ${formatPercent(margin)}` : "—"}
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-text-primary">
        Юнит-экономика
      </h2>
      <p className="mt-0.5 text-xs text-text-muted">
        плановая прибыль с 1 штуки при текущей цене — по фактическим комиссии,
        логистике и налогам за период
      </p>
      {ue == null ? (
        <p className="mt-4 text-sm text-text-muted">
          Недостаточно данных: нужны цена товара и продажи за период.
        </p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {row("Чистыми с единицы", ue.netPerUnit, ue.roiPercent, ue.marginPercent)}
          {row(
            "С учётом рекламы",
            ue.netPerUnitWithAds,
            ue.roiWithAdsPercent,
            ue.marginWithAdsPercent,
          )}
        </div>
      )}
    </div>
  );
}

const shortDate = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
});

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Дневные серии продаж и денег (прибыль при заполненной себестоимости, иначе
 * выручка). Прибыль по дню — приближённая, без налога и накладных расходов:
 * ставки заданы на уровне магазина и на клиенте недоступны.
 */
function buildDailySeries(
  operations: FinanceOperation[],
  cost: ProductCost | null,
): { sales: BarChartPoint[]; money: BarChartPoint[] } {
  if (operations.length === 0) return { sales: [], money: [] };

  const unitCost = cost ? calcProductUnitCost(cost) : 0;

  const byDay = new Map<string, { sales: number; money: number }>();
  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const op of operations) {
    const date = new Date(op.operationDate);
    minTime = Math.min(minTime, date.getTime());
    maxTime = Math.max(maxTime, date.getTime());

    const key = date.toISOString().slice(0, 10);
    const entry = byDay.get(key) ?? { sales: 0, money: 0 };
    entry.sales += Math.max(op.quantity, 0);

    const deductions =
      op.commission +
      op.logistics +
      op.lastMile +
      op.returnLogistics +
      op.acquiring +
      op.advertising +
      op.storage +
      op.returnAmount +
      op.penalty +
      op.otherDeduction +
      op.unclassified;
    entry.money += cost
      ? op.amount - deductions - unitCost * Math.max(op.quantity, 0)
      : op.amount;
    byDay.set(key, entry);
  }

  const sales: BarChartPoint[] = [];
  const money: BarChartPoint[] = [];
  for (let t = minTime; t <= maxTime; t += DAY_MS) {
    const date = new Date(t);
    const entry = byDay.get(date.toISOString().slice(0, 10));
    const label = shortDate.format(date);
    const title = formatDate(date);
    sales.push({ label, title, value: entry?.sales ?? 0 });
    money.push({ label, title, value: Math.round(entry?.money ?? 0) });
  }
  return { sales, money };
}

const isPeriodKey = (value: string | undefined): value is PeriodKey =>
  periodPresets.some((p) => p.key === value);

const isIsoDay = (value: string | undefined): value is string =>
  /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

export function ProductDetail({
  productId,
  initialPeriodKey,
  initialCustom,
}: {
  productId: string;
  /** Период из ссылки со страницы /products; невалидные значения игнорируются */
  initialPeriodKey?: string;
  initialCustom?: { from: string; to: string };
}) {
  const [periodKey, setPeriodKey] = useState<PeriodKey>(
    isPeriodKey(initialPeriodKey) ? initialPeriodKey : DEFAULT_PERIOD_KEY,
  );
  const [custom, setCustom] = useState<CustomRange>(() => {
    if (isIsoDay(initialCustom?.from) && isIsoDay(initialCustom?.to)) {
      return { from: initialCustom.from, to: initialCustom.to };
    }
    const to = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  });

  const range = useMemo(
    () => resolvePeriod(periodKey, custom),
    [periodKey, custom],
  );

  const { data, isPending, isError, error, refetch, isRefetching } =
    useProduct(productId, range);
  const stocksQuery = useProductStocks(productId);

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
        <BackLink />
        {filter}
        <DetailSkeleton />
      </div>
    );
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="space-y-4">
        <BackLink />
        {filter}
        <div className="rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <EmptyState
            icon={PackageX}
            title={notFound ? "Товар не найден" : "Не удалось загрузить товар"}
            description={
              notFound
                ? "Возможно, товар был удалён или ссылка устарела."
                : error.message
            }
            action={
              notFound ? undefined : (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
                >
                  <RotateCw
                    className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
                    aria-hidden
                  />
                  Попробовать снова
                </button>
              )
            }
          />
        </div>
      </div>
    );
  }

  const { product, analytics, cost, operations } = data;
  const noCost = analytics.status === "no_cost";
  const series = buildDailySeries(operations, cost);

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProductThumb name={product.name} imageUrl={product.imageUrl} size={64} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">
              {product.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
              <span>SKU {product.sku ?? "—"}</span>
              <span>Артикул {product.offerId}</span>
              <span>
                Цена{" "}
                <span className="text-text-secondary">
                  {product.price != null ? formatMoney(product.price) : "—"}
                </span>
              </span>
              <span title="Заказано по FBO за период, включая ещё не доставленные">
                Заказано{" "}
                <span className="text-text-secondary">
                  {formatNumber(analytics.orderedQuantity)} шт
                </span>
              </span>
              <span title="Доставлено покупателю (по финансовым операциям)">
                Продано{" "}
                <span className="text-text-secondary">
                  {formatNumber(analytics.soldQuantity)} шт
                </span>
              </span>
              <span>
                Возвраты{" "}
                <span className="text-text-secondary">
                  {formatNumber(analytics.returnedQuantity)} шт
                </span>
              </span>
              <span title="Доставлено / (доставлено + отменено) по FBO-заказам за период">
                Выкуп{" "}
                <span className="text-text-secondary">
                  {analytics.buyoutPercent != null
                    ? formatPercent(analytics.buyoutPercent)
                    : "—"}
                </span>
              </span>
              <span title="Средняя цена продажи за период">
                Ср. цена{" "}
                <span className="text-text-secondary">
                  {analytics.avgSalePrice != null
                    ? formatMoney(analytics.avgSalePrice)
                    : "—"}
                </span>
              </span>
              <span title="Скорость продаж за последние 31 день, без дней отсутствия товара">
                Скорость{" "}
                <span className="text-text-secondary">
                  {analytics.salesVelocity != null
                    ? `${analytics.salesVelocity.toFixed(1)} шт/день`
                    : "—"}
                </span>
              </span>
              <span title="Остаток на FBO / скорость продаж">
                Запас{" "}
                <span className="text-text-secondary">
                  {analytics.stockDays != null
                    ? `${Math.round(analytics.stockDays)} дн`
                    : "—"}
                </span>
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={analytics.status} />
      </div>

      {filter}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Выручка"
          value={formatMoney(analytics.grossRevenue)}
          sub="за выбранный период"
        />
        <MetricCard
          label="Расходы всего"
          value={formatMoney(analytics.totalExpenses)}
          sub={noCost ? "без себестоимости и налога" : "Ozon + себестоимость + накладные + налог"}
        />
        <MetricCard
          label="Чистая прибыль"
          accent
          value={noCost ? "—" : formatMoney(analytics.netProfit)}
          valueClassName={
            noCost
              ? "text-text-muted"
              : analytics.netProfit < 0
                ? "text-red-400"
                : "text-emerald-400"
          }
          sub={noCost ? "заполните себестоимость" : undefined}
        />
        <MetricCard
          label="Маржа"
          value={noCost ? "—" : formatPercent(analytics.marginPercent)}
          valueClassName={
            noCost
              ? "text-text-muted"
              : analytics.marginPercent < 0
                ? "text-red-400"
                : analytics.marginPercent < 10
                  ? "text-amber-300"
                  : "text-emerald-400"
          }
          sub={noCost ? undefined : `ROI ${formatPercent(analytics.roiPercent)}`}
        />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="min-w-0 space-y-4">
          <ExpenseBreakdown analytics={analytics} />

          <UnitEconomicsCard analytics={analytics} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
              <h3 className="text-sm font-medium text-text-secondary">
                Продажи по дням, шт
              </h3>
              <div className="mt-4">
                <BarChart
                  points={series.sales}
                  name="Продано"
                  formatValue={(v) => `${formatNumber(v)} шт`}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
              <h3 className="text-sm font-medium text-text-secondary">
                {noCost ? "Выручка по дням" : "Прибыль по дням"}
              </h3>
              {noCost ? (
                <p className="mt-0.5 text-xs text-text-muted">
                  прибыль появится после заполнения себестоимости
                </p>
              ) : null}
              <div className="mt-4">
                <BarChart
                  points={series.money}
                  name={noCost ? "Выручка" : "Прибыль"}
                  formatValue={formatMoney}
                  positiveClass={noCost ? "fill-cyan-400/60" : "fill-emerald-400/70"}
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-text-primary">
                Склады и кластеры
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Остатки, заказы, товары в пути и запас по кластерам — метрики
                Ozon за последние 28 дней
              </p>
            </div>
            {/* Данные — POST /v1/analytics/stocks через GET /api/products/[id]/stocks.
                Дат в запросе нет: метрики Ozon за фиксированные 28 дней. Нужно
                уточнить API: заказы по кластерам за произвольный период. */}
            {stocksQuery.isPending ? (
              <div className="space-y-2 p-5">
                <div className="h-8 animate-pulse rounded bg-white/5" />
                <div className="h-8 animate-pulse rounded bg-white/5" />
              </div>
            ) : stocksQuery.isError ? (
              <EmptyState
                icon={PackageX}
                title="Не удалось загрузить остатки"
                description={stocksQuery.error.message}
                action={
                  <button
                    type="button"
                    onClick={() => stocksQuery.refetch()}
                    className="flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
                  >
                    <RotateCw
                      className={`size-4 ${stocksQuery.isRefetching ? "animate-spin" : ""}`}
                      aria-hidden
                    />
                    Попробовать снова
                  </button>
                }
              />
            ) : (
              <WarehousesClustersTable
                offerId={product.offerId}
                sku={product.sku}
                stocks={stocksQuery.data}
              />
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-text-primary">
                Финансовые операции
              </h2>
            </div>
            <OperationsTable operations={operations} />
          </div>
        </div>

        <div className="xl:sticky xl:top-24">
          <CostForm productId={productId} cost={cost} />
        </div>
      </div>
    </div>
  );
}
