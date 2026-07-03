import type { FinanceOperation } from "@/types/finance";
import type { ProductProfitStatus } from "@/types/analytics";
import type { NetProfitInput, OperationTotals, UnitCostInput } from "./types";

/** Порог маржинальности, ниже которого товар считается низкомаржинальным, % */
export const LOW_MARGIN_THRESHOLD = 10;

export function aggregateOperations(
  operations: Pick<
    FinanceOperation,
    | "quantity"
    | "amount"
    | "commission"
    | "logistics"
    | "acquiring"
    | "returnAmount"
    | "penalty"
    | "otherDeduction"
  >[],
): OperationTotals {
  const totals: OperationTotals = {
    soldQuantity: 0,
    ordersCount: 0,
    grossRevenue: 0,
    commission: 0,
    logistics: 0,
    acquiring: 0,
    returnAmount: 0,
    penalty: 0,
    otherDeduction: 0,
  };

  for (const op of operations) {
    totals.soldQuantity += op.quantity;
    if (op.amount > 0) totals.ordersCount += 1;
    totals.grossRevenue += op.amount;
    totals.commission += op.commission;
    totals.logistics += op.logistics;
    totals.acquiring += op.acquiring;
    totals.returnAmount += op.returnAmount;
    totals.penalty += op.penalty;
    totals.otherDeduction += op.otherDeduction;
  }

  return totals;
}

export function calcTotalOzonExpenses(totals: OperationTotals): number {
  return (
    totals.commission +
    totals.logistics +
    totals.acquiring +
    totals.returnAmount +
    totals.penalty +
    totals.otherDeduction
  );
}

export function calcProductUnitCost(cost: UnitCostInput): number {
  return (
    cost.purchaseCost + cost.packagingCost + cost.deliveryCost + cost.otherCost
  );
}

export function calcTaxAmount(grossRevenue: number, taxPercent: number): number {
  return (grossRevenue * taxPercent) / 100;
}

export function calcNetProfit(input: NetProfitInput): number {
  return (
    input.grossRevenue -
    input.totalOzonExpenses -
    input.totalProductCost -
    input.taxAmount
  );
}

export function getProfitStatus(params: {
  hasCost: boolean;
  netProfit: number;
  marginPercent: number;
}): ProductProfitStatus {
  if (!params.hasCost) return "no_cost";
  if (params.netProfit < 0) return "loss";
  if (params.marginPercent < LOW_MARGIN_THRESHOLD) return "low_margin";
  return "profitable";
}
