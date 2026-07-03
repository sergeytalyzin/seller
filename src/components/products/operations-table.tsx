"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import type { FinanceOperation } from "@/types/finance";

const PAGE_SIZE = 12;

function deductions(op: FinanceOperation): number {
  return (
    op.commission +
    op.logistics +
    op.acquiring +
    op.returnAmount +
    op.penalty +
    op.otherDeduction
  );
}

export function OperationsTable({
  operations,
}: {
  operations: FinanceOperation[];
}) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  if (operations.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Операций пока нет"
        description="За выбранный период по этому товару не было финансовых операций."
      />
    );
  }

  const visible = operations.slice(0, limit);

  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-text-muted">
            <th scope="col" className="px-3 py-2.5 text-left">Дата</th>
            <th scope="col" className="px-3 py-2.5 text-left">Операция</th>
            <th scope="col" className="px-3 py-2.5 text-right">Кол-во</th>
            <th scope="col" className="px-3 py-2.5 text-right">Начислено</th>
            <th scope="col" className="px-3 py-2.5 text-right">Удержано</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((op) => {
            const withheld = deductions(op);
            return (
              <tr
                key={op.id}
                className="border-b border-line-soft last:border-b-0"
              >
                <td className="px-3 py-2.5 whitespace-nowrap text-text-secondary tabular-nums">
                  {formatDate(op.operationDate)}
                </td>
                <td className="px-3 py-2.5 text-text-primary">
                  {op.operationTypeName ?? op.operationType}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-secondary">
                  {op.quantity !== 0 ? op.quantity : "—"}
                </td>
                <td
                  className={`px-3 py-2.5 text-right tabular-nums ${
                    op.amount > 0 ? "text-emerald-400" : "text-text-muted"
                  }`}
                >
                  {op.amount > 0 ? formatMoney(op.amount) : "—"}
                </td>
                <td
                  className={`px-3 py-2.5 text-right tabular-nums ${
                    withheld > 0 ? "text-red-400/90" : "text-text-muted"
                  }`}
                >
                  {withheld > 0 ? `−${formatMoney(withheld)}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {operations.length > limit ? (
        <div className="border-t border-line-soft p-3 text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="rounded-lg px-4 py-1.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            Показать ещё ({operations.length - limit})
          </button>
        </div>
      ) : null}
    </div>
  );
}
