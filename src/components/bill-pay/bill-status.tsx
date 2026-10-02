import { Status } from "@/components/ui/badge";
import { isOverdue, type Bill, type BillStage } from "@/data/bills";
import { formatDate } from "@/lib/format";

export const stageRoutes: Record<BillStage, string> = {
  draft: "/bill-pay/drafts",
  approval: "/bill-pay/approval",
  payment: "/bill-pay",
  paid: "/bill-pay/paid",
};

/** Deep link that opens the bill drawer on the right Bill Pay tab. */
export function billHref(bill: Pick<Bill, "id" | "stage">) {
  return `${stageRoutes[bill.stage]}?bill=${bill.id}`;
}

/** Dot + label status for a bill in any stage. */
export function BillStatus({ bill }: { bill: Bill }) {
  switch (bill.stage) {
    case "draft":
      return bill.missing?.length ? (
        <Status tone="warning">Missing {bill.missing.length === 1 ? bill.missing[0].toLowerCase() : `${bill.missing.length} fields`}</Status>
      ) : (
        <Status tone="neutral">Ready to submit</Status>
      );
    case "approval": {
      const next = bill.approvers.find((a) => a.state === "pending");
      return <Status tone="pending">{next ? `Waiting on ${next.name.split(" ")[0]}` : "In review"}</Status>;
    }
    case "payment":
      if (isOverdue(bill)) return <Status tone="danger">Overdue</Status>;
      if (bill.scheduledFor) return <Status tone="info">Scheduled {formatDate(bill.scheduledFor)}</Status>;
      return <Status tone="success">Ready to pay</Status>;
    case "paid":
      return <Status tone="success">Paid {bill.paidOn ? formatDate(bill.paidOn) : ""}</Status>;
  }
}
