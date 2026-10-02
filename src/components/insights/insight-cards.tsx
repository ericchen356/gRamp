"use client";

import { ArrowRight, ArrowUp, CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { Tag } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { useToast } from "@/components/ui/toast";
import { insights, previousInsights, totalSavingsIdentified, type Insight } from "@/data/insights";
import { cn } from "@/lib/cn";
import { formatDateLong, formatMoney } from "@/lib/format";

const EXIT_MS = 280;

function InsightMetric({ insight }: { insight: Insight }) {
  if (insight.kind === "increase") {
    return (
      <span className="flex items-center gap-1 text-warning">
        <ArrowUp className="size-[22px] stroke-[1.5]" />
        {insight.metric}%
      </span>
    );
  }
  return (
    <span>
      <span className="text-positive">{formatMoney(insight.metric)}</span>
      <span className="text-ink-2"> / Year</span>
    </span>
  );
}

function InsightCard({
  insight,
  leaving,
  onResolve,
}: {
  insight: Insight;
  leaving: boolean;
  onResolve: (insight: Insight, outcome: "accepted" | "dismissed") => void;
}) {
  return (
    <article
      className={cn(
        "relative flex min-h-[286px] flex-col border border-line bg-canvas transition-[opacity,transform] ease-out",
        leaving && "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
      )}
      style={{ transitionDuration: `${EXIT_MS}ms` }}
    >
      {insight.isNew && (
        <Tag tone="new" className="absolute -top-3 right-3 h-6 px-2.5 text-[13px]">
          New
        </Tag>
      )}
      <div className="flex flex-1 flex-col px-[17px] pt-[19px] pb-[22px]">
        <h3 className="text-[22px] leading-[1.25] tracking-[-0.01em] text-ink">{insight.title}</h3>
        <p className="mt-3 text-[15px] leading-[1.45] text-ink-2">{insight.description}</p>
        <div className="mt-auto pt-5">
          <div className="text-[13px] text-ink-2">{insight.metricLabel}</div>
          <div className="mt-1 text-[24px] leading-tight tracking-[-0.015em] tabular">
            <InsightMetric insight={insight} />
          </div>
        </div>
      </div>
      <footer className="flex h-[70px] items-center justify-between border-t border-line px-[17px]">
        <span title={insight.merchant}>
          <MerchantLogo name={insight.merchant} size={34} />
        </span>
        <div className="flex items-center gap-[18px]">
          <button
            type="button"
            aria-label={`Dismiss ${insight.title.toLowerCase()} insight`}
            title="Dismiss"
            onClick={() => onResolve(insight, "dismissed")}
            className="rounded-full p-1 text-warning transition-colors hover:bg-danger-bg"
          >
            <CircleX className="size-[18px] stroke-[1.5]" />
          </button>
          <button
            type="button"
            aria-label={`Accept ${insight.title.toLowerCase()} insight`}
            title="Accept"
            onClick={() => onResolve(insight, "accepted")}
            className="rounded-full p-1 text-positive transition-colors hover:bg-success-bg"
          >
            <CircleCheck className="size-[18px] stroke-[1.5]" />
          </button>
        </div>
      </footer>
    </article>
  );
}

function PreviousInsightsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const saved = previousInsights.reduce((sum, item) => sum + (item.savings ?? 0), 0);
  return (
    <Drawer open={open} onClose={onClose} title="Previous Insights">
      <div className="px-6 pt-6 pb-5">
        <div className="text-[12px] text-ink-2">Savings captured in 2026</div>
        <div className="mt-1 text-[32px] leading-[1.1] tracking-[-0.02em] text-positive tabular">{formatMoney(saved)}</div>
        <p className="mt-2 text-[13px] text-ink-2">
          {previousInsights.filter((i) => i.outcome === "accepted").length} insights accepted ·{" "}
          {previousInsights.filter((i) => i.outcome === "dismissed").length} dismissed
        </p>
      </div>
      <ul className="border-t border-line">
        {previousInsights.map((item) => (
          <li key={item.id} className="flex items-center gap-3.5 border-b border-line-soft px-6 py-3.5">
            <MerchantLogo name={item.merchant} size={30} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[14px] text-ink">{item.title}</div>
              <div className="mt-0.5 truncate text-[12px] text-ink-2">
                {item.merchant} · {item.detail}
              </div>
            </div>
            <div className="shrink-0 text-right leading-tight">
              <div className={cn("text-[13px] tabular", item.savings ? "text-positive" : "text-ink-3")}>
                {item.savings ? `${formatMoney(item.savings)} / yr` : "Dismissed"}
              </div>
              <div className="mt-0.5 text-[12px] text-ink-3">{formatDateLong(item.date)}</div>
            </div>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

/** Row of actionable insight cards plus the "Total Savings Identified" summary tile. */
export function InsightCards() {
  const toast = useToast();
  const [items, setItems] = useState(insights);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const resolve = (insight: Insight, outcome: "accepted" | "dismissed") => {
    setLeaving((current) => new Set(current).add(insight.id));
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== insight.id));
      setLeaving((current) => {
        const next = new Set(current);
        next.delete(insight.id);
        return next;
      });
    }, EXIT_MS);
    toast.show(outcome === "accepted" ? insight.acceptMessage : `Insight dismissed: ${insight.title}`, outcome === "accepted" ? "success" : "neutral");
  };

  return (
    <section className="px-page pt-[46px] pb-[44px]">
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.59fr)] gap-[18px]">
        {items.map((insight) => (
          <InsightCard key={insight.id} insight={insight} leaving={leaving.has(insight.id)} onResolve={resolve} />
        ))}
        {items.length === 0 && (
          <div className="col-span-3 flex min-h-[286px] flex-col items-center justify-center border border-dashed border-line-strong text-center">
            <CircleCheck className="size-7 stroke-[1.25] text-ink-4" />
            <p className="mt-3 text-[16px] text-ink">You’re all caught up</p>
            <p className="mt-1 text-[13px] text-ink-2">We’ll surface new savings opportunities as your spend changes.</p>
          </div>
        )}
        {items.length > 0 &&
          Array.from({ length: 3 - items.length }, (_, index) => <div key={`spacer-${index}`} aria-hidden />)}
        <aside className="flex min-h-[286px] flex-col border border-line bg-subtle px-[17px] pt-[23px] pb-[26px]">
          <div className="text-[13px] text-ink-2">Total Savings Identified</div>
          <div className="mt-1.5 text-[24px] leading-tight tracking-[-0.015em] text-ink tabular">
            {formatMoney(totalSavingsIdentified)}
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mt-auto flex h-[35px] w-full items-center justify-between rounded-[2px] border border-line-strong bg-canvas px-3 text-[14px] text-ink transition-colors hover:border-ink-5 hover:bg-subtle"
          >
            Previous Insights
            <ArrowRight className="size-4 stroke-[1.5]" />
          </button>
        </aside>
      </div>
      <PreviousInsightsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
