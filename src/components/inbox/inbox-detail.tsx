"use client";

import { Check, ChevronDown, ChevronUp, CircleAlert, FileUp, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button, IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { DetailRow } from "@/components/ui/stat";
import type { InboxItem } from "@/data/inbox";
import { currentUser, people } from "@/data/people";
import { cn } from "@/lib/cn";
import { formatDateLong, formatMoney, splitMoney } from "@/lib/format";
import { typeLabels } from "./inbox-helpers";

type Step = { label: string; who: string; state: "done" | "current" | "upcoming"; note?: string };

function approvalChain(item: InboxItem): Step[] {
  const requester = people.find((p) => p.name === item.requester);
  const manager = requester?.manager && requester.manager !== currentUser.name ? requester.manager : undefined;
  const steps: Step[] = [
    { label: item.type === "bill" ? "Bill uploaded" : "Submitted", who: item.requester, state: "done", note: formatDateLong(item.submitted) },
  ];
  if (manager) steps.push({ label: "Manager approval", who: manager, state: "done", note: "Approved" });
  steps.push({ label: "Finance approval", who: `${currentUser.name} (You)`, state: "current", note: "Waiting on you" });
  if (item.amount >= 10000) steps.push({ label: "Controller approval", who: "Tina Cruz", state: "upcoming", note: "Over $10,000" });
  steps.push({ label: item.type === "bill" ? "Payment scheduled" : item.type === "card" ? "Card issued" : "Paid out", who: "Ramp", state: "upcoming" });
  return steps;
}

/** Stylised receipt thumbnail so detail panes don't look empty. */
function ReceiptPreview({ item }: { item: InboxItem }) {
  return (
    <div className="flex gap-4 border border-line bg-subtle p-4">
      <div className="w-[118px] shrink-0 border border-line bg-canvas px-3 pt-3 pb-4 text-[7px] leading-[1.6] text-ink-3 shadow-card">
        <div className="mb-1.5 text-center text-[8px] tracking-wide text-ink-1 uppercase">{item.merchant ?? item.subject}</div>
        {[0.8, 0.6, 0.7, 0.5].map((w, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="h-[3px] rounded bg-line-strong" style={{ width: `${w * 60}%` }} />
            <span className="h-[3px] w-4 rounded bg-line-strong" />
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-dashed border-line-strong pt-1.5 text-ink-1">
          <span>TOTAL</span>
          <span className="tabular">{formatMoney(item.amount)}</span>
        </div>
      </div>
      <div className="min-w-0 py-1 text-[13px]">
        <div className="flex items-center gap-1.5 text-success-ink">
          <Check className="size-3.5 stroke-[2]" />
          Receipt matched
        </div>
        <p className="mt-1 text-[12px] text-ink-2">
          Amount, merchant and date match the {item.type === "bill" ? "invoice" : "transaction"}.
        </p>
        <button type="button" className="mt-3 text-[12px] text-ink underline decoration-ink-4 underline-offset-2 hover:decoration-ink">
          View {item.type === "bill" ? "invoice" : "receipt"}
        </button>
      </div>
    </div>
  );
}

type Props = {
  item: InboxItem;
  index: number;
  total: number;
  onMove: (delta: number) => void;
  onApprove: (item: InboxItem) => void;
  onDecline: (item: InboxItem) => void;
  onUpload: (item: InboxItem) => void;
  onRemind: (item: InboxItem) => void;
};

export function InboxDetail({ item, index, total, onMove, onApprove, onDecline, onUpload, onRemind }: Props) {
  const person = people.find((p) => p.name === item.requester);
  const [whole, cents] = splitMoney(item.amount);
  const isMissing = item.type === "missing";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-7">
        <span className="text-[13px] text-ink-2">{typeLabels[item.type]}</span>
        <div className="flex items-center gap-1 text-[12px] text-ink-3">
          <span className="mr-1 tabular">
            {index + 1} of {total}
          </span>
          <IconButton variant="bare" size="sm" label="Previous item" onClick={() => onMove(-1)} disabled={index === 0} className="disabled:opacity-40">
            <ChevronUp />
          </IconButton>
          <IconButton variant="bare" size="sm" label="Next item" onClick={() => onMove(1)} disabled={index === total - 1} className="disabled:opacity-40">
            <ChevronDown />
          </IconButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-7 pt-6 pb-6">
          <div className="flex items-center gap-3">
            <Avatar name={item.requester} size={36} />
            <div className="leading-tight">
              <div className="text-[14px] text-ink">{item.requester}</div>
              <div className="mt-0.5 text-[12px] text-ink-2">
                {person?.title ?? "Employee"} · {item.department}
              </div>
            </div>
          </div>
          <div className="mt-6 text-[40px] leading-none tracking-[-0.03em] text-ink tabular">
            {whole}
            <span className="text-[0.62em] tracking-normal">{cents}</span>
          </div>
          <p className="mt-3 text-[15px] leading-snug text-ink-1">
            {item.subject}
            {item.merchant && item.type !== "bill" && <span className="text-ink-2"> · {item.merchant}</span>}
          </p>
          {item.warning && (
            <div className="mt-4 flex items-start gap-2 bg-caution-bg px-3 py-2.5 text-[13px] text-caution">
              <CircleAlert className="mt-px size-4 shrink-0 stroke-[1.5]" />
              {item.warning}
            </div>
          )}
        </div>

        <section className="border-t border-line px-7 py-5">
          <h3 className="mb-1 text-[13px] text-ink-3">Details</h3>
          {item.merchant && (
            <DetailRow label={item.type === "bill" ? "Vendor" : "Merchant"}>
              <span className="inline-flex items-center gap-2">
                <MerchantLogo name={item.merchant} size={18} />
                {item.merchant}
              </span>
            </DetailRow>
          )}
          <DetailRow label="Purpose">{item.subject}</DetailRow>
          <DetailRow label="Category">{item.category}</DetailRow>
          {item.cardType && <DetailRow label="Card type">{item.cardType}</DetailRow>}
          {item.frequency && <DetailRow label="Limit">{`${formatMoney(item.amount)} · ${item.frequency}`}</DetailRow>}
          {item.invoice && <DetailRow label="Invoice">{item.invoice}</DetailRow>}
          <DetailRow label="Department">{item.department}</DetailRow>
          {item.policy && <DetailRow label="Policy">{item.policy}</DetailRow>}
          <DetailRow label="Submitted">{formatDateLong(item.submitted)}</DetailRow>
          {item.due && <DetailRow label="Due">{formatDateLong(item.due)}</DetailRow>}
        </section>

        {item.memo && (
          <section className="border-t border-line px-7 py-5">
            <h3 className="mb-2 text-[13px] text-ink-3">Memo</h3>
            <p className="text-[14px] leading-relaxed text-ink-1">“{item.memo}”</p>
          </section>
        )}

        {item.type !== "card" && (
          <section className="border-t border-line px-7 py-5">
            <h3 className="mb-3 text-[13px] text-ink-3">{item.type === "bill" ? "Invoice" : "Receipt"}</h3>
            {isMissing && item.missing?.includes("receipt") ? (
              <button
                type="button"
                onClick={() => onUpload(item)}
                className="flex w-full flex-col items-center justify-center border border-dashed border-line-strong bg-subtle py-7 text-center transition-colors hover:border-ink-4 hover:bg-muted"
              >
                <FileUp className="size-5 stroke-[1.5] text-ink-2" />
                <span className="mt-2 text-[13px] text-ink">Upload receipt on behalf of {item.requester.split(" ")[0]}</span>
                <span className="mt-0.5 text-[12px] text-ink-3">PDF, PNG or JPG up to 10 MB</span>
              </button>
            ) : (
              <ReceiptPreview item={item} />
            )}
          </section>
        )}

        {!isMissing && (
          <section className="border-t border-line px-7 py-5">
            <h3 className="mb-3 text-[13px] text-ink-3">Approval chain</h3>
            <ol>
              {approvalChain(item).map((step, i, all) => (
                <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < all.length - 1 && <span className="absolute top-5 bottom-0 left-[7.5px] w-px bg-line-strong" />}
                  <span
                    className={cn(
                      "relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                      step.state === "done" && "border-approve bg-approve text-canvas",
                      step.state === "current" && "border-ink bg-canvas",
                      step.state === "upcoming" && "border-line-strong bg-canvas",
                    )}
                  >
                    {step.state === "done" && <Check className="size-2.5 stroke-[3]" />}
                    {step.state === "current" && <span className="size-1.5 rounded-full bg-ink" />}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className={cn("text-[13px]", step.state === "upcoming" ? "text-ink-3" : "text-ink")}>{step.label}</div>
                    <div className="mt-0.5 text-[12px] text-ink-2">
                      {step.who}
                      {step.note && ` · ${step.note}`}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-line px-7 py-3.5">
        <IconButton label="Comment" variant="outline" className="mr-auto" onClick={() => onRemind(item)}>
          <MessageSquare />
        </IconButton>
        {isMissing ? (
          <>
            <Button onClick={() => onRemind(item)}>Send reminder</Button>
            <Button variant="primary" onClick={() => onUpload(item)}>
              {item.missing?.includes("receipt") ? "Upload receipt" : "Mark resolved"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" onClick={() => onDecline(item)}>
              Decline
            </Button>
            <Button variant="primary" onClick={() => onApprove(item)}>
              <Check className="size-4 stroke-[1.75]" />
              Approve
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
