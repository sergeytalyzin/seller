export function calcRoiPercent(
  netProfit: number,
  totalProductCost: number,
): number {
  return totalProductCost > 0 ? (netProfit / totalProductCost) * 100 : 0;
}
