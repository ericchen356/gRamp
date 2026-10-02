"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
  type YAxisTickContentProps,
} from "recharts";
import type { DailySpend } from "@/data/insights";
import { formatMoney } from "@/lib/format";

/** Series colors: this month in ink, last month as the quiet sand ghost line from Insights. */
const CURRENT = "var(--color-ink-1)";
const PREVIOUS = "#cfcfb6";
const GRID = "var(--color-line)";

/** Axis money: $1.0m, $750k, $0. */
export function formatAxisMoney(value: number) {
  if (value === 0) return "$0";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
  return `$${Math.round(value / 1000)}k`;
}

/** Axis ceiling split into four round steps (12.5k-style labels never appear). */
function niceMax(value: number) {
  const steps = [5_000, 10_000, 15_000, 20_000, 25_000, 50_000, 75_000, 100_000, 150_000, 200_000, 250_000, 500_000, 750_000, 1_000_000];
  const step = steps.find((s) => s * 4 >= value) ?? 2_500_000;
  return step * 4;
}

type Point = { label: string; current?: number; previous: number };

type SpendChartProps = {
  data: DailySpend[];
  mode: "line" | "bar";
  /** Short month name for tooltips ("Nov"). */
  month: string;
  previousMonth: string;
  /** Group daily points into calendar weeks. */
  granularity?: "daily" | "weekly";
  height?: number;
};

function toPoints(data: DailySpend[], mode: "line" | "bar", month: string, granularity: "daily" | "weekly"): Point[] {
  const grouped =
    granularity === "weekly"
      ? Array.from({ length: Math.ceil(data.length / 7) }, (_, week) => {
          const slice = data.slice(week * 7, week * 7 + 7);
          const hasCurrent = slice.some((d) => d.current !== undefined);
          return {
            label: `${month} ${slice[0].day}–${slice[slice.length - 1].day}`,
            current: hasCurrent ? slice.reduce((sum, d) => sum + (d.current ?? 0), 0) : undefined,
            previous: slice.reduce((sum, d) => sum + d.previous, 0),
          };
        })
      : data.map((d) => ({ label: `${month} ${d.day}`, current: d.current, previous: d.previous }));

  if (mode === "bar") return grouped;

  // Line view is cumulative month-to-date, which is how Ramp plots spend pace.
  let runningCurrent = 0;
  let runningPrevious = 0;
  return grouped.map((point) => {
    runningPrevious += point.previous;
    if (point.current !== undefined) runningCurrent += point.current;
    return {
      label: point.label,
      previous: runningPrevious,
      current: point.current === undefined ? undefined : runningCurrent,
    };
  });
}

function ChartTooltip({
  active,
  payload,
  label,
  month,
  previousMonth,
}: Partial<TooltipContentProps<TooltipValueType, string | number>> & { month: string; previousMonth: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as Point;
  return (
    <div className="min-w-[180px] border border-line-strong bg-canvas px-3 py-2.5 text-[13px] text-ink">
      <div className="mb-1.5 text-[12px] text-ink-2">{label}</div>
      {point.current !== undefined && (
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-3" style={{ background: CURRENT }} />
            {month}
          </span>
          <span className="tabular">{formatMoney(point.current)}</span>
        </div>
      )}
      <div className="mt-1 flex items-center justify-between gap-6">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-3" style={{ background: PREVIOUS }} />
          {previousMonth}
        </span>
        <span className="tabular">{formatMoney(point.previous)}</span>
      </div>
    </div>
  );
}

const axisTick = { fill: "var(--color-ink-3)", fontSize: 12 };

/** Spend vs last month: cumulative line or per-period grouped bars. */
export function SpendChart({ data, mode, month, previousMonth, granularity = "daily", height = 360 }: SpendChartProps) {
  const points = useMemo(() => toPoints(data, mode, month, granularity), [data, mode, month, granularity]);
  const max = niceMax(Math.max(...points.map((p) => Math.max(p.current ?? 0, p.previous))));
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];
  const tooltip = (
    <Tooltip
      isAnimationActive={false}
      cursor={mode === "line" ? { stroke: "var(--color-ink-1)", strokeWidth: 1 } : { fill: "var(--color-muted)", fillOpacity: 0.7 }}
      content={(props) => <ChartTooltip {...props} month={`This month (${month})`} previousMonth={`Last month (${previousMonth})`} />}
      offset={16}
    />
  );
  const axes = (
    <>
      <CartesianGrid vertical={false} stroke={GRID} />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={{ stroke: GRID }}
        tick={axisTick}
        tickMargin={10}
        interval={granularity === "weekly" ? 0 : 4}
        tickFormatter={(value: string) => value.split("–")[0]}
        padding={mode === "line" ? { left: 8, right: 8 } : undefined}
      />
      <YAxis
        orientation="left"
        width={56}
        domain={[0, max]}
        ticks={ticks}
        tickFormatter={formatAxisMoney}
        tickLine={false}
        axisLine={false}
        tick={({ y, payload }: YAxisTickContentProps) => (
          <text x={0} y={y} dy={4} fill="var(--color-ink-3)" fontSize={12} textAnchor="start">
            {formatAxisMoney(Number(payload.value))}
          </text>
        )}
      />
    </>
  );

  return (
    <div style={{ height }} className="w-full [&_.recharts-surface]:outline-none [&_*:focus]:outline-none">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1000, height }}>
        {mode === "line" ? (
          <LineChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            {axes}
            {tooltip}
            <Line
              type="monotone"
              dataKey="previous"
              stroke={PREVIOUS}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: PREVIOUS, stroke: "var(--color-canvas)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke={CURRENT}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: CURRENT, stroke: "var(--color-canvas)", strokeWidth: 2 }}
              connectNulls={false}
              animationDuration={500}
            />
          </LineChart>
        ) : (
          <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barGap={2} barCategoryGap={granularity === "weekly" ? "28%" : "22%"}>
            {axes}
            {tooltip}
            <Bar dataKey="previous" fill={PREVIOUS} radius={[2, 2, 0, 0]} animationDuration={400} />
            <Bar dataKey="current" fill={CURRENT} radius={[2, 2, 0, 0]} animationDuration={400} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/** Tiny legend row matching the tooltip swatches. */
export function SpendLegend({ month, previousMonth }: { month: string; previousMonth: string }) {
  return (
    <div className="flex items-center gap-5 text-[12px] text-ink-2">
      <span className="flex items-center gap-2">
        <span className="h-0.5 w-4" style={{ background: CURRENT }} />
        {month}
      </span>
      <span className="flex items-center gap-2">
        <span className="h-0.5 w-4" style={{ background: PREVIOUS }} />
        {previousMonth}
      </span>
    </div>
  );
}
