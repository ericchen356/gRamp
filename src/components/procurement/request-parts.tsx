import { Check, X } from "lucide-react";
import { RampLogo } from "@/components/shell/ramp-logo";
import { Avatar } from "@/components/ui/avatar";
import { Status, Tag } from "@/components/ui/badge";
import {
  purchaseOrderStatusLabels,
  requestStatusLabels,
  type PurchaseOrderStatus,
  type PurchaseRequest,
  type RequestStatus,
  type TimelineEvent,
} from "@/data/procurement";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

const requestTones = {
  in_review: "info",
  approved: "success",
  needs_info: "warning",
  rejected: "danger",
  draft: "outline",
} as const satisfies Record<RequestStatus, Parameters<typeof Tag>[0]["tone"]>;

export function RequestTag({ status }: { status: RequestStatus }) {
  return <Tag tone={requestTones[status]}>{requestStatusLabels[status]}</Tag>;
}

const poTones = {
  open: "info",
  partially_received: "pending",
  closed: "success",
  draft: "neutral",
  cancelled: "danger",
} as const satisfies Record<PurchaseOrderStatus, Parameters<typeof Status>[0]["tone"]>;

export function OrderStatus({ status }: { status: PurchaseOrderStatus }) {
  return <Status tone={poTones[status]}>{purchaseOrderStatusLabels[status]}</Status>;
}

/** Segmented stage meter + "Legal review · 3 of 4". */
export function StageProgress({ request }: { request: PurchaseRequest }) {
  const total = request.stages.length;
  const done = request.status === "approved";
  const current = Math.min(request.stage, total - 1);
  const label = done ? "Complete" : request.status === "draft" ? "Not submitted" : request.stages[current];

  return (
    <div className="min-w-0">
      <div className="truncate text-[13px] text-ink-1">
        {label}
        {!done && request.status !== "draft" && (
          <span className="text-ink-3 tabular">
            {" "}
            · {current + 1} of {total}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex gap-[3px]">
        {request.stages.map((stage, index) => (
          <span
            key={stage}
            className={cn(
              "h-1 flex-1 rounded-full",
              done || index < current
                ? "bg-ink-1"
                : index === current && request.status !== "draft"
                  ? request.status === "rejected"
                    ? "bg-danger"
                    : request.status === "needs_info"
                      ? "bg-[#e5a50a]"
                      : "bg-ink-4"
                  : "bg-chip",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Vertical approval timeline with dots and connecting rules. */
export function ApprovalTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative">
      {events.map((event, index) => {
        const last = index === events.length - 1;
        return (
          <li key={`${event.title}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={cn(
                  "absolute top-6 bottom-0 left-[11px] w-px",
                  event.state === "done" ? "bg-ink-3" : "bg-line-strong",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 inline-flex size-[23px] shrink-0 items-center justify-center rounded-full",
                event.state === "done" && "bg-ink text-canvas",
                event.state === "current" && "border-[1.5px] border-ink bg-canvas",
                event.state === "upcoming" && "border border-line-strong bg-canvas",
                event.state === "rejected" && "bg-danger text-canvas",
              )}
            >
              {event.state === "done" && <Check className="size-3 stroke-[2.5]" />}
              {event.state === "rejected" && <X className="size-3 stroke-[2.5]" />}
              {event.state === "current" && <span className="size-2 rounded-full bg-ink" />}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className={cn("text-[14px]", event.state === "upcoming" ? "text-ink-3" : "text-ink")}>{event.title}</span>
                <span className="shrink-0 text-[12px] text-ink-3 tabular">
                  {event.state === "current" ? `Due ${formatDate(event.date)}` : event.state === "upcoming" ? "" : formatDate(event.date)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-2">
                {event.actor === "Ramp" ? (
                  <span className="inline-flex size-4 items-center justify-center rounded-full bg-chip">
                    <RampLogo className="size-2.5" />
                  </span>
                ) : (
                  <Avatar name={event.actor} size={16} />
                )}
                {event.actor}
                {event.state === "current" && <span className="text-ink-3">· waiting</span>}
              </div>
              {event.note && (
                <p className="mt-2 border-l-2 border-line-strong bg-subtle px-3 py-2 text-[13px] text-ink-1">{event.note}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
