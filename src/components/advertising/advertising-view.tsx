"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Megaphone,
  RefreshCw,
  RotateCw,
  XCircle,
} from "lucide-react";
import { useAdvertising, usePerformanceSettings, useSavePerformanceSettings, useSyncPerformance } from "@/hooks/use-advertising";
import { resolvePeriod } from "@/lib/period";
import { usePeriodStore } from "@/stores/period-store";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { ProductThumb } from "@/components/products/product-thumb";
import { Badge } from "@/components/ui/badge";

const SYNC_DAYS = 62;

const campaignTypeLabels: Record<string, string> = {
  SKU: "Оплата за клик",
  SEARCH_PROMO: "Оплата за заказ",
  BANNER: "Баннер",
  VIDEO_BANNER: "Видеобаннер",
};

function PerformanceKeysForm() {
  const { data: settings } = usePerformanceSettings();
  const saveMutation = useSavePerformanceSettings();

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const connected = settings?.connected ?? false;

  const inputClass =
    "h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none";

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-text-primary">
        Подключение Performance API
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Ключи рекламного кабинета: личный кабинет Ozon → Настройки → API-ключи
        → вкладка Performance API. Хранятся только на сервере.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate(
            { clientId: clientId.trim(), clientSecret: clientSecret.trim() },
            { onSuccess: () => setClientSecret("") },
          );
        }}
        className="mt-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <Badge tone="success">Подключено</Badge>
              <span className="text-xs text-text-muted">{settings?.clientId}</span>
            </>
          ) : (
            <Badge tone="warning">Не подключено</Badge>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Client ID
          </span>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder={settings?.clientId ?? "XXXX@advertising.performance.ozon.ru"}
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Client Secret
          </span>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Client Secret из кабинета"
            autoComplete="off"
            className={inputClass}
          />
        </label>

        {saveMutation.isError ? (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-400">
            <XCircle className="size-4" aria-hidden />
            {saveMutation.error.message}
          </p>
        ) : null}
        {saveMutation.isSuccess ? (
          <p className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden />
            Ключи проверены и сохранены
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saveMutation.isPending || !clientId.trim() || !clientSecret.trim()}
          className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="size-4" aria-hidden />
          )}
          {saveMutation.isPending ? "Проверяем…" : "Сохранить ключи"}
        </button>
      </form>
    </section>
  );
}

const headerCell =
  "px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-muted";

export function AdvertisingView() {
  const { periodKey, custom, setPeriodKey, setCustom } = usePeriodStore();

  const range = useMemo(() => resolvePeriod(periodKey, custom), [periodKey, custom]);
  const { data, isPending, isError, error, refetch, isRefetching } =
    useAdvertising(range);
  const syncMutation = useSyncPerformance();

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {filter}
        <div className="rounded-2xl border border-red-500/20 bg-surface shadow-lg shadow-black/20">
          <EmptyState
            icon={Megaphone}
            title="Не удалось загрузить рекламу"
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

  if (!data.connected) {
    return (
      <div className="max-w-2xl space-y-4">
        <PerformanceKeysForm />
      </div>
    );
  }

  const { summary, products, campaigns } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {filter}
        <button
          type="button"
          onClick={() => syncMutation.mutate({ days: SYNC_DAYS })}
          disabled={syncMutation.isPending}
          className="ml-auto flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
            aria-hidden
          />
          {syncMutation.isPending ? "Загружаем…" : `Обновить за ${SYNC_DAYS} дн`}
        </button>
      </div>

      {syncMutation.isError ? (
        <p role="alert" className="text-sm text-red-400">
          {syncMutation.error.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Расход на рекламу"
          accent
          value={formatMoney(summary.spent)}
          sub={`${formatNumber(summary.views)} показов · ${formatNumber(summary.clicks)} кликов`}
        />
        <MetricCard
          label="ДРР"
          value={summary.drrPercent != null ? formatPercent(summary.drrPercent) : "—"}
          valueClassName={
            (summary.drrPercent ?? 0) > 10 ? "text-amber-300" : "text-text-primary"
          }
          sub={
            summary.drrWithBuyoutPercent != null
              ? `с учётом выкупа ${formatPercent(summary.drrWithBuyoutPercent)}`
              : "расход к выручке за период"
          }
        />
        <MetricCard
          label="Заказы с рекламы"
          value={formatNumber(summary.orders)}
          sub={`на ${formatMoney(summary.ordersMoney)} (атрибуция Ozon)`}
        />
        <MetricCard
          label="Стоимость заказа (CPO)"
          value={summary.cpo != null ? formatMoney(summary.cpo) : "—"}
          sub="расход / все заказы за период"
        />
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <EmptyState
            icon={Megaphone}
            title="Данных за период нет"
            description="Нажмите «Обновить», чтобы загрузить статистику рекламных кампаний из Ozon."
          />
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-line bg-surface shadow-lg shadow-black/20">
          <table className="w-full min-w-4xl border-collapse text-sm">
            <thead className="sticky top-0 z-1 bg-surface-soft">
              <tr className="border-b border-line">
                <th scope="col" className={`${headerCell} w-full min-w-72 text-left!`}>
                  Товар
                </th>
                <th scope="col" className={headerCell}>Показы</th>
                <th scope="col" className={headerCell}>Клики</th>
                <th scope="col" className={headerCell}>CTR</th>
                <th scope="col" className={headerCell}>В корзину</th>
                <th scope="col" className={headerCell}>Расход</th>
                <th scope="col" className={headerCell}>Заказы</th>
                <th scope="col" className={headerCell}>Выручка с рекламы</th>
                <th scope="col" className={headerCell}>ДРР</th>
                <th scope="col" className={headerCell}>CPO</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku} className="border-b border-line-soft last:border-b-0">
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-3">
                      <ProductThumb name={p.name} imageUrl={p.imageUrl} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-text-primary">
                          {p.name}
                        </span>
                        <span className="block text-xs text-text-muted">SKU {p.sku}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                    {formatNumber(p.views)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                    {formatNumber(p.clicks)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                    {p.ctrPercent != null ? formatPercent(p.ctrPercent) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                    {formatNumber(p.toCart)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-text-primary">
                    {formatMoney(p.spent)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                    {formatNumber(p.orders)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                    {formatMoney(p.ordersMoney)}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right tabular-nums ${
                      (p.drrPercent ?? 0) > 10 ? "text-amber-300" : "text-text-secondary"
                    }`}
                    title={
                      p.drrWithBuyoutPercent != null
                        ? `С учётом выкупа: ${formatPercent(p.drrWithBuyoutPercent)}`
                        : undefined
                    }
                  >
                    {p.drrPercent != null ? formatPercent(p.drrPercent) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                    {p.cpo != null ? formatMoney(p.cpo) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
          <h2 className="text-base font-semibold text-text-primary">Кампании</h2>
          {campaigns.length === 0 ? (
            <p className="mt-4 text-sm text-text-muted">
              Кампаний с расходом за период нет.
            </p>
          ) : (
            <ul className="mt-3 space-y-1">
              {campaigns.map((c) => (
                <li
                  key={c.campaignId}
                  className="flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-text-primary">
                      {c.title || `Кампания № ${c.campaignId}`}
                    </span>
                    <span className="block text-xs text-text-muted">
                      {campaignTypeLabels[c.campaignType] ?? c.campaignType} ·{" "}
                      {formatNumber(c.orders)} заказов
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-text-primary">
                    {formatMoney(c.spent)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="max-w-2xl">
          <PerformanceKeysForm />
        </div>
      </div>
    </div>
  );
}
