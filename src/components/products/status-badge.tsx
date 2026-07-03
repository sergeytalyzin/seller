import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ProductProfitStatus } from "@/types/analytics";

export const statusMeta: Record<
  ProductProfitStatus,
  { label: string; tone: BadgeTone }
> = {
  profitable: { label: "Прибыльный", tone: "success" },
  low_margin: { label: "Низкая маржа", tone: "warning" },
  loss: { label: "Убыточный", tone: "danger" },
  no_cost: { label: "Нет себестоимости", tone: "muted" },
};

export function StatusBadge({ status }: { status: ProductProfitStatus }) {
  const meta = statusMeta[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
