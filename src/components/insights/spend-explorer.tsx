"use client";

import { ArrowDownRight, ArrowUpRight, CalendarDays, ChartColumn, ChartSpline, ChevronDown, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { IconButton } from "@/components/ui/button";
import { MenuItem, Popover } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Progress, SplitMoney } from "@/components/ui/stat";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { CellStack, EmptyState, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Tabs, Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SearchField } from "@/components/ui/toolbar";
import { monthSummary, months, spendSeries, thisMonthSpend, topCategories, topMerchants, type Month } from "@/data/insights";
import { cn } from "@/lib/cn";
import { formatMoney, pluralize } from "@/lib/format";
import { SpendChart, SpendLegend } from "./spend-chart";

const granularityOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

function Change({ value }: { value: number }) {
  if (value === 0) return <span className="text-ink-3">—</span>;
  const up = value > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 tabular", up ? "text-warning" : "text-positive")}>
      <Icon className="size-3.5 stroke-[1.75]" />
      {Math.abs(value)}%
    </span>
  );
}

function MonthPicker({ value, onChange }: { value: Month; onChange: (month: Month) => void }) {
  return (
    <Popover
      className="w-[176px]"
      panelClassName="w-full"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Month"
          className={cn(
            "flex h-14 w-full items-center gap-2 border-b text-left text-[20px] text-ink-1 transition-colors",
            open ? "border-ink-3" : "border-line hover:border-line-strong",
          )}
        >
          <span className="flex-1 truncate">{value}</span>
          <CalendarDays className="size-[18px] shrink-0 stroke-[1.5] text-ink-2" />
        </button>
      )}
    >
      {(close) => (
        <>
          {[...months].reverse().map((month) => (
            <MenuItem
              key={month}
              selected={month === value}
              hint={month === "November" ? "Month to date" : "2026"}
              onSelect={() => {
                onChange(month);
                close();
              }}
            >
              {month}
            </MenuItem>
          ))}
        </>
      )}
    </Popover>
  );
}

function previousMonthOf(month: Month) {
  const all = ["May", ...months];
  return all[all.indexOf(month) - 1];
}

