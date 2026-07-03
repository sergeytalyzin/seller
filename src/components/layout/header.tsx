import Link from "next/link";
import { LogOut } from "lucide-react";
import { db } from "@/lib/db";
import { getUserStore } from "@/server/auth";
import { MobileNav } from "./mobile-nav";
import { SyncButton } from "./sync-button";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const ctx = await getUserStore();
  const connected = ctx
    ? Boolean(
        await db.ozonSettings.findUnique({
          where: { storeId: ctx.store.id },
          select: { id: true },
        }),
      )
    : false;

  const initials = ctx?.user.email.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-line bg-bg/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <MobileNav />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-primary">
          {ctx?.store.name ?? "Магазин"}
        </span>
        {!connected ? (
          <Link
            href="/settings/ozon"
            className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            Ozon не подключён
          </Link>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <SyncButton disabled={!connected} />

        <ThemeToggle />

        <span
          className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-xs font-semibold text-text-secondary"
          title={ctx?.user.email ?? undefined}
        >
          {initials}
        </span>

        {ctx ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title={`Выйти (${ctx.user.email})`}
              aria-label="Выйти"
              className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-text-muted transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
