"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, RotateCw } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DEFAULT_PERIOD_KEY, resolvePeriod, type PeriodKey } from "@/lib/period";
import { formatDate, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { BarChart } from "@/components/ui/bar-chart";
import { ProductThumb } from "@/components/products/product-thumb";
import type { ProductAnalytics } from "@/types/analytics";
import { PeriodFilter, type CustomRange } from "./period-filter";

const shortDate = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
});

function profitClass(value: number): string {
  if (value < 0) return "text-red-400";
  if (value > 0) return "text-emerald-400";
  return "text-text-primary";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-52 animate-pulse rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}

function TopProductsCard({
  title,
  products,
  emptyText,
}: {
  title: string;
  products: ProductAnalytics[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {products.map((p) => (
            <li key={p.productId}>
              <Link
                href={`/products/${p.productId}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
              >
                <ProductThumb name={p.name} imageUrl={p.imageUrl} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-text-primary">
                    {p.name}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {formatNumber(p.soldQuantity)} шт ·{" "}
                    {formatPercent(p.marginPercent)}
                  </span>
                </span>
                <span
                  className={`text-sm font-semibold tabular-nums ${profitClass(p.netProfit)}`}
                >
                  {formatMoney(p.netProfit)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DashboardView() {
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

  const { data, isPending, isError, error, refetch, isRefetching } =
    useDashboard(range);

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
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {filter}
        <div className="rounded-2xl border border-red-500/20 bg-surface shadow-lg shadow-black/20">
          <EmptyState
            icon={BarChart3}
            title="Не удалось загрузить аналитику"
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

  const {
    metrics,
    topProfitable,
    topLoss,
    expensesByCategory,
    ozonExpensesByCategory,
    series,
  } = data;
  // Заказы появляются раньше финансовых операций — учитываем и их
  const hasSales = metrics.ordersCount > 0 || metrics.orderedQuantity > 0;

  const chartPoints = series.map((point) => ({
    label: shortDate.format(new Date(point.date)),
    title: formatDate(point.date),
    ...point,
  }));

  const maxCategory = Math.max(...expensesByCategory.map((e) => e.amount), 1);
  const maxOzonCategory = Math.max(
    ...ozonExpensesByCategory.map((e) => e.amount),
    1,
  );

  return (
    <div className="space-y-4">
      {filter}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Чистая прибыль"
          accent
          value={formatMoney(metrics.netProfit)}
          valueClassName={profitClass(metrics.netProfit)}
          sub="после расходов Ozon, себестоимости, налогов и общих расходов"
        />
        <MetricCard
          label="Выручка"
          value={formatMoney(metrics.revenue)}
          sub={`${formatNumber(metrics.ordersCount)} доставленных заказов`}
        />
        <MetricCard
          label="Поступление на р/с"
          value={formatMoney(metrics.payout)}
          sub="начисления минус все удержания Ozon"
        />
        <MetricCard
          label="Маржинальность"
          value={formatPercent(metrics.marginPercent)}
          valueClassName={profitClass(metrics.marginPercent)}
          sub="чистая прибыль к выручке"
        />
        <MetricCard
          label="Средняя прибыль на заказ"
          value={formatMoney(metrics.averageOrderProfit)}
          valueClassName={profitClass(metrics.averageOrderProfit)}
        />
        <MetricCard
          label="Заказано товаров"
          value={`${formatNumber(metrics.orderedQuantity)} шт`}
          sub="FBO-заказы за период, включая ещё не доставленные"
        />
        <MetricCard
          label="Продано товаров"
          value={`${formatNumber(metrics.soldQuantity)} шт`}
          sub={
            metrics.returnedQuantity > 0
              ? `возвратов: ${formatNumber(metrics.returnedQuantity)} шт`
              : "доставлено, за вычетом возвратов"
          }
        />
        <MetricCard
          label="Процент выкупа"
          value={
            metrics.buyoutPercent != null
              ? formatPercent(metrics.buyoutPercent)
              : "—"
          }
          sub={
            metrics.avgSalePrice != null
              ? `средняя цена продажи ${formatMoney(metrics.avgSalePrice)}`
              : "доставлено / (доставлено + отменено)"
          }
        />
        <MetricCard
          label="Расходы Ozon"
          value={formatMoney(metrics.totalOzonExpenses)}
          sub="комиссия, логистика, реклама, возвраты, удержания"
        />
        <MetricCard
          label="Налог"
          value={formatMoney(metrics.taxAmount)}
          sub={
            metrics.bonusPoints > 0
              ? `база уменьшена на баллы Ozon: ${formatMoney(metrics.bonusPoints)}`
              : "НДС + УСН от продаж за вычетом баллов Ozon"
          }
        />
        <MetricCard
          label="Деньги в товаре"
          value={formatMoney(metrics.stockValue)}
          sub={`себестоимость остатков: Китай → наш склад → FBO · ${formatNumber(metrics.stockUnits)} шт на FBO`}
        />
        <MetricCard
          label="Реклама (ДРР)"
          value={formatMoney(metrics.adSpend)}
          valueClassName={
            (metrics.drrPercent ?? 0) > 10 ? "text-amber-300" : "text-text-primary"
          }
          sub={
            metrics.drrPercent != null
              ? `ДРР ${formatPercent(metrics.drrPercent)} — расход к выручке`
              : "подключите Performance API на странице «Реклама»"
          }
        />
        <MetricCard
          label="Курс юаня (ЦБ)"
          value={metrics.cnyRate != null ? `${metrics.cnyRate.toFixed(2)} ₽` : "—"}
          valueClassName={
            (metrics.cnyRateChange30dPercent ?? 0) > 3
              ? "text-amber-300"
              : "text-text-primary"
          }
          sub={
            metrics.cnyRateChange30dPercent != null
              ? `${metrics.cnyRateChange30dPercent > 0 ? "+" : ""}${metrics.cnyRateChange30dPercent.toFixed(1)}% за 30 дней${
                  metrics.cnyRateChange30dPercent > 3
                    ? " — проверьте маржу товаров из Китая"
                    : ""
                }`
              : "история курса накапливается"
          }
        />
        <Link
          href="/products"
          className="rounded-2xl focus-visible:outline-2 focus-visible:outline-violet-400"
        >
          <MetricCard
            label="Убыточные товары"
            value={formatNumber(metrics.lossProductsCount)}
            valueClassName={metrics.lossProductsCount > 0 ? "text-red-400" : "text-text-primary"}
            sub={
              <span className="inline-flex items-center gap-1">
                {metrics.lowMarginProductsCount > 0
                  ? `ещё ${metrics.lowMarginProductsCount} с низкой маржой · `
                  : ""}
                к товарам <ArrowRight className="size-3" aria-hidden />
              </span>
            }
          />
        </Link>
        <Link
          href="/costs"
          className="rounded-2xl focus-visible:outline-2 focus-visible:outline-violet-400"
        >
          <MetricCard
            label="Без себестоимости"
            value={formatNumber(metrics.noCostProductsCount)}
            valueClassName={metrics.noCostProductsCount > 0 ? "text-amber-300" : "text-text-primary"}
            sub={
              <span className="inline-flex items-center gap-1">
                заполнить <ArrowRight className="size-3" aria-hidden />
              </span>
            }
          />
        </Link>
      </div>

      {!hasSales ? (
        <div className="rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <EmptyState
            icon={BarChart3}
            title="Нет данных за выбранный период"
            description="Попробуйте выбрать другой период — например, «Месяц»."
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
              <h2 className="text-base font-semibold text-text-primary">
                Выручка по дням
              </h2>
              <div className="mt-4">
                <BarChart
                  points={chartPoints.map((p) => ({ label: p.label, title: p.title, value: p.revenue }))}
                  name="Выручка"
                  formatValue={formatMoney}
                  positiveClass="fill-cyan-400/60"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
              <h2 className="text-base font-semibold text-text-primary">
                Прибыль по дням
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                по операциям Ozon, без общих расходов магазина
              </p>
              <div className="mt-3">
                <BarChart
                  points={chartPoints.map((p) => ({ label: p.label, title: p.title, value: p.profit }))}
                  name="Прибыль"
                  formatValue={formatMoney}
                  positiveClass="fill-emerald-400/70"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <TopProductsCard
              title="Топ прибыльных"
              products={topProfitable}
              emptyText="Нет прибыльных товаров за период."
            />
            <TopProductsCard
              title="Топ убыточных"
              products={topLoss}
              emptyText="Убыточных товаров нет — отлично."
            />

            <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
              <h2 className="text-base font-semibold text-text-primary">
                Удержания Ozon
              </h2>
              {ozonExpensesByCategory.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">
                  Удержаний за период нет.
                </p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {ozonExpensesByCategory.map(({ category, amount }) => (
                    <div
                      key={category}
                      className="grid grid-cols-[9rem_1fr_auto] items-center gap-3"
                    >
                      <span className="truncate text-sm text-text-secondary">
                        {category}
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-cyan-500/60 to-cyan-400/80"
                          style={{
                            width: `${Math.max(0, (amount / maxOzonCategory) * 100)}%`,
                          }}
                        />
                      </span>
                      <span className="text-right text-sm text-text-primary tabular-nums">
                        {formatMoney(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
              <h2 className="text-base font-semibold text-text-primary">
                Расходы магазина
              </h2>
              {expensesByCategory.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">
                  Общих расходов за период нет.
                </p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {expensesByCategory.map(({ category, amount }) => (
                    <div
                      key={category}
                      className="grid grid-cols-[7rem_1fr_auto] items-center gap-3"
                    >
                      <span className="truncate text-sm text-text-secondary">
                        {category}
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-violet-500/60 to-violet-400/80"
                          style={{ width: `${(amount / maxCategory) * 100}%` }}
                        />
                      </span>
                      <span className="text-right text-sm text-text-primary tabular-nums">
                        {formatMoney(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 space-y-1.5 border-t border-line-soft pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Общие расходы</span>
                  <span className="text-text-primary tabular-nums">
                    {formatMoney(metrics.totalCommonExpenses)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Себестоимость продаж</span>
                  <span className="text-text-primary tabular-nums">
                    {formatMoney(metrics.totalProductCost)}
                  </span>
                </div>
                {metrics.overheadCost > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Накладные расходы</span>
                    <span className="text-text-primary tabular-nums">
                      {formatMoney(metrics.overheadCost)}
                    </span>
                  </div>
                ) : null}
                {metrics.taxAmount > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Налог (НДС + УСН)</span>
                    <span className="text-text-primary tabular-nums">
                      {formatMoney(metrics.taxAmount)}
                    </span>
                  </div>
                ) : null}
              </div>
              <Link
                href="/expenses"
                className="mt-3 inline-flex items-center gap-1 text-sm text-violet-300 transition-colors hover:text-violet-200"
              >
                Все расходы <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
