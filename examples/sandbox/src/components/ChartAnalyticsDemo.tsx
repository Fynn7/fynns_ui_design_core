import {
  Card,
  ControlRow,
  ControlStack,
  ToggleGroup,
} from "@fynns/ui";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale } from "../i18n";
import { SandboxHelp } from "./SandboxHelp";
import {
  CHART_BY_CATEGORY,
  CHART_BY_DATE,
  formatCompactCount,
  formatUsd,
  type ChartAnalyticsPoint,
} from "./chartAnalyticsData";

type ChartView = "date" | "category";

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number;
  dataKey?: string;
};

function ChartTooltip({
  active,
  payload,
  label,
  inboundLabel,
  outboundLabel,
  costLabel,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  inboundLabel: string;
  outboundLabel: string;
  costLabel: string;
}) {
  if (!active || !payload?.length) return null;

  const rows = payload.filter((entry) => typeof entry.value === "number");
  const labelFor = (key: string) => {
    if (key === "inbound") return inboundLabel;
    if (key === "outbound") return outboundLabel;
    if (key === "cost") return costLabel;
    return key;
  };
  const formatValue = (key: string, value: number) =>
    key === "cost" ? formatUsd(value) : formatCompactCount(value);

  return (
    <div className="fynns-chart-tooltip" role="status">
      <div className="fynns-chart-tooltip__title">{label}</div>
      <dl className="fynns-chart-tooltip__rows">
        {rows.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? "");
          const value = entry.value ?? 0;
          return (
            <div key={key} className="fynns-chart-tooltip__row">
              <dt>
                <span
                  className="fynns-chart-tooltip__swatch"
                  style={{ background: entry.color }}
                  aria-hidden
                />
                {labelFor(key)}
              </dt>
              <dd>{formatValue(key, value)}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function ChartLegend({
  inboundLabel,
  outboundLabel,
  costLabel,
}: {
  inboundLabel: string;
  outboundLabel: string;
  costLabel: string;
}) {
  return (
    <ul className="fynns-chart-legend" aria-label="Chart legend">
      <li className="fynns-chart-legend__item">
        <span className="fynns-chart-legend__swatch fynns-chart-legend__swatch--bar-1" />
        {inboundLabel}
      </li>
      <li className="fynns-chart-legend__item">
        <span className="fynns-chart-legend__swatch fynns-chart-legend__swatch--bar-2" />
        {outboundLabel}
      </li>
      <li className="fynns-chart-legend__item">
        <span className="fynns-chart-legend__swatch fynns-chart-legend__swatch--line" />
        {costLabel}
      </li>
    </ul>
  );
}

function buildNiceTicks(maxValue: number, count = 4): number[] {
  if (maxValue <= 0) return [0];
  const rough = maxValue / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const niceStep =
    normalized <= 1 ? magnitude : normalized <= 2 ? 2 * magnitude : normalized <= 5 ? 5 * magnitude : 10 * magnitude;
  const ticks: number[] = [];
  for (let v = 0; v <= maxValue + niceStep * 0.01; v += niceStep) {
    ticks.push(v);
  }
  return ticks;
}

function useChartScales(rows: readonly ChartAnalyticsPoint[]) {
  return useMemo(() => {
    let maxVolume = 0;
    let maxCost = 0;
    for (const row of rows) {
      maxVolume = Math.max(maxVolume, row.inbound + row.outbound);
      maxCost = Math.max(maxCost, row.cost);
    }
    return {
      volumeTicks: buildNiceTicks(maxVolume),
      costTicks: buildNiceTicks(maxCost),
      volumeMax: buildNiceTicks(maxVolume).at(-1) ?? maxVolume,
      costMax: buildNiceTicks(maxCost).at(-1) ?? maxCost,
    };
  }, [rows]);
}

export function ChartAnalyticsDemo() {
  const { t } = useLocale();
  const [view, setView] = useState<ChartView>("date");
  const rows = view === "date" ? CHART_BY_DATE : CHART_BY_CATEGORY;
  const scales = useChartScales(rows);

  const inboundLabel = t("globals.chartSeriesInbound");
  const outboundLabel = t("globals.chartSeriesOutbound");
  const costLabel = t("globals.chartSeriesCost");

  return (
    <Card className="sandbox-globals-card sandbox-globals-card--chart" title={t("globals.chartCardTitle")}>
      <ControlStack columns={1}>
        <ControlRow label={t("globals.chartViewLabel")}>
          <ToggleGroup
            ariaLabel={t("globals.chartViewLabel")}
            showCheck={false}
            value={view}
            onChange={(value) => setView(value as ChartView)}
            options={[
              { value: "date", label: t("globals.chartViewDate") },
              { value: "category", label: t("globals.chartViewCategory") },
            ]}
          />
        </ControlRow>
      </ControlStack>

      <div className="fynns-chart">
        <div className="fynns-chart-plot">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={rows}
              margin={{
                top: 8,
                right: 8,
                bottom: 0,
                left: 0,
              }}
              barCategoryGap="28%"
              barGap={2}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--fynns-chart-grid-stroke)"
                strokeDasharray="3 6"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={16}
                tick={{
                  fill: "var(--fynns-color-text-muted)",
                  fontSize: 12,
                  fontFamily: "var(--fynns-font-ui)",
                }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={44}
                domain={[0, scales.volumeMax]}
                ticks={scales.volumeTicks}
                tick={{
                  fill: "var(--fynns-color-text-muted)",
                  fontSize: 12,
                  fontFamily: "var(--fynns-font-ui)",
                }}
                tickFormatter={formatCompactCount}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={52}
                domain={[0, scales.costMax]}
                ticks={scales.costTicks}
                tick={{
                  fill: "var(--fynns-chart-series-line)",
                  fontSize: 12,
                  fontFamily: "var(--fynns-font-ui)",
                }}
                tickFormatter={formatUsd}
              />
              <Tooltip
                cursor={{
                  fill: "color-mix(in srgb, var(--fynns-color-accent) 8%, transparent)",
                }}
                content={
                  <ChartTooltip
                    inboundLabel={inboundLabel}
                    outboundLabel={outboundLabel}
                    costLabel={costLabel}
                  />
                }
              />
              <Bar
                yAxisId="left"
                dataKey="inbound"
                name="inbound"
                stackId="volume"
                fill="var(--fynns-chart-series-1)"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                yAxisId="left"
                dataKey="outbound"
                name="outbound"
                stackId="volume"
                fill="var(--fynns-chart-series-2)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                name="cost"
                stroke="var(--fynns-chart-series-line)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "var(--fynns-chart-series-line)",
                  stroke: "var(--fynns-color-surface-1)",
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 5,
                  fill: "var(--fynns-chart-series-line)",
                  stroke: "var(--fynns-color-surface-1)",
                  strokeWidth: 2,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          inboundLabel={inboundLabel}
          outboundLabel={outboundLabel}
          costLabel={costLabel}
        />
      </div>
      <SandboxHelp as="span" text={t("globals.chartHelp")} />
    </Card>
  );
}
