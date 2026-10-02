import { FileCheck2, FileMinus2, FileX2 } from "lucide-react";
import { Status, Tag } from "@/components/ui/badge";
import {
  expenseStatusLabels,
  reimbursementStatusLabels,
  type ExpenseStatus,
  type ReceiptState,
  type ReimbursementStatus,
} from "@/data/expenses";
import { cn } from "@/lib/cn";

const expenseTones = {
  approved: "success",
  needs_approval: "pending",
  missing_items: "warning",
  flagged: "danger",
  declined: "neutral",
} as const satisfies Record<ExpenseStatus, Parameters<typeof Status>[0]["tone"]>;

export function ExpenseStatusDot({ status }: { status: ExpenseStatus }) {
  return <Status tone={expenseTones[status]}>{expenseStatusLabels[status]}</Status>;
}

const reimbursementTones = {
  pending: "warning",
  approved: "info",
  paid: "success",
  needs_info: "warning",
  rejected: "danger",
} as const satisfies Record<ReimbursementStatus, Parameters<typeof Tag>[0]["tone"]>;

export function ReimbursementTag({ status }: { status: ReimbursementStatus }) {
  return <Tag tone={reimbursementTones[status]}>{reimbursementStatusLabels[status]}</Tag>;
}

const receiptMeta: Record<ReceiptState, { label: string; icon: typeof FileCheck2; className: string }> = {
  attached: { label: "Receipt attached", icon: FileCheck2, className: "text-ink-2" },
  missing: { label: "Receipt missing", icon: FileX2, className: "text-flag" },
  not_required: { label: "Receipt not required (under $75)", icon: FileMinus2, className: "text-ink-4" },
};

export function ReceiptIcon({ state, className }: { state: ReceiptState; className?: string }) {
  const meta = receiptMeta[state];
  const Icon = meta.icon;
  return (
    <span title={meta.label} aria-label={meta.label} className={cn("inline-flex", meta.className, className)}>
      <Icon className="size-[15px] stroke-[1.5]" />
    </span>
  );
}

export function receiptLabel(state: ReceiptState) {
  return receiptMeta[state].label;
}
