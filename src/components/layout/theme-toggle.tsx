"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Переключатель тёмной/светлой темы: класс .light на <html> плюс
 * localStorage.theme; при загрузке тему выставляет скрипт в layout.
 * Без state — активную иконку выбирает CSS по классу темы, поэтому
 * нет расхождений при гидрации.
 */
export function ThemeToggle() {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("light");
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.theme = next ? "light" : "dark";
    } catch {
      // приватный режим — тема просто не сохранится
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="Переключить тему"
      aria-label="Переключить тёмную или светлую тему"
      className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
    >
      <Sun className="size-4 [html.light_&]:hidden" aria-hidden />
      <Moon className="hidden size-4 [html.light_&]:block" aria-hidden />
    </button>
  );
}
