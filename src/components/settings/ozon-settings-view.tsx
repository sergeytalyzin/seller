"use client";

import { useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  useOzonSettings,
  useSaveOzonSettings,
  useSyncAll,
  useSyncFinance,
  useSyncProducts,
  useTestOzonConnection,
} from "@/hooks/use-ozon";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { SyncResult } from "@/server/services/sync-service";

const SYNC_DAYS = 90;

function syncSummary(result: SyncResult): string {
  const parts: string[] = [];
  if (result.productsCreated || result.productsUpdated) {
    parts.push(
      `товары: ${result.productsCreated} новых, ${result.productsUpdated} обновлено`,
    );
  }
  if (result.operationsCreated) {
    parts.push(`операции: ${result.operationsCreated} новых`);
  }
  if (parts.length === 0) parts.push("новых данных нет");
  return parts.join(" · ");
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function OzonSettingsView() {
  const { data: settings, isPending } = useOzonSettings();
  const saveMutation = useSaveOzonSettings();
  const testMutation = useTestOzonConnection();
  const syncProducts = useSyncProducts();
  const syncFinance = useSyncFinance();
  const syncAll = useSyncAll();

  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-56 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  const connected = settings?.connected ?? false;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    testMutation.reset();
    saveMutation.mutate(
      { clientId: clientId.trim(), apiKey: apiKey.trim() },
      { onSuccess: () => setApiKey("") },
    );
  };

  const anySyncPending =
    syncProducts.isPending || syncFinance.isPending || syncAll.isPending;

  const lastSync = [syncAll, syncProducts, syncFinance].find(
    (m) => m.isSuccess || m.isError,
  );

  const inputClass =
    "h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none";

  return (
    <div className="max-w-2xl space-y-4">
      <SectionCard
        title="Подключение Ozon API"
        description="Ключи хранятся только на сервере и никогда не передаются в браузер. Получить их можно в личном кабинете Ozon: Настройки → Seller API."
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Badge tone="success">Подключено</Badge>
                <span className="text-xs text-text-muted">
                  Client ID {settings?.clientId} · ключ {settings?.apiKeyMask}
                  {settings?.updatedAt
                    ? ` · обновлено ${formatDate(settings.updatedAt)}`
                    : ""}
                </span>
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
              placeholder={settings?.clientId ?? "Например: 3088921"}
              autoComplete="off"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">
              API Key
            </span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={settings?.apiKeyMask ?? "API-ключ из кабинета Ozon"}
              autoComplete="off"
              className={inputClass}
            />
          </label>

          {saveMutation.isError ? (
            <p role="alert" className="text-sm text-red-400">
              {saveMutation.error.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={
                saveMutation.isPending || !clientId.trim() || !apiKey.trim()
              }
              className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="size-4" aria-hidden />
              )}
              {saveMutation.isPending ? "Сохраняем…" : "Сохранить ключи"}
            </button>

            <button
              type="button"
              disabled={!connected || testMutation.isPending}
              onClick={() => testMutation.mutate()}
              className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="size-4" aria-hidden />
              )}
              Проверить подключение
            </button>
          </div>

          {testMutation.isSuccess ? (
            <p className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="size-4" aria-hidden />
              Подключение работает
              {testMutation.data.expiresAt
                ? ` · ключ действует до ${formatDate(testMutation.data.expiresAt)}`
                : ""}
            </p>
          ) : null}
          {testMutation.isError ? (
            <p role="alert" className="flex items-center gap-2 text-sm text-red-400">
              <XCircle className="size-4" aria-hidden />
              {testMutation.error.message}
            </p>
          ) : null}
        </form>
      </SectionCard>

      <SectionCard
        title="Синхронизация"
        description={`Товары загружаются целиком, финансовые операции — за последние ${SYNC_DAYS} дней. Данные Ozon не изменяются, приложение только читает их.`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!connected || anySyncPending}
            onClick={() => syncAll.mutate({ days: SYNC_DAYS })}
            className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncAll.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
            {syncAll.isPending ? "Синхронизируем…" : "Синхронизировать всё"}
          </button>

          <button
            type="button"
            disabled={!connected || anySyncPending}
            onClick={() => syncProducts.mutate({})}
            className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncProducts.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : null}
            Только товары
          </button>

          <button
            type="button"
            disabled={!connected || anySyncPending}
            onClick={() => syncFinance.mutate({ days: SYNC_DAYS })}
            className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncFinance.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : null}
            Только финансы
          </button>
        </div>

        {!connected ? (
          <p className="mt-3 text-sm text-text-muted">
            Сначала сохраните ключи подключения.
          </p>
        ) : null}

        {lastSync?.isSuccess ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Готово: {syncSummary(lastSync.data)}
            {lastSync.data.errors.length > 0 ? (
              <span className="text-amber-300">
                {" "}
                · {lastSync.data.errors.join("; ")}
              </span>
            ) : null}
          </p>
        ) : null}
        {lastSync?.isError ? (
          <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <XCircle className="size-4 shrink-0" aria-hidden />
            {lastSync.error.message}
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}
