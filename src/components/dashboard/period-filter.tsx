"use client";

import { periodPresets, type CustomRange, type PeriodKey } from "@/lib/period";

export type { CustomRange };

export function PeriodFilter({
  value,
  custom,
  onChangeKey,
  onChangeCustom,
}: {
  value: PeriodKey;
  custom: CustomRange;
  onChangeKey: (key: PeriodKey) => void;
  onChangeCustom: (range: CustomRange) => void;
}) {
  const dateInputClass =
    "h-9 rounded-lg border border-line bg-surface px-3 text-sm text-text-primary focus:border-violet-500/50 focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Период">
      {periodPresets.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChangeKey(key)}
            aria-pressed={active}
            className={`flex h-9 items-center rounded-lg border px-3 text-sm transition-colors ${
              active
                ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                : "border-line bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        );
      })}

      {value === "custom" ? (
        <span className="flex items-center gap-2">
          <input
            type="date"
            value={custom.from}
            max={custom.to}
            onChange={(e) => onChangeCustom({ ...custom, from: e.target.value })}
            aria-label="Начало периода"
            className={dateInputClass}
          />
          <span className="text-text-muted">—</span>
          <input
            type="date"
            value={custom.to}
            min={custom.from}
            onChange={(e) => onChangeCustom({ ...custom, to: e.target.value })}
            aria-label="Конец периода"
            className={dateInputClass}
          />
        </span>
      ) : null}
    </div>
  );
}
