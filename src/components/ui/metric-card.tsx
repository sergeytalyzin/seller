import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  sub,
  valueClassName = "text-text-primary",
  accent = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  valueClassName?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-lg shadow-black/20 ${
        accent
          ? "border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-violet-500/10"
          : "border-line bg-gradient-to-br from-surface to-surface-soft"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${valueClassName}`}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-text-muted">{sub}</p> : null}
    </div>
  );
}
