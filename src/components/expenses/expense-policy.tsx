"use client";

import { Eye, UsersRound } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { SectionHeading } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { people } from "@/data/people";
import type { PolicyRule } from "@/data/expenses";
import { cn } from "@/lib/cn";
import { useExpenses } from "./expenses-store";

const suffix: Record<NonNullable<PolicyRule["unit"]>, string | undefined> = {
  usd: undefined,
  usd_per_mile: "/ mi",
  usd_per_night: "/ night",
  days: "days",
};

function display(rule: PolicyRule) {
  if (rule.value === undefined) return "";
  return rule.unit === "usd_per_mile" ? rule.value.toFixed(2) : rule.value.toLocaleString("en-US");
}

/** Small inline limit editor that commits on blur / Enter. */
function LimitInput({ rule, onCommit }: { rule: PolicyRule; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState(display(rule));
  const money = rule.unit !== "days";

  const commit = () => {
    const next = Number(draft.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(next) || next === rule.value || draft === "") {
      setDraft(display(rule));
      return;
    }
    onCommit(next);
  };

  return (
    <label
      className={cn(
        "flex h-8 w-[132px] items-center gap-1 rounded-[2px] border bg-canvas px-2.5 text-[13px] transition-colors focus-within:border-ink-3",
        rule.enabled ? "border-line-strong text-ink hover:border-ink-5" : "border-line text-ink-4",
      )}
    >
      {money && <span className="text-ink-3">$</span>}
      <input
        value={draft}
        disabled={!rule.enabled}
        inputMode="decimal"
        aria-label={rule.title}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        className="w-full min-w-0 bg-transparent tabular outline-none disabled:cursor-not-allowed"
      />
      {rule.unit && suffix[rule.unit] && <span className="shrink-0 text-[12px] text-ink-3">{suffix[rule.unit]}</span>}
    </label>
  );
}

/** Expenses › Expense policy: editable rule rows grouped by section. */
export function ExpensePolicy() {
  const { policy, updateRule } = useExpenses();
  const toast = useToast();
  const activeRules = policy.flatMap((s) => s.rules).filter((r) => r.enabled).length;

  return (
    <div className="pb-16">
      <div className="flex items-center gap-6 border-b border-line bg-subtle px-page py-4">
        <div className="flex items-center gap-2.5 text-[13px] text-ink-2">
          <Avatar name="Tina Cruz" size={22} />
          <span>
            Last edited by <span className="text-ink-1">Tina Cruz</span> on Sep 12, 2026
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-ink-2">
          <UsersRound className="size-4 stroke-[1.5]" />
          <span>
            Applies to <span className="text-ink-1">{people.length} employees</span>
          </span>
        </div>
        <div className="text-[13px] text-ink-2">
          <span className="text-ink-1 tabular">{activeRules}</span> active rules
        </div>
        <Button
          size="sm"
          className="ml-auto gap-1.5"
          onClick={() => toast.show("Showing the policy as employees see it at submission", "neutral")}
        >
          <Eye className="size-3.5 stroke-[1.5]" />
          Preview as employee
        </Button>
      </div>

      {policy.map((section) => (
        <section key={section.id} className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 border-b border-line px-page py-9">
          <div>
            <SectionHeading size="md">{section.title}</SectionHeading>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{section.description}</p>
            <p className="mt-3 text-[12px] text-ink-3">Applies to · {section.appliesTo}</p>
          </div>
          <div className="divide-y divide-line-soft border-y border-line">
            {section.rules.map((rule) => (
              <div key={rule.id} className="flex min-h-[68px] items-center gap-6 py-3">
                <div className="min-w-0 flex-1">
                  <div className={cn("text-[14px]", rule.enabled ? "text-ink" : "text-ink-3")}>{rule.title}</div>
                  <div className="mt-0.5 text-[12px] text-ink-2">{rule.description}</div>
                </div>
                {rule.value !== undefined && (
                  <LimitInput
                    key={`${rule.id}-${rule.value}`}
                    rule={rule}
                    onCommit={(value) => {
                      updateRule(section.id, rule.id, { value });
                      toast.show(`${rule.title} updated`);
                    }}
                  />
                )}
                <Switch
                  label={rule.title}
                  checked={rule.enabled}
                  onChange={(enabled) => {
                    updateRule(section.id, rule.id, { enabled });
                    toast.show(`${rule.title} ${enabled ? "turned on" : "turned off"}`, enabled ? "success" : "neutral");
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
