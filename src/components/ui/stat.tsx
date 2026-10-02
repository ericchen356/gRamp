import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { splitMoney } from "@/lib/format";

type StatProps = {
  label: ReactNode;
  value: ReactNode;
  /** Muted line under the value ("Available: $900.00"). */
  caption?: ReactNode;
  info?: boolean;
  tone?: "default" | "positive" | "money" | "warning";
  size?: "sm" | "md" | "ml" | "lg" | "xl";
  className?: string;
};

const valueSizes = {
  sm: "text-[20px]",
  md: "text-[26px]",
  ml: "text-[28px]",
  lg: "text-[32px]",
  xl: "text-[52px] tracking-[-0.03em]",
};

const valueTones = {
  default: "text-ink",
  positive: "text-positive",
  money: "text-money",
  warning: "text-warning",
};

/** Label-over-value KPI ("Estimated cashback  $810.78"). */
export function Stat({ label, value, caption, info, tone = "default", size = "lg", className }: StatProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-1 text-[12px] text-ink-2">
        {label}
        {info && <Info className="size-3 stroke-[1.5] text-ink-3" />}
      </div>
      <div className={cn("mt-1 leading-[1.1] tracking-[-0.02em] tabular", valueSizes[size], valueTones[tone])}>{value}</div>
      {caption && <div className="mt-1 text-[12px] text-ink-2">{caption}</div>}
    </div>
  );
}

/** "$350,385.56" with de-emphasised cents, as used on Insights. */
export function SplitMoney({ value, className }: { value: number; className?: string }) {
  const [whole, cents] = splitMoney(value);
  return (
    <span className={className}>
      {whole}
      <span className="text-[0.62em] tracking-normal">{cents}</span>
    </span>
  );
}

export function Card({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "subtle";
}) {
  return (
    <div className={cn("border border-line", tone === "subtle" ? "bg-subtle" : "bg-canvas", className)}>{children}</div>
  );
}

/** Thin horizontal meter used for limits and budgets. */
export function Progress({
  value,
  max = 100,
  tone = "ink",
  className,
}: {
  value: number;
  max?: number;
  tone?: "ink" | "positive" | "warning" | "lime";
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-full bg-chip", className)}>
      <div
        className={cn(
          "h-full rounded-full",
          tone === "ink" && "bg-ink-1",
          tone === "positive" && "bg-positive",
          tone === "warning" && "bg-warning",
          tone === "lime" && "bg-[#c5d13a]",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Label/value row for detail panes. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line-soft py-3 text-[13px] last:border-b-0">
      <span className="shrink-0 text-ink-2">{label}</span>
      <span className="min-w-0 text-right text-ink-1">{children}</span>
    </div>
  );
}
