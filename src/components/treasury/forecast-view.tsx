"use client";

import { Download, Info, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { Button, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { MenuItem, Popover } from "@/components/ui/popover";
import { SectionHeading } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { Segmented } from "@/components/ui/tabs";
import {
  buildForecast,
  forecastAssumptions,
  forecastOpeningBalance,
  scenarioFactor,
  type ForecastScenario,
  type ForecastWeek,
} from "@/data/treasury";
import { cn } from "@/lib/cn";
import { formatMoney, formatMoneyCompact, formatMoneyWhole } from "@/lib/format";
import { ChartTooltipCard } from "./balance-chart";

const scenarios: { value: ForecastScenario; label: string }[] = [
  { value: "base", label: "Base case" },
  { value: "conservative", label: "Conservative" },
  { value: "optimistic", label: "Optimistic" },
];

const AXIS_WIDTH = 64;
const axisTick = { fontSize: 12, fill: "var(--color-ink-3)" };
const series = {
  balance: "var(--color-chart-plum)",
  inflows: "var(--color-chart-sage)",
  outflows: "var(--color-chart-plum-fill)",
};

function ForecastTooltip({ active, payload }: TooltipContentProps) {
  const week = payload?.[0]?.payload as ForecastWeek | undefined;
  if (!active || !week) return null;
  return (
    <ChartTooltipCard
      title={`Week of ${week.week}`}
      rows={[
        { label: "Projected balance", value: formatMoney(week.balance), swatch: series.balance },
        { label: "Inflows", value: formatMoney(week.inflows), swatch: series.inflows },
        { label: "Outflows", value: `−${formatMoney(week.outflows)}`, swatch: series.outflows },
        { label: "Net", value: formatMoney(week.inflows - week.outflows) },
      ]}
    />
  );
}

/** Evenly spaced axis ticks on `step` boundaries that bracket the values. */
function niceTicks(values: number[], step: number) {
  const low = Math.floor(Math.min(...values) / step) * step;
  const high = Math.ceil(Math.max(...values) / step) * step;
  const ticks: number[] = [];
  for (let tick = low; tick <= high; tick += step) ticks.push(tick);
  return ticks;
}

function LegendItem({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
      <span className={cn("shrink-0", line ? "h-[2px] w-3 rounded-full" : "size-2 rounded-[2px]")} style={{ background: color }} />
      {label}
    </span>
  );
}

/** Cash & Treasury › Forecast: 13-week projection with scenarios and assumptions. */
export function ForecastView() {
  const toast = useToast();
  const [scenario, setScenario] = useState<ForecastScenario>("base");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const weeks = useMemo(
    () => buildForecast(scenario, forecastAssumptions.filter((a) => excluded.has(a.id))),
    [scenario, excluded],
  );
  const bars = useMemo(() => weeks.map((week) => ({ ...week, outflowBar: -week.outflows })), [weeks]);

  const ending = weeks[weeks.length - 1].balance;
  const lowest = weeks.reduce((min, week) => (week.balance < min.balance ? week : min), weeks[0]);
  const net = ending - forecastOpeningBalance;
  const balanceTicks = useMemo(() => niceTicks(weeks.map((week) => week.balance), 500_000), [weeks]);

  const toggle = (id: string, included: boolean) =>
    setExcluded((current) => {
      const next = new Set(current);
      if (included) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <section className="px-page pt-[38px] pb-12">
        <div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <Stat label="Cash today" value={formatMoney(forecastOpeningBalance)} size="md" />
            <Stat label="Projected in 13 weeks" info value={formatMoney(ending)} size="md" />
            <Stat
              label="Net change"
              value={`${net >= 0 ? "+" : "−"}${formatMoney(Math.abs(net))}`}
              tone={net >= 0 ? "money" : "warning"}
              size="md"
            />
            <Stat label="Lowest point" value={formatMoney(lowest.balance)} caption={`Week of ${lowest.week}`} size="md" />
          </div>
        </div>

        <div className="mt-12 flex items-end justify-between gap-6">
          <div>
            <SectionHeading size="md">Projected balance</SectionHeading>
            <div className="mt-2 flex items-center gap-4">
              <LegendItem color={series.balance} label="Balance" line />
              <LegendItem color={series.inflows} label="Inflows" />
              <LegendItem color={series.outflows} label="Outflows" />
            </div>
          </div>
          <Segmented options={scenarios} value={scenario} onChange={setScenario} />
        </div>

        <div className="mt-4 h-[200px]" role="img" aria-label="Projected cash balance by week">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeks} syncId="forecast" margin={{ top: 8, right: 0, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="forecast-balance" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-plum-fill)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--color-chart-plum-fill)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
              {/* Band scale keeps balance points centred over the weekly bars below. */}
              <XAxis dataKey="week" hide scale="band" />
              <YAxis
                width={AXIS_WIDTH}
                tickFormatter={formatMoneyCompact}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                ticks={balanceTicks}
                interval={0}
                domain={[balanceTicks[0], balanceTicks[balanceTicks.length - 1]]}
              />
              <Tooltip content={ForecastTooltip} cursor={{ stroke: "var(--color-ink-4)", strokeDasharray: "2 3" }} isAnimationActive={false} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={series.balance}
                strokeWidth={2}
                fill="url(#forecast-balance)"
                activeDot={{ r: 4, fill: series.balance, stroke: "var(--color-canvas)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 h-[170px]" role="img" aria-label="Weekly inflows and outflows">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} syncId="forecast" stackOffset="sign" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-line-soft)" />
              <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} interval={0} tickMargin={10} />
              <YAxis
                width={AXIS_WIDTH}
                tickFormatter={(value: number) => (value < 0 ? `−${formatMoneyCompact(-value)}` : formatMoneyCompact(value))}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                tickCount={5}
              />
              <ReferenceLine y={0} stroke="var(--color-line-strong)" />
              <Tooltip content={ForecastTooltip} cursor={{ fill: "var(--color-subtle)" }} isAnimationActive={false} />
              <Bar dataKey="inflows" stackId="flow" fill={series.inflows} radius={[2, 2, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              <Bar dataKey="outflowBar" stackId="flow" fill={series.outflows} radius={[0, 0, 2, 2]} maxBarSize={28} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="pb-10">
        <div className="flex items-center justify-between px-page pb-4">
          <div>
            <SectionHeading size="md">Assumptions</SectionHeading>
            <p className="mt-1 text-[13px] text-ink-2">
              Weekly drivers behind the forecast. Turn one off to see the projection without it.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => toast.show("Forecast exported to CSV", "neutral")}>
              <Download className="size-3.5 stroke-[1.5]" />
              Export
            </Button>
            <Button size="sm" variant="primary" onClick={() => toast.show("Custom assumption added to the base case", "neutral")}>
              Add assumption
            </Button>
          </div>
        </div>
        <Table className="border-t border-line" minWidth={1000}>
          <THead>
            <tr>
              <Th className="w-[20%]">Category</Th>
              <Th>Driver</Th>
              <Th className="w-[12%]">Source</Th>
              <Th className="w-[13%]" align="right">
                Weekly average
              </Th>
              <Th className="w-[10%]" align="right">
                Growth / qtr
              </Th>
              <Th className="w-[13%]" align="right">
                13-week total
              </Th>
              <Th className="w-[136px]">Included</Th>
            </tr>
          </THead>
          <TBody>
            {forecastAssumptions.map((assumption) => {
              const included = !excluded.has(assumption.id);
              const weekly = assumption.weekly * scenarioFactor(scenario, assumption.direction);
              const sign = assumption.direction === "inflow" ? "" : "−";
              return (
                <Tr key={assumption.id} interactive={false} className={cn("hover:bg-subtle", !included && "text-ink-4")}>
                  <Td className="h-[52px]">
                    <span className="flex items-center gap-2.5">
                      <span
                        className="size-2 shrink-0 rounded-[2px]"
                        style={{ background: assumption.direction === "inflow" ? series.inflows : series.outflows }}
                        aria-hidden
                      />
                      <span className={cn("text-[14px]", included ? "text-ink" : "text-ink-4")}>{assumption.category}</span>
                    </span>
                  </Td>
                  <Td className={cn("whitespace-nowrap", included ? "text-ink-2" : "text-ink-4")}>{assumption.driver}</Td>
                  <Td className={cn(included ? "text-ink-1" : "text-ink-4")}>{assumption.source}</Td>
                  <Td align="right" className={cn(included ? "text-ink" : "text-ink-4 line-through")}>
                    {sign}
                    {formatMoneyWhole(weekly)}
                  </Td>
                  <Td align="right" className={cn(included ? "text-ink-1" : "text-ink-4")}>
                    {assumption.growth === 0 ? "—" : `${(assumption.growth * 100).toFixed(0)}%`}
                  </Td>
                  <Td align="right" className={cn(included ? "text-ink" : "text-ink-4 line-through")}>
                    {sign}
                    {formatMoneyWhole(weekly * 13)}
                  </Td>
                  <Td>
                    <span className="flex items-center justify-between">
                      <Switch
                        label={`Include ${assumption.category}`}
                        checked={included}
                        onChange={(next) => toggle(assumption.id, next)}
                      />
                      <Popover
                        align="end"
                        trigger={({ toggle: open }) => (
                          <IconButton variant="bare" size="sm" label={`${assumption.category} options`} onClick={open} className="[&_svg]:size-4">
                            <MoreHorizontal />
                          </IconButton>
                        )}
                      >
                        {(close) => (
                          <>
                            <MenuItem
                              onSelect={() => {
                                close();
                                toast.show(`Editing ${assumption.category.toLowerCase()} assumption`, "neutral");
                              }}
                            >
                              Edit assumption
                            </MenuItem>
                            <MenuItem
                              onSelect={() => {
                                close();
                                toast.show(`${assumption.category} reset to ${assumption.source} data`, "neutral");
                              }}
                            >
                              Reset to source
                            </MenuItem>
                          </>
                        )}
                      </Popover>
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
        {/* Static (not sticky) footer: the table sits below the charts, not in a scrolling list. */}
        <div className="flex h-10 items-center justify-between px-page text-[12px] text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <Info className="size-3 stroke-[1.5]" />
            Updated daily from connected accounts · Last refresh Oct 2, 6:00 AM
          </span>
          <span className="tabular">
            {forecastAssumptions.length - excluded.size} of {forecastAssumptions.length} assumptions included
          </span>
        </div>
      </section>
    </>
  );
}
