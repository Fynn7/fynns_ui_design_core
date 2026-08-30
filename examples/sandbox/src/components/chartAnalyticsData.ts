export type ChartAnalyticsPoint = {
  label: string;
  inbound: number;
  outbound: number;
  cost: number;
};

/** Generic daily samples — not tied to any consumer product. */
export const CHART_BY_DATE: readonly ChartAnalyticsPoint[] = [
  { label: "07.02", inbound: 1_200_000, outbound: 800_000, cost: 0.42 },
  { label: "07.06", inbound: 2_100_000, outbound: 1_400_000, cost: 0.68 },
  { label: "07.13", inbound: 900_000, outbound: 650_000, cost: 0.31 },
  { label: "07.17", inbound: 3_800_000, outbound: 2_200_000, cost: 1.12 },
  { label: "07.21", inbound: 1_600_000, outbound: 1_100_000, cost: 0.55 },
  { label: "07.25", inbound: 4_500_000, outbound: 3_100_000, cost: 1.36 },
  { label: "07.30", inbound: 2_800_000, outbound: 1_900_000, cost: 0.92 },
  { label: "08.18", inbound: 5_200_000, outbound: 3_600_000, cost: 1.58 },
  { label: "08.24", inbound: 7_800_000, outbound: 5_400_000, cost: 2.05 },
  { label: "08.28", inbound: 12_400_000, outbound: 8_900_000, cost: 2.73 },
];

/** Generic category split for the alternate view. */
export const CHART_BY_CATEGORY: readonly ChartAnalyticsPoint[] = [
  { label: "Sample A", inbound: 4_200_000, outbound: 2_800_000, cost: 1.05 },
  { label: "Sample B", inbound: 3_100_000, outbound: 2_400_000, cost: 0.88 },
  { label: "Sample C", inbound: 2_600_000, outbound: 1_900_000, cost: 0.72 },
  { label: "Sample D", inbound: 1_800_000, outbound: 1_200_000, cost: 0.49 },
  { label: "Sample E", inbound: 980_000, outbound: 720_000, cost: 0.28 },
];

export function formatCompactCount(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const scaled = value / 1_000_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const scaled = value / 1_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}K`;
  }
  return String(Math.round(value));
}

export function formatUsd(value: number): string {
  if (value >= 10) return `$${value.toFixed(0)}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(3)}`;
}
