"use client";

import { Check, Clock3 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { Select } from "@/components/ui/select";
import { DetailRow } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { TODAY, arrivalFor, isOverdue, payFromAccount, remittanceFor, type Bill } from "@/data/bills";
import { daysFromToday, findVendorByName } from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatDate, formatDateLong, formatMoney, pluralize } from "@/lib/format";
import { BillStatus } from "./bill-status";
import { useBills } from "./bills-store";
import { InvoicePreview } from "./invoice-preview";

function addDays(iso: string, days: number) {
  return new Date(new Date(`${iso}T12:00:00`).getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

/** Business days needed for the payment to land by the due date. */
const leadDays = { ACH: 3, Wire: 0, Check: 7, Card: 0 } as const;

function scheduleOptions(bill: Bill) {
  const onTime = addDays(bill.dueDate, -leadDays[bill.method]);
  const options = [
    { value: TODAY, label: `Today, ${formatDate(TODAY)}`, description: "Fastest" },
    { value: addDays(TODAY, 1), label: `Tomorrow, ${formatDate(addDays(TODAY, 1))}` },
  ];
  if (onTime > addDays(TODAY, 1)) options.push({ value: onTime, label: `${formatDate(onTime)}`, description: "Arrives by due date" });
  if (bill.scheduledFor && !options.some((o) => o.value === bill.scheduledFor)) {
    options.push({ value: bill.scheduledFor, label: formatDate(bill.scheduledFor), description: "Scheduled" });
  }
  return options;
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-t border-line px-6 py-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[13px] text-ink">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Bill detail sheet: invoice preview on the left, payment + approvals on the right. */
export function BillDrawer({ bill, onClose }: { bill: Bill | null; onClose: () => void }) {
  return (
    <Drawer
      open={!!bill}
      onClose={onClose}
      className="max-w-[1000px]"
      title={bill ? <span>{bill.vendor} <span className="text-ink-3">· {bill.invoiceNumber}</span></span> : null}
    >
      {bill && <BillDetail key={bill.id} bill={bill} onClose={onClose} />}
    </Drawer>
  );
}

function BillDetail({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const { approve, reject, pay, schedule, submit, remove } = useBills();
  const toast = useToast();
  const options = scheduleOptions(bill);
  // Default to the latest date that still lands on time, or today when already late.
  const [payOn, setPayOn] = useState(bill.scheduledFor ?? (options.length > 2 ? options[2].value : TODAY));
  const vendor = findVendorByName(bill.vendor);
  const days = daysFromToday(bill.dueDate);
  const overdue = isOverdue(bill);

  const done = (message: string) => {
    toast.show(message);
    onClose();
  };

  return (
    <div className="grid min-h-full grid-cols-[minmax(0,1fr)_420px]">
      <div className="border-r border-line bg-subtle px-8 py-6">
        <InvoicePreview bill={bill} />
      </div>

      <div className="flex flex-col">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <MerchantLogo name={bill.vendor} size={36} />
            <div className="min-w-0 flex-1 leading-tight">
              {vendor ? (
                <Link href={`/vendors/v/${vendor.id}`} className="block truncate text-[15px] text-ink hover:underline">
                  {bill.vendor}
                </Link>
              ) : (
                <div className="truncate text-[15px] text-ink">{bill.vendor}</div>
              )}
              <div className="mt-0.5 text-[12px] text-ink-2">
                {vendor?.category ?? "New vendor"} · {bill.department}
              </div>
            </div>
            <BillStatus bill={bill} />
          </div>
          <div className="mt-6 text-[36px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(bill.amount)}</div>
          <div className={cn("mt-2 text-[13px]", overdue ? "text-warning" : "text-ink-2")}>
            Due {formatDateLong(bill.dueDate)} ·{" "}
            {bill.stage === "paid"
              ? `Paid ${bill.paidOn ? formatDateLong(bill.paidOn) : ""}`
              : overdue
                ? `${pluralize(-days, "day")} overdue`
                : days === 0
                  ? "due today"
                  : `in ${pluralize(days, "day")}`}
          </div>
          {bill.missing?.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-2">
              Missing:
              {bill.missing.map((field) => (
                <Tag key={field} tone="warning">
                  {field}
                </Tag>
              ))}
            </div>
          ) : null}
        </div>

        <Section title="Payment">
          <DetailRow label="Method">{bill.method === "Card" ? "Vendor card" : bill.method}</DetailRow>
          <DetailRow label="Pay from">
            {payFromAccount.name} ···· {payFromAccount.last4}
          </DetailRow>
          <DetailRow label="Pay to">{remittanceFor(bill)}</DetailRow>
          {bill.stage === "payment" ? (
            <div className="border-b border-line-soft py-3">
              <div className="mb-1.5 text-[13px] text-ink-2">Payment date</div>
              <Select variant="field" label="Payment date" value={payOn} options={options} onChange={setPayOn} placeholder="Choose a date" />
              <p className="mt-1.5 text-[12px] text-ink-3">
                Estimated arrival: {arrivalFor(bill.method)} after initiation
              </p>
            </div>
          ) : (
            <DetailRow label="Arrival">{arrivalFor(bill.method)}</DetailRow>
          )}
        </Section>

        <Section
          title="Approvals"
          aside={
            bill.approvers.length ? (
              <span className="text-[12px] text-ink-3">
                {bill.approvers.filter((a) => a.state === "approved").length} of {bill.approvers.length} approved
              </span>
            ) : undefined
          }
        >
          {bill.approvers.length ? (
            <ol className="mt-2">
              {bill.approvers.map((approver, index) => (
                <li key={approver.name} className="relative flex items-center gap-3 py-2">
                  {index < bill.approvers.length - 1 && <span className="absolute top-[38px] left-[13px] h-[calc(100%-28px)] w-px bg-line" />}
                  <span className="relative">
                    <Avatar name={approver.name} size={28} />
                    {approver.state === "approved" && (
                      <span className="absolute -right-0.5 -bottom-0.5 inline-flex size-3.5 items-center justify-center rounded-full bg-positive ring-2 ring-canvas">
                        <Check className="size-2 stroke-[3] text-canvas" />
                      </span>
                    )}
                    {approver.state === "pending" && (
                      <span className="absolute -right-0.5 -bottom-0.5 inline-flex size-3.5 items-center justify-center rounded-full bg-caution ring-2 ring-canvas">
                        <Clock3 className="size-2 stroke-[3] text-canvas" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[13px] text-ink">{approver.name}</span>
                    <span className="block text-[12px] text-ink-2">
                      {approver.state === "approved" ? "Approved" : approver.state === "pending" ? "Waiting for approval" : "Up next"}
                    </span>
                  </span>
                  {approver.state === "pending" && bill.stage === "approval" && (
                    <Button size="xs" variant="ghost" onClick={() => toast.show(`Reminder sent to ${approver.name}`)}>
                      Remind
                    </Button>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-2 text-[13px] text-ink-3">Approvers are assigned when the bill is submitted.</p>
          )}
        </Section>

        <Section title="Accounting">
          <DetailRow label="GL account">{bill.glAccount ?? <span className="text-warning">Not set</span>}</DetailRow>
          <DetailRow label="Department">{bill.department}</DetailRow>
          <DetailRow label="Submitted by">{bill.submittedBy}</DetailRow>
          {bill.memo && <DetailRow label="Memo">{bill.memo}</DetailRow>}
        </Section>

        <div className="sticky bottom-0 mt-auto flex items-center gap-2 border-t border-line bg-canvas px-6 py-4">
          {bill.stage === "payment" && (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  if (payOn === TODAY) {
                    pay([bill.id]);
                    done(`Payment of ${formatMoney(bill.amount)} to ${bill.vendor} initiated`);
                  } else {
                    schedule(bill.id, payOn);
                    done(`Payment to ${bill.vendor} scheduled for ${formatDateLong(payOn)}`);
                  }
                }}
              >
                {payOn === TODAY ? "Pay now" : "Schedule payment"}
              </Button>
              {payOn !== TODAY && (
                <Button
                  onClick={() => {
                    pay([bill.id]);
                    done(`Payment of ${formatMoney(bill.amount)} to ${bill.vendor} initiated`);
                  }}
                >
                  Pay now
                </Button>
              )}
            </>
          )}
          {bill.stage === "approval" && (
            <>
              <Button variant="approve" className="gap-1.5" onClick={() => { approve([bill.id]); done(`${bill.vendor} bill approved`); }}>
                <Check className="size-4 stroke-[1.75]" />
                Approve
              </Button>
              <Button variant="danger" onClick={() => { reject(bill.id); done(`${bill.vendor} bill sent back to drafts`); }}>
                Request changes
              </Button>
            </>
          )}
          {bill.stage === "draft" && (
            <>
              <Button variant="primary" onClick={() => { submit([bill.id]); done(`${bill.vendor} bill submitted for approval`); }}>
                Submit for approval
              </Button>
              <Button variant="danger" onClick={() => { remove(bill.id); done("Draft deleted"); }}>
                Delete draft
              </Button>
            </>
          )}
          {bill.stage === "paid" && (
            <Button onClick={() => toast.show(`Remittance for ${bill.invoiceNumber} downloaded`)}>Download remittance</Button>
          )}
          <Button variant="ghost" className="ml-auto" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
