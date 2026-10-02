"use client";

import { ArrowRight, ChartColumn, ChartSpline } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { SectionHeading } from "@/components/ui/page-header";
import { Progress, SplitMoney, Stat } from "@/components/ui/stat";
import { Sparkline } from "@/components/ui/sparkline";
import { CellStack, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SpendChart, SpendLegend } from "@/components/insights/spend-chart";
import { businessAccount, creditLine } from "@/data/home";
import { spendSeries, thisMonthSpend } from "@/data/insights";
import { transactions } from "@/data/transactions";
import { formatDate, formatMoney } from "@/lib/format";

function SectionLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[13px] text-ink-2 transition-colors hover:text-ink">
      {children}
      <ArrowRight className="size-3.5 stroke-[1.5]" />
    </Link>
  );
}

/** Balances, spend chart and recent card activity (left column of Home). */
export function HomeOverview() {
  const toast = useToast();
  const [mode, setMode] = useState<"line" | "bar">("line");
  const series = useMemo(() => spendSeries("November"), []);
  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount).slice(0, 7),
    [],
  );
  const lastMonthToDate = series.filter((d) => d.current !== undefined).reduce((sum, d) => sum + d.previous, 0);
  const pace = Math.round(((thisMonthSpend - lastMonthToDate) / lastMonthToDate) * 100);

  return (
    <div className="min-w-0 flex-1">
      <section className="px-page pt-10">
        <div className="flex flex-wrap items-start gap-x-16 gap-y-8">
          <div>
            <Stat
              label="Business account"
              info
              size="lg"
              value={<SplitMoney value={businessAccount.balance} />}
              caption={`Available: ${formatMoney(businessAccount.available)}`}
            />
            <Sparkline data={businessAccount.trend} width={176} height={30} className="mt-3" />
          </div>
          <div className="w-[240px]">
            <Stat
              label="Available credit"
              info
              size="lg"
              value={<SplitMoney value={creditLine.limit - creditLine.used} />}
              caption={`${formatMoney(creditLine.used)} used of ${formatMoney(creditLine.limit)} limit`}
            />
            <Progress value={creditLine.used} max={creditLine.limit} className="mt-3" />
          </div>
          <Stat
            label="Spend this month"
            size="lg"
            value={<SplitMoney value={thisMonthSpend} />}
            caption={
              <span>
                <span className={pace > 0 ? "text-warning" : "text-positive"}>
                  {pace > 0 ? "↑" : "↓"} {Math.abs(pace)}%
                </span>{" "}
                vs. same point last month
              </span>
            }
          />
        </div>
      </section>

      <section className="px-page pt-12">
        <div className="flex items-center justify-between">
          <SectionHeading size="md">Spend this month</SectionHeading>
          <div className="flex items-center gap-6">
            <SpendLegend month="This month" previousMonth="Last month" />
            <Segmented
              className="gap-2"
              value={mode}
              onChange={setMode}
              options={[
                { value: "line", label: <ChartSpline aria-label="Line chart" /> },
                { value: "bar", label: <ChartColumn aria-label="Bar chart" /> },
              ]}
            />
          </div>
        </div>
        <div className="mt-4">
          <SpendChart data={series} mode={mode} month="Nov" previousMonth="Oct" height={260} />
        </div>
      </section>

      <section className="pt-12 pb-10">
        <div className="flex items-center justify-between px-page pb-4">
          <SectionHeading size="md">Recent transactions</SectionHeading>
          <SectionLink href="/accounting/ramp-card">View all</SectionLink>
        </div>
        <Table className="border-t border-line">
          <THead>
            <tr>
              <Th className="w-[38%]">Merchant</Th>
              <Th>Cardholder</Th>
              <Th className="w-[110px]">Date</Th>
              <Th className="w-[140px]" align="right">
                Amount
              </Th>
            </tr>
          </THead>
          <TBody>
            {recent.map((t) => (
              <Tr key={t.id} onClick={() => toast.show(`${t.merchant} · ${formatMoney(t.amount)} · ${t.glAccount}`, "neutral")}>
                <Td className="h-[54px]">
                  <div className="flex items-center gap-3">
                    <MerchantLogo name={t.merchant} size={28} />
                    <CellStack primary={<span className="text-[13px]">{t.merchant}</span>} secondary={t.category} />
                  </div>
                </Td>
                <Td>
                  <CellStack primary={<span className="text-[13px]">{t.cardholder}</span>} secondary={`•• ${t.cardLast4}`} />
                </Td>
                <Td className="text-ink-2">{formatDate(t.date)}</Td>
                <Td align="right" className="text-ink">
                  {formatMoney(t.amount)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
