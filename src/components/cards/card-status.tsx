import { Status } from "@/components/ui/badge";
import { Progress } from "@/components/ui/stat";
import { cardStatusLabels, type CardStatus } from "@/data/cards";
import { cn } from "@/lib/cn";
import { formatMoneyWhole } from "@/lib/format";

const tones = {
  active: "success",
  locked: "warning",
  not_activated: "pending",
  terminated: "neutral",
} as const satisfies Record<CardStatus, Parameters<typeof Status>[0]["tone"]>;

export function CardStatusDot({ status }: { status: CardStatus }) {
  return <Status tone={tones[status]}>{cardStatusLabels[status]}</Status>;
}

/** "$1,848 of $5,000" over a thin meter; turns orange past 90%. */
export function SpendMeter({
  spent,
  limit,
  className,
  caption,
}: {
  spent: number;
  limit: number;
  className?: string;
  caption?: string;
}) {
  const ratio = limit ? spent / limit : 0;
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-2 text-[13px] tabular">
        <span className="truncate">
          <span className="text-ink">{formatMoneyWhole(spent)}</span>
          <span className="text-ink-3"> of {formatMoneyWhole(limit)}</span>
        </span>
        {caption && <span className="shrink-0 text-[12px] text-ink-3">{caption}</span>}
      </div>
      <Progress value={spent} max={limit} tone={ratio >= 0.9 ? "warning" : "ink"} className="mt-1.5" />
    </div>
  );
}
