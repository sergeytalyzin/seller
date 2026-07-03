import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "muted" | "accent";

const tones: Record<BadgeTone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
  muted: "border-line bg-white/5 text-text-muted",
  accent: "border-violet-500/30 bg-violet-500/10 text-violet-300",
};

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
