"use client";

import { create } from "zustand";
import {
  DEFAULT_PERIOD_KEY,
  type CustomRange,
  type PeriodKey,
} from "@/lib/period";

function defaultCustomRange(): CustomRange {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

type PeriodState = {
  periodKey: PeriodKey;
  custom: CustomRange;
  setPeriodKey: (key: PeriodKey) => void;
  setCustom: (range: CustomRange) => void;
};

/**
 * Выбранный период — общий для всех страниц (dashboard, товары, реклама).
 * Живёт вне React-дерева: переживает навигацию, сбрасывается при перезагрузке.
 */
export const usePeriodStore = create<PeriodState>((set) => ({
  periodKey: DEFAULT_PERIOD_KEY,
  custom: defaultCustomRange(),
  setPeriodKey: (periodKey) => set({ periodKey }),
  setCustom: (custom) => set({ custom }),
}));
