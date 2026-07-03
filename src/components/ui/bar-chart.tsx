"use client";

import { useState } from "react";

export type BarChartPoint = {
  label: string;
  /** Полная дата для tooltip, например «15.06.2026»; по умолчанию — label */
  title?: string;
  value: number;
};

/**
 * Лёгкий bar chart на чистом SVG: поддерживает отрицательные значения
 * (столбики вниз от нулевой линии) и tooltip с датой и значением метрики
 * при наведении на столбец.
 */
export function BarChart({
  points,
  formatValue,
  name,
  positiveClass = "fill-violet-400/70",
  negativeClass = "fill-red-400/70",
}: {
  points: BarChartPoint[];
  formatValue: (value: number) => string;
  /** Понятное название метрики для tooltip, например «Выручка» или «Продано» */
  name?: string;
  positiveClass?: string;
  negativeClass?: string;
}) {
  const HEIGHT = 100;
  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <p className="flex h-28 items-center justify-center text-sm text-text-muted">
        Нет данных за период
      </p>
    );
  }

  const max = Math.max(...points.map((p) => p.value), 0);
  const min = Math.min(...points.map((p) => p.value), 0);
  const range = max - min || 1;
  const zeroY = (max / range) * HEIGHT;
  const barWidth = 100 / points.length;

  const hovered = hover != null ? points[hover] : null;
  // Не даём tooltip выйти за края графика
  const tooltipLeft =
    hover != null ? Math.min(Math.max((hover + 0.5) * barWidth, 10), 90) : 0;

  return (
    <div>
      <div className="relative">
        {hovered ? (
          <div
            className="pointer-events-none absolute bottom-full z-10 mb-1.5 -translate-x-1/2 rounded-lg border border-line bg-surface-soft px-3 py-1.5 text-xs whitespace-nowrap shadow-lg shadow-black/40"
            style={{ left: `${tooltipLeft}%` }}
          >
            <span className="block text-text-muted">
              {hovered.title ?? hovered.label}
            </span>
            <span className="mt-0.5 block font-medium text-text-primary tabular-nums">
              {name ? `${name}: ` : ""}
              {formatValue(hovered.value)}
            </span>
          </div>
        ) : null}

        <svg
          viewBox={`0 0 100 ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-28 w-full"
          role="img"
          aria-label={name ? `${name} по дням` : "График по дням"}
          onMouseLeave={() => setHover(null)}
        >
          <line
            x1="0"
            x2="100"
            y1={zeroY}
            y2={zeroY}
            stroke="var(--color-line-soft)"
            strokeWidth="0.5"
          />
          {points.map((point, i) => {
            const height = (Math.abs(point.value) / range) * HEIGHT;
            const y = point.value >= 0 ? zeroY - height : zeroY;
            return (
              <rect
                key={point.label}
                x={i * barWidth + barWidth * 0.18}
                width={barWidth * 0.64}
                y={y}
                height={Math.max(height, point.value === 0 ? 0 : 0.75)}
                className={`${point.value >= 0 ? positiveClass : negativeClass} transition-opacity ${
                  hover === i ? "opacity-70" : ""
                }`}
              />
            );
          })}
          {/* Прозрачные колонки на всю высоту — ловят наведение мыши */}
          {points.map((_, i) => (
            <rect
              key={`hover-${i}`}
              x={i * barWidth}
              y="0"
              width={barWidth}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-xs text-text-muted">
        <span>{points[0].label}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  );
}
