"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Calculator,
  Megaphone,
  Sparkles,
  Wallet,
  SlidersHorizontal,
  Plug2,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Товары", icon: Package },
  { href: "/costs", label: "Себестоимость", icon: Calculator },
  { href: "/calculator", label: "Просчёт новинок", icon: Sparkles },
  { href: "/advertising", label: "Реклама", icon: Megaphone },
  { href: "/expenses", label: "Расходы", icon: Wallet },
  { href: "/settings/store", label: "Параметры расчёта", icon: SlidersHorizontal },
  { href: "/settings/ozon", label: "Настройки Ozon", icon: Plug2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-bg-deep lg:flex">
      <Link
        href="/"
        className="flex items-center gap-3 px-5 pt-6 pb-7"
        aria-label="На главную"
      >
        <span className="flex size-9 items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/10 shadow-[0_0_18px_rgba(139,92,246,0.35)]">
          <span className="size-3 rounded-sm bg-gradient-to-br from-violet-400 to-cyan-400" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-wide text-text-primary">
            Seller Analytics
          </span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-text-muted">
            Ozon
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Основное меню">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "border border-violet-500/40 bg-violet-500/10 text-violet-300"
                  : "border border-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <Icon
                className={`size-4.5 shrink-0 ${
                  active
                    ? "text-violet-400"
                    : "text-text-muted group-hover:text-text-secondary"
                }`}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line-soft px-5 py-4">
        <p className="text-xs text-text-muted">
          Данные: Ozon Seller API
        </p>
      </div>
    </aside>
  );
}
