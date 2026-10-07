"use client";

import { useEffect, useState } from "react";

/** Секунды с момента startedAt: без них спиннер синка выглядит зависшим */
export function useElapsedSeconds(startedAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt == null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  if (startedAt == null) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

export function formatElapsed(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
