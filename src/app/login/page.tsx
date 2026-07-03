import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-bg-deep px-4 py-16">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-100 w-175 -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/10 shadow-[0_0_18px_rgba(139,92,246,0.35)]">
            <span className="size-3.5 rounded-sm bg-gradient-to-br from-violet-400 to-cyan-400" />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-text-primary">
            Вход в Seller Analytics
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Аналитика прибыли вашего Ozon-магазина
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-black/20">
          <LoginForm />
        </div>

        <Link
          href="/"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          На главную
        </Link>
      </div>
    </div>
  );
}