/** Filter row, KPIs, spend chart and the merchant/category breakdown. */
export function SpendExplorer() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<Month>("November");
  const [granularity, setGranularity] = useState<"daily" | "weekly">("daily");
  const [mode, setMode] = useState<"line" | "bar">("line");
  const [breakdown, setBreakdown] = useState("merchants");

  const summary = monthSummary(month);
  const series = useMemo(() => spendSeries(month), [month]);
  const scale = summary.spend / thisMonthSpend;
  const short = month.slice(0, 3);
  const previous = previousMonthOf(month);

  const q = query.trim().toLowerCase();
  const merchants = topMerchants
    .filter((m) => !q || `${m.merchant} ${m.category} ${m.owner}`.toLowerCase().includes(q))
    .map((m) => ({ ...m, amount: Math.round(m.amount * scale * 100) / 100 }));
  const categories = topCategories
    .filter((c) => !q || c.category.toLowerCase().includes(q))
    .map((c) => ({ ...c, amount: Math.round(c.amount * scale * 100) / 100 }));
  const rows = breakdown === "merchants" ? merchants : categories;
  const shownTotal = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <section className="border-t border-line">
      <div className="flex items-end gap-[17px] px-page pt-[50px]">
        <SearchField
          variant="underline"
          value={query}
          onChange={setQuery}
          placeholder="Search Transactions"
          className="w-[440px] text-ink-1 [&_input]:text-ink-1"
        />
        <MonthPicker value={month} onChange={setMonth} />
        <Select
          variant="underline"
          label="Granularity"
          value={granularity}
          onChange={(value) => setGranularity(value as "daily" | "weekly")}
          options={granularityOptions}
          placeholder="Daily"
          className="w-[176px] text-ink-1"
        />
        <IconButton
          variant="bare"
          label="Download spend report"
          className="mb-3 ml-auto text-ink-1 [&_svg]:size-[18px]"
          onClick={() => toast.show(`Exporting ${month} spend report (CSV)`, "neutral")}
        >
          <Download />
        </IconButton>
      </div>

      <div className="flex items-start justify-between px-page pt-[52px]">
        <div className="flex gap-[100px]">
          <div>
            <div className="text-[13px] text-ink-2">{summary.partial ? "This Month’s Spend" : `${month} Spend`}</div>
            <div className="mt-1 text-[52px] leading-[1.05] tracking-[-0.03em] text-ink tabular">
              <SplitMoney value={summary.spend} />
            </div>
          </div>
          <div>
            <div className="text-[13px] text-ink-2">{summary.partial ? "This Month’s Cashback" : `${month} Cashback`}</div>
            <div className="mt-1 text-[52px] leading-[1.05] tracking-[-0.03em] text-positive tabular">
              <SplitMoney value={summary.cashback} />
            </div>
          </div>
        </div>
        <Segmented
          className="gap-2"
          value={mode}
          onChange={setMode}
          options={[
            { value: "line", label: <>Line <ChartSpline /></> },
            { value: "bar", label: <>Bar <ChartColumn /></> },
          ]}
        />
      </div>

      <div className="px-page pt-10 pb-4">
        <div className="mb-4 flex justify-end">
          <SpendLegend month={`This month (${short})`} previousMonth={`Last month (${previous.slice(0, 3)})`} />
        </div>
        <SpendChart
          data={series}
          mode={mode}
          month={short}
          previousMonth={previous.slice(0, 3)}
          granularity={granularity}
          height={380}
        />
      </div>

      <Tabs
        className="mt-12 gap-4"
        value={breakdown}
        onChange={setBreakdown}
        items={[
          { label: "Top merchants", value: "merchants", count: merchants.length },
          { label: "Top categories", value: "categories", count: categories.length },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState title="No matching spend" description={`Nothing in ${month} matches “${query}”.`} />
      ) : breakdown === "merchants" ? (
        <Table minWidth={980}>
          <THead>
            <tr>
              <Th className="w-[30%]">Merchant</Th>
              <Th className="w-[18%]">Owner</Th>
              <Th className="w-[12%]" align="right">
                Transactions
              </Th>
              <Th className="w-[22%]">Share of spend</Th>
              <Th className="w-[9%]" align="right">
                vs. {previous.slice(0, 3)}
              </Th>
              <Th align="right" sort="desc">
                Amount
              </Th>
            </tr>
          </THead>
          <TBody>
            {merchants.map((m) => (
              <Tr key={m.merchant} onClick={() => toast.show(`Showing ${m.merchant} transactions for ${month}`, "neutral")}>
                <Td>
                  <div className="flex items-center gap-3">
                    <MerchantLogo name={m.merchant} size={30} />
                    <CellStack primary={m.merchant} secondary={m.category} />
                  </div>
                </Td>
                <Td>{m.owner}</Td>
                <Td align="right">{m.transactions}</Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <Progress value={m.amount} max={summary.spend} className="max-w-[160px]" />
                    <span className="w-11 text-[12px] text-ink-2 tabular">{((m.amount / summary.spend) * 100).toFixed(1)}%</span>
                  </div>
                </Td>
                <Td align="right">
                  <Change value={m.change} />
                </Td>
                <Td align="right" className="text-[14px] text-ink">
                  {formatMoney(m.amount)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      ) : (
        <Table minWidth={980}>
          <THead>
            <tr>
              <Th className="w-[30%]">Category</Th>
              <Th className="w-[18%]" align="right">
                Merchants
              </Th>
              <Th className="w-[12%]" align="right">
                Transactions
              </Th>
              <Th className="w-[22%]">Budget used</Th>
              <Th className="w-[9%]" align="right">
                vs. {previous.slice(0, 3)}
              </Th>
              <Th align="right" sort="desc">
                Amount
              </Th>
            </tr>
          </THead>
          <TBody>
            {categories.map((c) => {
              const used = c.amount / c.budget;
              return (
                <Tr key={c.category} onClick={() => toast.show(`Showing ${c.category} spend for ${month}`, "neutral")}>
                  <Td>
                    <CellStack primary={c.category} secondary={`${((c.amount / summary.spend) * 100).toFixed(1)}% of total spend`} />
                  </Td>
                  <Td align="right">{c.merchants}</Td>
                  <Td align="right">{c.transactions}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Progress value={c.amount} max={c.budget} tone={used > 1 ? "warning" : "ink"} className="max-w-[160px]" />
                      <span className={cn("w-11 text-[12px] tabular", used > 1 ? "text-warning" : "text-ink-2")}>
                        {Math.round(used * 100)}%
                      </span>
                    </div>
                  </Td>
                  <Td align="right">
                    <Change value={c.change} />
                  </Td>
                  <Td align="right" className="text-[14px] text-ink">
                    {formatMoney(c.amount)}
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      )}
      <div className="flex h-11 items-center justify-between px-page text-[12px] text-ink-2">
        <button
          type="button"
          onClick={() => toast.show(`Exporting ${month} ${breakdown} breakdown (CSV)`, "neutral")}
          className="inline-flex items-center gap-1 hover:text-ink"
        >
          Export
          <ChevronDown className="size-3.5 stroke-[1.5]" />
        </button>
        <span className="tabular">
          {pluralize(rows.length, breakdown === "merchants" ? "merchant" : "category", breakdown === "merchants" ? "merchants" : "categories")} ·{" "}
          {formatMoney(shownTotal)}
        </span>
      </div>
    </section>
  );
}
