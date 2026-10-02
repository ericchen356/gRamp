"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from "recharts";
import type { BalancePoint } from "@/data/treasury";
import { formatMoney } from "@/lib/format";

/** Tooltip card shared by the treasury charts. */
export function ChartTooltipCard({ title, rows }: { title: string; rows: { label: string; value: string; swatch?: string }[] }) {
  return (
    <div className="min-w-[180px] rounded-[4px] border border-line bg-canvas px-3 py-2.5 text-[12px] shadow-pop">
      <div className="mb-1.5 text-ink-2">{title}</div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2 py-0.5">
          {row.swatch && <span className="size-2 shrink-0 rounded-full" style={{ background: row.swatch }} />}
          <span className="flex-1 text-ink-2">{row.label}</span>
          <span className="text-ink tabular">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function BalanceTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload as BalancePoint | undefined;
  if (!active || !point) return null;
  return (
    <ChartTooltipCard
      title={point.label}
      rows={[
        { label: "Invested", value: formatMoney(point.invested), swatch: "var(--color-chart-plum)" },
        { label: "Cash", value: formatMoney(point.cash), swatch: "var(--color-chart-sage)" },
        { label: "Total", value: formatMoney(point.cash + point.invested) },
      ]}
    />
  );
}

/**
 * Stacked balance history: sage (cash) at the bottom, plum (invested) on top,
 * both fading to the canvas so the chart sits on the page without an axis.
 */
export function BalanceChart({ data, height = 128 }: { data: BalancePoint[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full" role="img" aria-label="Total balance over the last 15 months">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="treasury-sage" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-sage-fill)" stopOpacity={1} />
              <stop offset="45%" stopColor="var(--color-chart-sage-fill)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--color-chart-sage-fill)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="treasury-plum" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-plum-fill)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--color-chart-plum-fill)" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <Tooltip
            content={BalanceTooltip}
            cursor={{ stroke: "var(--color-ink-4)", strokeWidth: 1, strokeDasharray: "2 3" }}
            isAnimationActive={false}
          />
          <Area
            type="linear"
            dataKey="cash"
            stackId="balance"
            stroke="var(--color-chart-sage)"
            strokeWidth={1}
            strokeOpacity={0.6}
            fill="url(#treasury-sage)"
            activeDot={{ r: 3, fill: "var(--color-chart-sage)", stroke: "var(--color-canvas)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Area
            type="linear"
            dataKey="invested"
            stackId="balance"
            stroke="var(--color-chart-plum)"
            strokeWidth={1.25}
            fill="url(#treasury-plum)"
            activeDot={{ r: 3, fill: "var(--color-chart-plum)", stroke: "var(--color-canvas)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
