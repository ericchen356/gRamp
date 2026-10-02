"use client";

import { Columns3, Info, Rows3, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { CellStack, EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { benchmarkPercentile, benchmarkSavings, priceBenchmarks, type PriceBenchmark } from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { PercentileBar } from "./percentile-bar";

type View = "all" | "above" | "fair";

const owned = priceBenchmarks.filter((b) => b.yourPrice !== null);
const unitName = (b: PriceBenchmark) => b.unit.split(" / ")[0];

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

/** Vendors › Price Intelligence: what you pay vs. market benchmarks. */
export function PriceIntelligence() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("all");
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const totalSavings = owned.reduce((sum, b) => sum + benchmarkSavings(b), 0);
  const above = owned.filter((b) => benchmarkSavings(b) > 0);
  const top = [...above].sort((a, b) => benchmarkSavings(b) - benchmarkSavings(a)).slice(0, 3);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Catalog-only vendors appear only when searched for.
    const source = q ? priceBenchmarks : owned;
    return source
      .filter((b) => !q || `${b.vendor} ${b.product} ${b.category}`.toLowerCase().includes(q))
      .filter((b) => view === "all" || (view === "above" ? benchmarkSavings(b) > 0 : b.yourPrice !== null && benchmarkSavings(b) === 0))
      .sort((a, b) => benchmarkSavings(b) - benchmarkSavings(a) || (a.yourPrice === null ? 1 : 0) - (b.yourPrice === null ? 1 : 0));
  }, [query, view]);

  const negotiate = (b: PriceBenchmark) => {
    setRequested((current) => new Set(current).add(b.vendor));
    toast.show(
      b.yourPrice === null
        ? `Ramp will source a ${b.vendor} quote at or below ${formatMoneyWhole(b.median)} per ${unitName(b)}`
        : `Negotiation started. Ramp will target ${formatMoneyWhole(b.median)} per ${unitName(b)} for ${b.vendor}`,
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Vendors"
        eyebrowHref="/vendors"
        title="Price Intelligence"
        actions={
          <Button size="lg" onClick={() => toast.show("Quote uploaded. We'll benchmark it in a few minutes")}>
            Benchmark a quote
          </Button>
        }
      />
      <p className="mt-3 px-page text-[14px] text-ink-2">
        See how your software prices compare with what thousands of similar companies pay on Ramp.
      </p>

      <section className="px-page pt-10 pb-12">
        <div className="flex items-end justify-between gap-12">
          <div className="flex gap-[66px]">
            <Stat label="Potential annual savings" value={formatMoney(totalSavings)} tone="money" />
            <Stat label="Contracts benchmarked" value={owned.length} />
            <Stat label="Paying above median" value={above.length} />
          </div>
          <SearchField
            variant="underline"
            value={query}
            onChange={setQuery}
            placeholder="Search 20,000+ software vendors"
            className="w-[420px]"
          />
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6">
          {top.map((b, index) => (
            <div key={b.vendor} className="relative flex flex-col border border-line">
              {index < 2 && (
                <Tag tone="new" className="absolute -top-2.5 right-5 h-[22px] px-2.5 text-[13px]">
                  New
                </Tag>
              )}
              <div className="flex-1 px-5 pt-5 pb-5">
                <h3 className="text-[20px] leading-tight tracking-[-0.015em] text-ink">Better pricing available</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">
                  You pay {formatMoneyWhole(b.yourPrice ?? 0)} per {unitName(b)} for {b.vendor} {b.product}. Similar companies pay{" "}
                  {formatMoneyWhole(b.median)}.
                </p>
                <div className="mt-5 text-[12px] text-ink-2">Potential savings</div>
                <div className="mt-1 text-[22px] leading-tight tracking-[-0.02em] text-money tabular">
                  {formatMoney(benchmarkSavings(b))}
                  <span className="text-ink-2"> / Year</span>
                </div>
              </div>
              <div className="flex h-[60px] items-center justify-between border-t border-line px-5">
                <MerchantLogo name={b.vendor} size={30} />
                {requested.has(b.vendor) ? (
                  <Status tone="info">Negotiation requested</Status>
                ) : (
                  <Button size="sm" onClick={() => negotiate(b)}>
                    Negotiate with Ramp
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Toolbar>
        <ToolbarRow className="min-h-[50px]">
          <div className="flex items-center gap-1.5">
            {(
              [
                ["all", "All contracts", owned.length],
                ["above", "Above median", above.length],
                ["fair", "Fair price", owned.length - above.length],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] transition-colors",
                  view === value ? "bg-ink text-canvas" : "border border-line-strong bg-canvas text-ink-1 hover:bg-muted",
                )}
              >
                {label}
                <span className={cn("tabular", view === value ? "text-canvas/70" : "text-ink-3")}>{count}</span>
              </button>
            ))}
          </div>
          <span className="ml-3 hidden items-center gap-3 text-[12px] text-ink-2 xl:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-5 rounded-full bg-chart-sand" />
              25th–75th percentile
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-px bg-ink-3" />
              Median
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-ink" />
              You
            </span>
          </span>
          <div className="ml-auto flex gap-2.5">
            <IconButton label="Row density">
              <Rows3 />
            </IconButton>
            <IconButton label="Columns">
              <Columns3 />
            </IconButton>
          </div>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1180}>
        <THead>
          <tr>
            <Th className="w-[22%]">Vendor</Th>
            <Th className="w-[13%]" align="right">
              You pay
            </Th>
            <Th className="w-[26%]">
              <span className="flex items-center gap-1">
                Market range
                <Info className="size-3 stroke-[1.5]" />
              </span>
            </Th>
            <Th className="w-[10%]">Percentile</Th>
            <Th className="w-[13%]" align="right" sort="desc">
              Potential savings
            </Th>
            <Th>Action</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((b) => {
            const savings = benchmarkSavings(b);
            const pct = benchmarkPercentile(b);
            return (
              <Tr key={b.vendor} interactive={false} className="hover:bg-subtle/60">
                <Td className="h-[72px]">
                  <div className="flex items-center gap-4">
                    <MerchantLogo name={b.vendor} size={32} />
                    <CellStack primary={b.vendor} secondary={b.product} />
                  </div>
                </Td>
                <Td align="right">
                  {b.yourPrice === null ? (
                    <span className="text-ink-3">Not purchased</span>
                  ) : (
                    <CellStack
                      primary={`${formatMoney(b.yourPrice)}`}
                      secondary={b.quantity > 1 ? `per ${unitName(b)} · ${pluralize(b.quantity, unitName(b))}` : `per ${unitName(b)} · annual`}
                    />
                  )}
                </Td>
                <Td className="pr-8">
                  <PercentileBar p25={b.p25} median={b.median} p75={b.p75} value={b.yourPrice} className="pt-3" />
                </Td>
                <Td>
                  {pct === null ? (
                    <span className="text-ink-3">n/a</span>
                  ) : (
                    <CellStack
                      primary={<span className="text-[13px]">{ordinal(pct)}</span>}
                      secondary={`of ${b.sample.toLocaleString("en-US")} companies`}
                    />
                  )}
                </Td>
                <Td align="right">
                  {b.yourPrice === null ? (
                    <CellStack primary={<span className="text-[13px]">{formatMoneyWhole(b.median)}</span>} secondary={`median per ${unitName(b)}`} />
                  ) : savings > 0 ? (
                    <CellStack primary={<span className="text-money">{formatMoney(savings)}</span>} secondary="per year" />
                  ) : (
                    <span className="text-ink-3">At or below median</span>
                  )}
                </Td>
                <Td>
                  {requested.has(b.vendor) ? (
                    <Status tone="info">{b.yourPrice === null ? "Quote requested" : "Negotiation requested"}</Status>
                  ) : savings > 0 ? (
                    <Button size="xs" onClick={() => negotiate(b)}>
                      Negotiate with Ramp
                    </Button>
                  ) : b.yourPrice === null ? (
                    <Button size="xs" onClick={() => negotiate(b)}>
                      Get a quote
                    </Button>
                  ) : (
                    <Status tone="success">Fair price</Status>
                  )}
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <EmptyState
          icon={<SearchX />}
          title={`No benchmarks for "${query}"`}
          description="Upload a quote and we'll benchmark it against companies like yours."
        />
      )}

      <div className="flex-1" />
      <TableFooter
        left={<span>{pluralize(rows.length, "benchmark")}</span>}
        right={<span>{formatMoney(rows.reduce((sum, b) => sum + benchmarkSavings(b), 0))} potential savings</span>}
      />
    </div>
  );
}
