"use client";

import { ArrowUpRight, Copy, Link2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Count, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { SplitMoney, Stat } from "@/components/ui/stat";
import { CellStack, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { copyText } from "@/components/settings/clipboard";
import { plusTravel, referralLink, referrals as seed, referralTerms, type Referral, type ReferralStatus } from "@/data/refer";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { Field, TextInput } from "@/components/ui/field";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const statusTones: Record<ReferralStatus, "success" | "info" | "neutral" | "outline"> = {
  Rewarded: "success",
  Qualified: "info",
  "Signed up": "neutral",
  Invited: "outline",
  Expired: "neutral",
};

const steps = [
  { title: "Share your link", body: "Send your referral link or invite a founder or finance lead by email." },
  {
    title: "They get started on Ramp",
    body: `They sign up and spend ${formatMoneyWhole(referralTerms.spendThreshold)} on Ramp cards within ${referralTerms.windowDays} days.`,
  },
  { title: "You both earn $500", body: "Rewards land as statement credits on both accounts within 5 business days." },
];

const filters = ["All", "Rewarded", "In progress", "Expired"] as const;

function companyFromEmail(email: string) {
  const domain = email.split("@")[1]?.split(".")[0] ?? "";
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

export function ReferEarn() {
  const toast = useToast();
  const [rows, setRows] = useState<Referral[]>(seed);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const earned = rows.filter((r) => r.status === "Rewarded").reduce((sum, r) => sum + r.reward, 0);
  const pending = rows.filter((r) => ["Qualified", "Signed up", "Invited"].includes(r.status)).reduce((sum, r) => sum + r.reward, 0);
  const travelBack = plusTravel.lastQuarterTravel * plusTravel.cashbackRate;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Rewarded" && r.status === "Rewarded") ||
        (filter === "Expired" && r.status === "Expired") ||
        (filter === "In progress" && ["Qualified", "Signed up", "Invited"].includes(r.status));
      return matchesFilter && (!q || `${r.company} ${r.contact} ${r.email}`.toLowerCase().includes(q));
    });
  }, [rows, query, filter]);

  const invite = () => {
    const value = email.trim().toLowerCase();
    if (!EMAIL.test(value)) {
      toast.show("Enter a valid work email", "danger");
      return;
    }
    setRows((current) => [
      {
        id: `r-${value}`,
        company: companyFromEmail(value),
        contact: value.split("@")[0],
        email: value,
        invited: "2026-10-02",
        status: "Invited",
        reward: referralTerms.reward,
      },
      ...current,
    ]);
    setEmail("");
    toast.show(`Invite sent to ${value}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex items-end justify-between gap-12 px-page pt-6 pb-14">
        <div className="max-w-[680px] min-w-0">
          <p className="text-[15px] text-ink-2">Refer &amp; earn</p>
          <h1 className="mt-3 text-[64px] leading-[1.02] font-normal tracking-[-0.035em] text-ink">Give $500, get $500.</h1>
          <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-ink-2">
            Know a company that should be on Ramp? When they spend {formatMoneyWhole(referralTerms.spendThreshold)} on Ramp cards in their first{" "}
            {referralTerms.windowDays} days, you both get {formatMoneyWhole(referralTerms.reward)}. No limit on referrals.
          </p>

          <div className="mt-10 space-y-5">
            <Field label="Your referral link">
              <div className="flex gap-2">
                <TextInput readOnly value={referralLink} prefix={<Link2 />} className="flex-1" inputClassName="tabular" />
                <Button
                  size="lg"
                  className="w-[132px]"
                  onClick={async () => {
                    await copyText(`https://${referralLink}`);
                    toast.show("Referral link copied to clipboard");
                  }}
                >
                  <Copy className="size-4 stroke-[1.5]" />
                  Copy link
                </Button>
              </div>
            </Field>
            <Field label="Invite by email">
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  invite();
                }}
              >
                <TextInput
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="founder@company.com"
                  className="flex-1"
                />
                <Button type="submit" size="lg" variant="primary" className="w-[132px]">
                  Send invite
                </Button>
              </form>
            </Field>
          </div>
        </div>

        <div className="w-[340px] shrink-0 border-l border-line pb-1 pl-10">
          <Stat
            label="Total earned"
            value={<SplitMoney value={earned} />}
            tone="money"
            size="xl"
            caption={`${pluralize(rows.filter((r) => r.status === "Rewarded").length, "reward")} paid as statement credit`}
          />
          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-5">
            <Stat label="Pending" value={formatMoney(pending)} size="sm" />
            <Stat label="Referrals" value={rows.length} size="sm" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line">
        <div className="flex h-11 items-center px-page text-[12px] text-ink-3">How it works</div>
        <ol className="grid grid-cols-3 border-t border-line">
          {steps.map((step, index) => (
            <li key={step.title} className={cn("py-8 pr-10", index === 0 ? "pl-page" : "border-l border-line pl-10")}>
              <span className="text-[13px] text-ink-3 tabular">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-[20px] leading-snug tracking-[-0.01em] text-ink">{step.title}</h3>
              <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-ink-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ramp Plus */}
      <section className="grid grid-cols-[minmax(0,1fr)_minmax(0,460px)] items-center gap-16 px-page py-16">
        <div>
          <Tag tone="plus">Plus</Tag>
          <h2 className="mt-4 text-[30px] leading-tight font-normal tracking-[-0.015em] text-ink">Ramp Plus: Earn 5% back on hotels and flights</h2>
          <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-ink-2">
            Book through Ramp Travel with any Ramp card and get 5% back on every flight and hotel, on top of your standard cashback. Policies,
            approvals and receipts are handled automatically.
          </p>
          <div className="mt-7 flex items-center gap-5">
            <Button onClick={() => toast.show("Ramp Travel opens in a new tab", "neutral")}>
              Book travel
              <ArrowUpRight className="size-4 stroke-[1.5]" />
            </Button>
            <Link href="/settings/billing" className="text-[14px] text-ink underline decoration-ink-4 underline-offset-2 hover:decoration-ink">
              See your Plus plan
            </Link>
          </div>
        </div>
        <div className="border border-line bg-subtle p-7">
          <Stat
            label="You’d have earned last quarter"
            value={formatMoney(travelBack)}
            tone="money"
            size="lg"
            caption={`5% of ${formatMoney(plusTravel.lastQuarterTravel)} spent on flights and hotels`}
          />
          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <span className="text-[12px] text-ink-2">Top travel merchants</span>
            <span className="flex -space-x-1.5">
              {plusTravel.partners.map((partner) => (
                <MerchantLogo key={partner} name={partner} size={28} className="ring-2 ring-subtle" />
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* Referrals */}
      <section className="pb-10">
        <div className="flex items-center gap-3 px-page pb-5">
          <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">Your referrals</h2>
          <Count value={rows.length} />
        </div>
        <Toolbar>
          <ToolbarRow>
            <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search referrals..." />
            <div className="ml-auto flex items-center gap-1.5">
              {filters.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full px-3 text-[12px] transition-colors",
                    filter === value ? "bg-chip text-ink" : "text-ink-2 hover:bg-muted hover:text-ink",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </ToolbarRow>
        </Toolbar>
        <Table className="border-t border-line" minWidth={1000}>
          <THead>
            <tr>
              <Th className="w-[34%]">Company</Th>
              <Th className="w-[16%]" sort="desc">
                Invited
              </Th>
              <Th className="w-[18%]">Status</Th>
              <Th className="w-[16%]" align="right">
                Your reward
              </Th>
              <Th />
            </tr>
          </THead>
          <TBody>
            {visible.map((r) => (
              <Tr key={r.id} interactive={false} className="hover:bg-subtle/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <MerchantLogo name={r.company} size={30} />
                    <CellStack primary={<span className="text-[13px]">{r.company}</span>} secondary={<span className="text-[11px]">{r.email}</span>} />
                  </div>
                </Td>
                <Td className="text-ink-2">{formatDate(r.invited)}</Td>
                <Td>
                  <Tag tone={statusTones[r.status]} className={cn(r.status === "Expired" && "text-ink-3")}>
                    {r.status}
                  </Tag>
                </Td>
                <Td align="right">
                  {r.status === "Rewarded" ? (
                    <span className="text-money">+{formatMoney(r.reward)}</span>
                  ) : r.status === "Expired" ? (
                    <span className="text-ink-4">—</span>
                  ) : (
                    <span className="text-ink-3">{formatMoney(r.reward)} pending</span>
                  )}
                </Td>
                <Td align="right">
                  {(r.status === "Invited" || r.status === "Signed up") && (
                    <Button size="xs" variant="ghost" className="-mr-2.5" onClick={() => toast.show(`Reminder sent to ${r.email}`)}>
                      Send reminder
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        {!visible.length && <p className="py-16 text-center text-[13px] text-ink-2">No referrals match these filters.</p>}
        <div className="flex h-10 items-center justify-end gap-2 px-page text-[12px] text-ink-2 tabular">
          <span>{pluralize(visible.length, "referral")}</span>
          <span>·</span>
          <span>{formatMoney(earned)} earned</span>
        </div>
      </section>
    </div>
  );
}
