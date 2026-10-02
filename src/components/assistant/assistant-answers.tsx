import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { Progress } from "@/components/ui/stat";
import { cashback } from "@/data/home";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export type Answer = {
  text: ReactNode;
  block?: ReactNode;
  sources: string;
};

export const suggestions = [
  "What did we spend on software last month?",
  "Which cards are close to their limits?",
  "Show travel spend by department",
  "Are there any duplicate subscriptions?",
  "How much cashback have we earned this year?",
];

/** Bordered mini table used inside answers. */
function MiniTable({ head, rows, align }: { head: string[]; rows: ReactNode[][]; align?: ("left" | "right")[] }) {
  return (
    <table className="w-full border-collapse text-left text-[13px]">
      <thead>
        <tr className="border-b border-line">
          {head.map((h, i) => (
            <th key={h} className={cn("h-8 px-3.5 font-normal text-[12px] text-ink-3", align?.[i] === "right" && "text-right")}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r} className="border-b border-line-soft last:border-b-0">
            {row.map((cell, i) => (
              <td key={i} className={cn("h-11 px-3.5 text-ink-1", align?.[i] === "right" && "text-right tabular")}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Merchant({ name, sub }: { name: string; sub?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <MerchantLogo name={name} size={22} />
      <span className="leading-tight">
        <span className="block text-ink">{name}</span>
        {sub && <span className="block text-[11px] text-ink-2">{sub}</span>}
      </span>
    </span>
  );
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-ink-3">—</span>;
  return <span className={value > 0 ? "text-warning" : "text-positive"}>{value > 0 ? "↑" : "↓"} {Math.abs(value)}%</span>;
}

const software = [
  { name: "Salesforce", spend: 37500, change: 9, seats: "75 seats" },
  { name: "Datadog", spend: 18310.45, change: 4, seats: "Usage-based" },
  { name: "Zendesk, Inc.", spend: 14820, change: 29, seats: "38 agents" },
  { name: "HubSpot", spend: 9800, change: 0, seats: "Marketing Hub Pro" },
  { name: "Slack", spend: 8750, change: -3, seats: "142 seats" },
];

const cardsNearLimit = [
  { holder: "Hannah Okafor", card: "AWS infrastructure", spent: 7980, limit: 8000 },
  { holder: "Marcus Hale", card: "Paid social", spent: 9120, limit: 10000 },
  { holder: "Jordan Lee", card: "Travel — Sales", spent: 4310, limit: 5000 },
  { holder: "Alexander Bass", card: "Software subscriptions", spent: 1922, limit: 2500 },
];

const travelByDept = [
  { dept: "Sales", amount: 21480.32 },
  { dept: "Marketing", amount: 9210.4 },
  { dept: "Engineering", amount: 5122.18 },
  { dept: "Operations", amount: 3640.02 },
  { dept: "Finance", amount: 1424.2 },
  { dept: "People", amount: 1000 },
];

const monthNames = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function answerFor(question: string): Answer {
  const q = question.toLowerCase();

  if (q.includes("software") || q.includes("saas")) {
    return {
      text: (
        <>
          You spent <strong className="font-normal text-ink">{formatMoney(118402.77)}</strong> on software in September across 38 vendors, up 6% from
          August. Your top five vendors make up 75% of it — Zendesk grew fastest at 29%, which is already flagged in{" "}
          <Link href="/insights" className="underline decoration-ink-4 underline-offset-2 hover:decoration-ink">Insights</Link>.
        </>
      ),
      block: (
        <MiniTable
          head={["Vendor", "September", "vs. Aug"]}
          align={["left", "right", "right"]}
          rows={software.map((s) => [<Merchant key={s.name} name={s.name} sub={s.seats} />, formatMoney(s.spend), <Delta key="d" value={s.change} />])}
        />
      ),
      sources: "Based on 112 card transactions and 9 bills · Sep 1–30, 2026",
    };
  }

  if (q.includes("limit") || q.includes("cards")) {
    return {
      text: "Four cards are above 75% of their limit this period. Hannah’s AWS card will decline the next charge unless the limit is raised — there’s a pending request for it in your Inbox.",
      block: (
        <MiniTable
          head={["Card", "Used", "Spent / limit"]}
          align={["left", "left", "right"]}
          rows={cardsNearLimit.map((c) => [
            <span key="c" className="flex items-center gap-2.5">
              <Avatar name={c.holder} size={22} />
              <span className="leading-tight">
                <span className="block text-ink">{c.card}</span>
                <span className="block text-[11px] text-ink-2">{c.holder}</span>
              </span>
            </span>,
            <span key="p" className="flex items-center gap-2">
              <Progress value={c.spent} max={c.limit} tone={c.spent / c.limit > 0.9 ? "warning" : "ink"} className="w-24" />
              <span className="text-[12px] text-ink-2 tabular">{Math.round((c.spent / c.limit) * 100)}%</span>
            </span>,
            `${formatMoney(c.spent)} / ${formatMoney(c.limit)}`,
          ])}
        />
      ),
      sources: "Based on 214 active cards · Current limit period",
    };
  }

  if (q.includes("travel")) {
    const max = Math.max(...travelByDept.map((d) => d.amount));
    const total = travelByDept.reduce((sum, d) => sum + d.amount, 0);
    return {
      text: (
        <>
          Travel came to <strong className="font-normal text-ink">{formatMoney(total)}</strong> in September. Sales accounts for just over half, driven by
          SaaStr Annual and three customer onsites in Chicago.
        </>
      ),
      block: (
        <div className="space-y-2.5 px-4 py-4">
          {travelByDept.map((d) => (
            <div key={d.dept} className="grid grid-cols-[96px_1fr_92px] items-center gap-3 text-[13px]">
              <span className="text-ink-1">{d.dept}</span>
              <span className="h-[18px] bg-muted">
                <span className="block h-full rounded-r-[2px] bg-chart-plum" style={{ width: `${(d.amount / max) * 100}%` }} />
              </span>
              <span className="text-right text-ink tabular">{formatMoney(d.amount)}</span>
            </div>
          ))}
        </div>
      ),
      sources: "Airlines, lodging, rideshare and car rental · Sep 1–30, 2026",
    };
  }

  if (q.includes("duplicate") || q.includes("subscription")) {
    return {
      text: "Yes — I found two overlapping subscriptions that together cost about $3,050 a year more than they need to.",
      block: (
        <MiniTable
          head={["Subscription", "Paid by", "Potential savings"]}
          align={["left", "left", "right"]}
          rows={[
            [<Merchant key="m" name="Microsoft Office" sub="3 personal plans" />, "Ava Thompson, Liam Novak +1", <span key="s" className="text-positive">{formatMoney(310)} / yr</span>],
            [<Merchant key="z" name="Zoom" sub="2 Business plans" />, "Sales, Marketing", <span key="s" className="text-positive">{formatMoney(2740)} / yr</span>],
          ]}
        />
      ),
      sources: "Matched across 1,904 recurring charges · Last 90 days",
    };
  }

  if (q.includes("cashback") || q.includes("rewards")) {
    const max = Math.max(...cashback.monthly);
    return {
      text: (
        <>
          You’ve earned <strong className="font-normal text-positive">{formatMoney(cashback.yearToDate)}</strong> in cashback so far in 2026 at a{" "}
          {cashback.rate}% rate — on track for roughly $108,000 this year.
        </>
      ),
      block: (
        <div className="flex h-[132px] items-end gap-2 px-4 pt-4 pb-3">
          {cashback.monthly.map((value, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn("w-full rounded-t-[2px]", i === cashback.monthly.length - 1 ? "bg-positive/35" : "bg-positive")}
                style={{ height: `${(value / max) * 88}px` }}
              />
              <span className="text-[11px] text-ink-3">{monthNames[i]}</span>
            </div>
          ))}
        </div>
      ),
      sources: "Statement credits posted to the business account · Jan–Nov 2026",
    };
  }

  return {
    text: (
      <>
        I can answer questions about spend, cards, bills, reimbursements and policy across Efficient App. For a quick read: month-to-date spend is{" "}
        <strong className="font-normal text-ink">{formatMoney(350385.56)}</strong>, there are 58 approvals waiting in your{" "}
        <Link href="/inbox" className="underline decoration-ink-4 underline-offset-2 hover:decoration-ink">Inbox</Link>, and 2 insights could save{" "}
        {formatMoney(2655)} a year.
      </>
    ),
    sources: "Company overview · Updated a few seconds ago",
  };
}
