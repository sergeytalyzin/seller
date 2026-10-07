"use client";

import { Check, LoaderCircle, RefreshCw } from "lucide-react";
import { useSyncAll } from "@/hooks/use-ozon";
import { formatElapsed, useElapsedSeconds } from "@/hooks/use-elapsed-seconds";

export function SyncButton({ disabled }: { disabled: boolean }) {
  const syncAll = useSyncAll();
  const elapsed = useElapsedSeconds(
    syncAll.isPending ? syncAll.submittedAt : null,
  );

  return (
    <div className="flex items-center gap-2">
      {syncAll.isPending ? (
        <span className="flex items-center gap-2 rounded-lg bg-[#252b37] px-3 py-1.5 text-xs font-medium text-emerald-400">
          <LoaderCircle className="size-3.5 shrink-0 animate-spin" aria-hidden />
          <span>
            Идёт синхронизация · {formatElapsed(elapsed)}
            <span className="hidden lg:inline">
              {" "}
              — загрузка за 90 дней занимает до 5 минут. Не закрывайте страницу.
            </span>
          </span>
        </span>
      ) : null}
      {syncAll.isError ? (
        <span role="alert" className="hidden max-w-56 truncate text-xs text-red-400 md:block">
          {syncAll.error.message}
        </span>
      ) : null}
      <button
        type="button"
        disabled={disabled || syncAll.isPending}
        onClick={() => syncAll.mutate({ days: 90 })}
        title={
          disabled
            ? "Сначала подключите Ozon API в настройках"
            : "Загрузить товары и финансы из Ozon за 90 дней"
        }
        className="flex h-9 items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {syncAll.isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : syncAll.isSuccess ? (
          <Check className="size-4 text-emerald-400" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
        <span className="hidden sm:inline">
          {syncAll.isPending ? "Синхронизируем…" : "Синхронизировать"}
        </span>
      </button>
    </div>
  );
}
