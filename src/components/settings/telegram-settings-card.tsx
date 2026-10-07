"use client";

import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import {
  useSaveTelegramSettings,
  useTelegramSettings,
  useTestTelegram,
} from "@/hooks/use-telegram";

export function TelegramSettingsCard() {
  const { data: settings, isPending } = useTelegramSettings();
  const saveMutation = useSaveTelegramSettings();
  const testMutation = useTestTelegram();

  // null — пользователь ещё не трогал поле, показываем сохранённое значение
  const [chatIdDraft, setChatIdDraft] = useState<string | null>(null);
  const [enabledDraft, setEnabledDraft] = useState<boolean | null>(null);
  const chatId = chatIdDraft ?? settings?.chatId ?? "";
  const enabled = enabledDraft ?? settings?.enabled ?? true;

  if (isPending) {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface" />
    );
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-violet-500/50 focus:outline-none";

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
      <h2 className="text-base font-semibold text-text-primary">
        Telegram-дайджест
      </h2>
      <p className="mt-1 mb-4 text-sm text-text-secondary">
        Каждое утро бот пришлёт итоги вчерашнего дня: выручку, чистую прибыль и
        предупреждения. Напишите боту приложения @ozon_profit_st_bot,  /start, узнайте свой Chat ID у
        @userinfobot и вставьте его сюда.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate({ chatId: chatId.trim(), enabled });
        }}
        className="space-y-3"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">
            Chat ID
          </span>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatIdDraft(e.target.value)}
            placeholder="Например: 123456789"
            autoComplete="off"
            className={inputClass}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabledDraft(e.target.checked)}
            className="size-4 accent-violet-500"
          />
          Присылать дайджест каждое утро
        </label>

        {saveMutation.isError ? (
          <p role="alert" className="text-sm text-red-400">
            {saveMutation.error.message}
          </p>
        ) : null}
        {testMutation.isError ? (
          <p role="alert" className="text-sm text-red-400">
            {testMutation.error.message}
          </p>
        ) : null}
        {testMutation.isSuccess ? (
          <p className="text-sm text-emerald-400">
            Отправлено — проверьте Telegram
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saveMutation.isPending || !chatId.trim()}
            className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : null}
            {saveMutation.isPending ? "Сохраняем…" : "Сохранить"}
          </button>

          <button
            type="button"
            disabled={!settings || testMutation.isPending}
            onClick={() => testMutation.mutate()}
            title={
              settings
                ? "Пришлёт настоящий дайджест за вчера"
                : "Сначала сохраните Chat ID"
            }
            className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            Отправить тест
          </button>
        </div>
      </form>
    </section>
  );
}
