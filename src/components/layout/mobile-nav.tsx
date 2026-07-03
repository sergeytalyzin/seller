"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navItems } from "./sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        aria-expanded={open}
        className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-text-secondary transition-colors hover:text-text-primary"
      >
        <Menu className="size-4" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />
          <aside className="absolute top-0 left-0 flex h-full w-64 flex-col border-r border-line bg-bg-deep">
            <div className="flex items-center justify-between px-5 pt-5 pb-6">
              <span className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg border border-violet-500/40 bg-violet-500/10">
                  <span className="size-2.5 rounded-sm bg-gradient-to-br from-violet-400 to-cyan-400" />
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  Seller Analytics
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
                className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-3" aria-label="Основное меню">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "border border-violet-500/40 bg-violet-500/10 text-violet-300"
                        : "border border-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
                    }`}
                  >
                    <Icon className="size-4.5 shrink-0" aria-hidden />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
