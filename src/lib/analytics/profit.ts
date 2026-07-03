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
    | "lastMile"
    | "returnLogistics"
    | "acquiring"
    | "advertising"
    | "storage"
    | "returnAmount"
    | "penalty"
    | "otherDeduction"
    | "unclassified"
  >[],
): OperationTotals {
  const totals: OperationTotals = {
    soldQuantity: 0,
    returnedQuantity: 0,
    ordersCount: 0,
    grossRevenue: 0,
    returnAmount: 0,
    commission: 0,
    logistics: 0,
    lastMile: 0,
    returnLogistics: 0,
    acquiring: 0,
    advertising: 0,
    storage: 0,
    penalty: 0,
    otherDeduction: 0,
    unclassified: 0,
  };

  for (const op of operations) {
    totals.soldQuantity += op.quantity;
    if (op.quantity < 0) totals.returnedQuantity += -op.quantity;
    if (op.amount > 0) totals.ordersCount += 1;
    totals.grossRevenue += op.amount;
    totals.returnAmount += op.returnAmount;
    totals.commission += op.commission;
    totals.logistics += op.logistics;
    totals.lastMile += op.lastMile;
    totals.returnLogistics += op.returnLogistics;
    totals.acquiring += op.acquiring;
    totals.advertising += op.advertising;
    totals.storage += op.storage;
    totals.penalty += op.penalty;
    totals.otherDeduction += op.otherDeduction;
    totals.unclassified += op.unclassified;
  }

  return totals;
}

export function calcTotalOzonExpenses(totals: OperationTotals): number {
  return (
    totals.commission +
    totals.logistics +
    totals.lastMile +
    totals.returnLogistics +
    totals.acquiring +
    totals.advertising +
    totals.storage +
    totals.returnAmount +
    totals.penalty +
    totals.otherDeduction +
    totals.unclassified
  );
}

/**
 * Поступление на расчётный счёт: начисления минус все удержания Ozon
 * (Excel «5. Расчет ЧП» B71 «ПОСТУПЛЕНИЕ НА Р/С»)
 */
export function calcPayout(totals: OperationTotals): number {
  return totals.grossRevenue - calcTotalOzonExpenses(totals);
}

export function calcProductUnitCost(cost: UnitCostInput): number {
  return (
    cost.purchaseCost + cost.packagingCost + cost.deliveryCost + cost.otherCost
  );
}

/**
 * Чистая прибыль (Excel «5. Расчет ЧП» B82):
 * поступление на р/с − себестоимость проданного − накладные − налоги.
 */
export function calcNetProfit(input: NetProfitInput): number {
  return (
    input.grossRevenue -
    input.totalOzonExpenses -
    input.totalProductCost -
    input.overheadCost -
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
