"use client";

import { useState } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
        Supabase не настроен: заполните NEXT_PUBLIC_SUPABASE_URL и
        NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local и перезапустите сервер.
      </p>
    );
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <MailCheck className="size-5 text-emerald-400" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-medium text-text-primary">
          Ссылка отправлена
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Проверьте почту {email} и перейдите по ссылке для входа.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-violet-300 transition-colors hover:text-violet-200"
        >
          Отправить ещё раз
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Укажите корректный email");
      return;
    }

    setStatus("sending");
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });

    if (authError) {
      setStatus("idle");
      setError(
        authError.message === "Signups not allowed for otp"
          ? "Регистрация по этому email недоступна"
          : "Не удалось отправить ссылку, попробуйте ещё раз",
      );
      return;
    }
    setStatus("sent");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-text-secondary">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          aria-invalid={error ? true : undefined}
          className={`h-10 w-full rounded-lg border bg-bg px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-line focus:border-violet-500/50"
          }`}
        />
        {error ? (
          <span role="alert" className="mt-1 block text-xs text-red-400">
            {error}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/15 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : null}
        {status === "sending" ? "Отправляем…" : "Получить ссылку для входа"}
      </button>

      <p className="text-center text-xs text-text-muted">
        Пароль не нужен — пришлём magic link на почту.
      </p>
    </form>
  );
}
