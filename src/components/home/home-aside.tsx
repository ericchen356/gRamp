import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Count, Status } from "@/components/ui/badge";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { SectionHeading } from "@/components/ui/page-header";
import { Sparkline } from "@/components/ui/sparkline";
import { cashback, homeTasks, upcomingBills, type UpcomingBill } from "@/data/home";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney } from "@/lib/format";

const billStatus: Record<UpcomingBill["status"], { tone: "success" | "warning" | "danger"; label: string }> = {
  scheduled: { tone: "success", label: "Scheduled" },
  approval: { tone: "warning", label: "Needs approval" },
  overdue: { tone: "danger", label: "Overdue" },
};

function AsideSection({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("border-b border-line py-7 pr-page pl-8 last:border-b-0", className)}>
      <div className="mb-4 flex items-center justify-between">
        <SectionHeading size="md">{title}</SectionHeading>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Right rail of Home: tasks, cashback and upcoming bills. */
export function HomeAside() {
  const totalTasks = homeTasks.reduce((sum, task) => sum + task.count, 0);
  return (
    <aside className="w-[400px] shrink-0 border-l border-line">
      <AsideSection
        title="Tasks for you"
        action={
          <Link href="/inbox" className="inline-flex items-center gap-1 text-[13px] text-ink-2 hover:text-ink">
            Inbox <Count value={totalTasks} tone="lime" />
          </Link>
        }
      >
        <ul className="-mx-3">
          {homeTasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/inbox?tab=${task.tab}`}
                className="group flex items-center gap-3 rounded-[2px] px-3 py-2.5 transition-colors hover:bg-subtle"
              >
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-[14px] text-ink">{task.label}</div>
                  <div className={cn("mt-0.5 truncate text-[12px]", task.urgent ? "text-warning" : "text-ink-2")}>{task.detail}</div>
                </div>
                <Count value={task.count} tone="gray" />
                <ChevronRight className="size-4 stroke-[1.5] text-ink-4 transition-colors group-hover:text-ink-2" />
              </Link>
            </li>
          ))}
        </ul>
      </AsideSection>

      <AsideSection title="Cashback earned">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[32px] leading-[1.1] tracking-[-0.02em] text-positive tabular">{formatMoney(cashback.yearToDate)}</div>
            <div className="mt-1.5 text-[12px] text-ink-2">
              2026 to date · {cashback.rate}% on card spend
            </div>
          </div>
          <Sparkline
            data={cashback.monthly.slice(0, -1)}
            width={96}
            height={34}
            stroke="var(--color-positive)"
            fill="var(--color-success-bg)"
          />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-3.5 text-[13px]">
          <span className="text-ink-2">This month so far</span>
          <span className="text-ink tabular">{formatMoney(cashback.thisMonth)}</span>
        </div>
      </AsideSection>

      <AsideSection
        title="Upcoming bills"
        action={
          <Link href="/bill-pay" className="inline-flex items-center gap-1 text-[13px] text-ink-2 hover:text-ink">
            View all
            <ArrowRight className="size-3.5 stroke-[1.5]" />
          </Link>
        }
      >
        <ul>
          {upcomingBills.map((bill) => (
            <li key={bill.id} className="flex items-center gap-3 border-b border-line-soft py-3 last:border-b-0">
              <MerchantLogo name={bill.vendor} size={28} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[14px] text-ink">{bill.vendor}</div>
                <div className="mt-1">
                  <Status tone={billStatus[bill.status].tone}>
                    <span className="text-[12px] text-ink-2">
                      {billStatus[bill.status].label} · {bill.status === "overdue" ? "was due" : "due"} {formatDate(bill.due)}
                    </span>
                  </Status>
                </div>
              </div>
              <span className="text-[14px] text-ink tabular">{formatMoney(bill.amount)}</span>
            </li>
          ))}
        </ul>
      </AsideSection>
    </aside>
  );
}
