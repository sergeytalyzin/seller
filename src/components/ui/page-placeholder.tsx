import type { LucideIcon } from "lucide-react";

type PagePlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  stage: string;
};

/** Заглушка страницы на время Фазы A, пока раздел не реализован. */
export function PagePlaceholder({
  title,
  description,
  icon: Icon,
  stage,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>

      <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-soft p-10 text-center shadow-lg shadow-black/20">
        <span className="flex size-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
          <Icon className="size-6 text-violet-400" aria-hidden />
        </span>
        <p className="mt-5 text-base font-medium text-text-primary">
          Раздел в разработке
        </p>
        <p className="mt-1.5 max-w-md text-sm text-text-muted">{stage}</p>
      </div>
    </div>
  );
}
