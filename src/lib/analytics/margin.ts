export function calcMarginPercent(
  netProfit: number,
  grossRevenue: number,
): number {
  return grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
}
