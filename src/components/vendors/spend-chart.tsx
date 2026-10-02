"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, formatMoneyCompact } from "@/lib/format";

export type SpendSeries = { key: string; label: string; color: string };

const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short" });
const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

const toDate = (month: string) => new Date(`${month}-15T12:00:00`);

type TooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: unknown; value?: unknown }>;
  label?: unknown;
  series: SpendSeries[];
};

function ChartTooltip({ active, payload, label, series }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, item) => sum + Number(item.value ?? 0), 0);
  return (
    <div className="min-w-[180px] rounded-[4px] border border-line bg-canvas px-3 py-2.5 text-[12px] shadow-pop">
      <div className="mb-1.5 text-ink-2">{monthLong.format(toDate(String(label)))}</div>
      {series.map((s) => {
        const item = payload.find((p) => p.dataKey === s.key);
        if (!item) return null;
        return (
          <div key={s.key} className="flex items-center justify-between gap-6 py-0.5 text-ink-1">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-[1px]" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="tabular">{formatMoney(Number(item.value ?? 0))}</span>
          </div>
        );
      })}
      {series.length > 1 && (
        <div className="mt-1.5 flex justify-between border-t border-line pt-1.5 text-ink">
          <span>Total</span>
          <span className="tabular">{formatMoney(total)}</span>
        </div>
      )}
    </div>
  );
}

/** Monochrome monthly spend bars (stacked when given several series). */
export function SpendChart({
  data,
  series,
  height = 220,
  highlightLast,
}: {
  data: Record<string, number | string>[];
  series: SpendSeries[];
  height?: number;
  /** Draws the most recent month in ink and earlier months in sand. */
  highlightLast?: boolean;
}) {
  return (
    <BarChart
      responsive
      data={data}
      style={{ width: "100%", height }}
      margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
      barCategoryGap="28%"
    >
      <CartesianGrid vertical={false} stroke="var(--color-line)" />
      <XAxis
        dataKey="month"
        tickFormatter={(month: string) => monthLabel.format(toDate(month))}
        tickLine={false}
        axisLine={{ stroke: "var(--color-line-strong)" }}
        tick={{ fontSize: 12, fill: "var(--color-ink-3)" }}
        tickMargin={8}
      />
      <YAxis
        tickFormatter={(value: number) => formatMoneyCompact(value)}
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 12, fill: "var(--color-ink-3)" }}
        width={52}
        tickCount={5}
      />
      <Tooltip
        cursor={{ fill: "var(--color-muted)", opacity: 0.6 }}
        content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={label} series={series} />}
        isAnimationActive={false}
      />
      {series.map((s, index) => (
        <Bar
          key={s.key}
          dataKey={s.key}
          stackId="spend"
          fill={s.color}
          isAnimationActive={false}
          maxBarSize={44}
          shape={
            highlightLast && series.length === 1
              ? (props: { x?: number; y?: number; width?: number; height?: number; index?: number }) => (
                  <rect
                    x={props.x}
                    y={props.y}
                    width={props.width}
                    height={props.height}
                    fill={props.index === data.length - 1 ? "var(--color-ink-1)" : s.color}
                  />
                )
              : undefined
          }
          radius={index === series.length - 1 ? [1, 1, 0, 0] : 0}
        />
      ))}
    </BarChart>
  );
}
