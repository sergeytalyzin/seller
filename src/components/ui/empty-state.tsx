import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl border border-line bg-white/5">
        <Icon className="size-5 text-text-muted" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-medium text-text-primary">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
