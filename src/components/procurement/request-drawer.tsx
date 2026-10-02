"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { DetailRow } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { TODAY } from "@/components/ui/data-toolbar";
import { currentUser, people } from "@/data/people";
import type { PurchaseRequest, TimelineEvent } from "@/data/procurement";
import { formatDateLong, formatMoney } from "@/lib/format";
import { useProcurement } from "./procurement-store";
import { ApprovalTimeline, RequestTag } from "./request-parts";

/** Request detail sheet: summary, details and the approval timeline. */
export function RequestDrawer({ request: r, onClose }: { request: PurchaseRequest | null; onClose: () => void }) {
  const { updateRequest, orders, addOrder } = useProcurement();
  const toast = useToast();

  const currentIndex = r ? r.timeline.findIndex((e) => e.state === "current") : -1;
  const current = r && currentIndex >= 0 ? r.timeline[currentIndex] : undefined;
  const actionable = !!r && (r.status === "in_review" || r.status === "needs_info") && !!current;

  const approve = () => {
    if (!r || !current) return;
    const timeline: TimelineEvent[] = r.timeline.map((event, index) =>
      index === currentIndex
        ? { ...event, state: "done", date: TODAY, actor: event.actor }
        : index === currentIndex + 1
          ? { ...event, state: "current" }
          : event,
    );
    const finished = currentIndex === r.timeline.length - 1;
    if (finished) {
      const po = `PO-${1049 + orders.length - 10}`;
      timeline.push({ title: `${po} issued`, actor: "Ramp", date: TODAY, state: "done" });
      addOrder({
        id: po,
        vendor: r.vendor,
        description: r.title,
        owner: r.requester,
        amount: r.amount,
        received: 0,
        billed: 0,
        issued: TODAY,
        status: "open",
        request: r.id,
        lines: 1,
      });
    }
    updateRequest(r.id, {
      timeline,
      stage: r.stage + 1,
      status: finished ? "approved" : "in_review",
    });
    toast.show(finished ? `${r.title} approved · purchase order created` : `${current.title} approved`);
  };

  const reject = () => {
    if (!r || !current) return;
    updateRequest(r.id, {
      status: "rejected",
      timeline: r.timeline
        .slice(0, currentIndex + 1)
        .map((event, index) => (index === currentIndex ? { ...event, state: "rejected", actor: currentUser.name, date: TODAY } : event)),
    });
    toast.show(`${r.title} rejected`, "neutral");
  };

  const requester = r ? people.find((p) => p.name === r.requester) : undefined;

  return (
    <Drawer open={!!r} onClose={onClose} title={r ? `Request ${r.id}` : "Request"} className="max-w-[560px]">
      {r && (
        <div className="px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[22px] leading-tight tracking-[-0.015em] text-ink">{r.title}</h2>
            <RequestTag status={r.status} />
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{r.description}</p>

          <div className="mt-6 flex items-center gap-3 border-y border-line py-4">
            <MerchantLogo name={r.vendor} size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] text-ink">{r.vendor}</div>
              <div className="text-[12px] text-ink-2">
                {r.type} · {r.term}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[24px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(r.amount)}</div>
              <div className="mt-1 text-[12px] text-ink-3">Total contract value</div>
            </div>
          </div>

          <div className="mt-2">
            <DetailRow label="Requester">
              <span className="inline-flex items-center gap-2">
                <Avatar name={r.requester} size={20} />
                {r.requester}
                {requester && <span className="text-ink-3">· {requester.title}</span>}
              </span>
            </DetailRow>
            <DetailRow label="Department">{r.department}</DetailRow>
            <DetailRow label="Submitted">{formatDateLong(r.submitted)}</DetailRow>
            <DetailRow label="Decision needed by">{formatDateLong(r.due)}</DetailRow>
          </div>

          <h3 className="mt-7 mb-4 text-[13px] text-ink">Approval timeline</h3>
          <ApprovalTimeline events={r.timeline} />

          <div className="mt-8 flex gap-2 border-t border-line pt-5">
            {actionable && current ? (
              <>
                <Button variant="primary" onClick={approve}>
                  {current.actor === currentUser.name ? "Approve" : `Approve for ${current.actor.split(" ")[0]}`}
                </Button>
                {current.actor !== currentUser.name && (
                  <Button onClick={() => toast.show(`Reminder sent to ${current.actor}`)}>Remind {current.actor.split(" ")[0]}</Button>
                )}
                <Button variant="danger" onClick={reject}>
                  Reject
                </Button>
              </>
            ) : r.status === "draft" ? (
              <Button
                variant="primary"
                onClick={() => {
                  updateRequest(r.id, {
                    status: "in_review",
                    timeline: [
                      { ...r.timeline[0], title: "Request submitted", state: "done" },
                      ...r.stages.map((stage, index): TimelineEvent => ({
                        title: stage,
                        actor: index === r.stages.length - 1 ? "Alexander Bass" : "Tina Cruz",
                        date: r.due,
                        state: index === 0 ? "current" : "upcoming",
                      })),
                    ],
                  });
                  toast.show(`${r.title} submitted for approval`);
                }}
              >
                Submit for approval
              </Button>
            ) : (
              <Button onClick={() => toast.show("Request link copied", "neutral")}>Copy link</Button>
            )}
            <Button variant="ghost" className="ml-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
