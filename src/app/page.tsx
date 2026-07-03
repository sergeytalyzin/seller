import Link from "next/link";
import { LogIn, TrendingUp, SearchX, PiggyBank, Wallet } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Чистая прибыль по SKU",
    text: "Не просто выручка — реальный заработок по каждому товару после всех расходов.",
  },
  {
    icon: SearchX,
    title: "Убыточные товары",
    text: "Находите SKU, которые продаются, но съедают деньги магазина.",
  },
  {
    icon: PiggyBank,
    title: "Себестоимость под контролем",
    text: "Закупка, упаковка, доставка и налоги — всё учитывается в расчёте прибыли.",
  },
  {
    icon: Wallet,
    title: "Расходы магазина",
    text: "Комиссии, логистика, возвраты и общие расходы — видно, куда уходят деньги.",
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-bg-deep">
      {/* Фоновое свечение */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-130 w-225 -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-20 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20">
        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-violet-300">
          Аналитика для продавцов Ozon
        </span>

        <h1 className="mt-6 max-w-3xl text-center text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          Видите выручку.
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            А сколько вы зарабатываете?
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-center text-base text-text-secondary">
          Ozon Seller Analytics считает чистую прибыль по каждому товару:
          комиссии, логистика, возвраты, себестоимость и налоги — всё в одном
          месте.
        </p>

        <Link
          href="/login"
          className="mt-8 flex items-center gap-2 rounded-xl border border-violet-500/50 bg-violet-500/15 px-6 py-3 text-sm font-semibold text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.25)] transition-colors hover:bg-violet-500/25"
        >
          <LogIn className="size-4" aria-hidden />
          Войти в приложение
        </Link>

        <div className="mt-16 grid w-full gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-soft p-5 shadow-lg shadow-black/20 transition-colors hover:border-violet-500/40"
            >
              <Icon className="size-5 text-cyan-400" aria-hidden />
              <h2 className="mt-3 text-sm font-semibold text-text-primary">
                {title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                {text}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
