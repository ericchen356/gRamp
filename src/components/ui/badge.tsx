import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CountTone = "lime" | "limeStrong" | "gray" | "outline" | "dark";

const countTones: Record<CountTone, string> = {
  lime: "bg-lime-soft text-lime-ink",
  limeStrong: "bg-lime text-ink",
  gray: "bg-chip text-ink-2",
  outline: "border border-ink-1 text-ink",
  dark: "bg-ink text-canvas",
};

/** Numeric counter pill (sidebar badges, tab counts). */
export function Count({
  value,
  tone = "gray",
  className,
}: {
  value: number | string;
  tone?: CountTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-[11px] leading-none font-medium tabular",
        countTones[tone],
        className,
      )}
    >
      {value}
    </span>
  );
}

type TagTone = "new" | "beta" | "plus" | "neutral" | "success" | "warning" | "danger" | "info" | "outline";

const tagTones: Record<TagTone, string> = {
  new: "bg-lime-bright text-ink",
  plus: "bg-lime text-ink rounded-[3px]! px-1.5",
  beta: "border border-ink-1 text-ink bg-transparent",
  neutral: "bg-muted text-ink-2",
  success: "bg-success-bg text-success-ink",
  warning: "bg-caution-bg text-caution",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  outline: "border border-line-strong text-ink-2",
};

/** Small label pill: "New", "Beta", "Plus" and status tags. */
export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: TagTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full px-2 text-[12px] leading-none whitespace-nowrap",
        tagTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type StatusTone = "success" | "warning" | "danger" | "neutral" | "info" | "pending";

const dotTones: Record<StatusTone, string> = {
  success: "bg-positive",
  warning: "bg-attention",
  danger: "bg-danger",
  neutral: "bg-ink-4",
  info: "bg-info",
  pending: "bg-pending",
};

/** Dot + label status used in tables ("Paid", "Scheduled", "Overdue"). */
export function Status({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-1">
      <span className={cn("size-1.5 rounded-full", dotTones[tone])} />
      {children}
    </span>
  );
}
