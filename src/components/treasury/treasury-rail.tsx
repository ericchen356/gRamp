"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { automations } from "@/data/treasury";

const railAutomations = automations.filter((automation) => automation.enabled).concat(automations.filter((a) => !a.enabled)).slice(0, 4);

/** Right-hand rail of Cash & Treasury › Overview: automations and a promo card. */
export function TreasuryRail() {
  const toast = useToast();
  return (
    <aside className="w-[380px] shrink-0 border-l border-line pt-[52px] pr-page pb-16 pl-[38px] max-xl:w-[340px]">
      <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">Automated transfers</h2>
      <ul className="mt-[18px] flex flex-col gap-[15px]">
        {railAutomations.map((automation) => (
          <li key={automation.id}>
            <Link href="/treasury/automations" className="group block leading-tight">
              <span className="block text-[14px] text-ink-1 capitalize group-hover:text-ink">{automation.kind}</span>
              <span className="mt-1 flex items-center gap-1 truncate text-[12px] text-ink-3">
                {automation.from}
                <ArrowRight className="size-3 shrink-0 stroke-[1.75]" />
                {automation.to}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/treasury/automations"
        className="mt-[22px] flex h-[30px] items-center justify-between border border-line px-3 text-[12px] text-ink-3 hover:border-line-strong hover:text-ink-1"
      >
        <span>{automations.length} automations</span>
        <span className="text-ink-2">View all</span>
      </Link>

      <h2 className="mt-[52px] text-[18px] leading-snug tracking-[-0.01em] text-ink">For you</h2>
      <div className="mt-[18px] bg-muted px-[22px] pt-5 pb-[22px]">
        <h3 className="text-[15px] leading-snug text-ink">Open a managed payments account</h3>
        <p className="mt-2.5 text-[13px] leading-[1.5] text-ink-2">
          Pay payroll, rent, and recurring bills straight from your Business Account, with approval on every payment.
        </p>
        <Button
          size="sm"
          className="mt-5 h-[34px] border-transparent px-4 hover:border-line-strong"
          onClick={() => toast.show("Application started for a managed payments account", "neutral")}
        >
          Apply
        </Button>
      </div>
    </aside>
  );
}
