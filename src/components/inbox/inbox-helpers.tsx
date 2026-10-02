import { CreditCard } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import type { InboxItem, InboxType } from "@/data/inbox";
import { formatDate, formatMoney } from "@/lib/format";

export const TODAY = "2026-10-02";

export const typeLabels: Record<InboxType, string> = {
  approval: "Spend request",
  missing: "Missing items",
  reimbursement: "Reimbursement",
  bill: "Bill",
  card: "Card request",
};

/** Sentence-style task title: "Approve $1,240.00 reimbursement from Priya Raman". */
export function itemTitle(item: InboxItem) {
  const amount = formatMoney(item.amount);
  switch (item.type) {
    case "reimbursement":
      return `Approve ${amount} reimbursement from ${item.requester}`;
    case "approval":
      return `Approve ${amount} spend request from ${item.requester}`;
    case "bill":
      return `Approve ${amount} bill from ${item.merchant}`;
    case "card":
      return `Approve ${item.cardType?.toLowerCase()} card request from ${item.requester}`;
    case "missing": {
      const what = item.missing?.length === 2 ? "Receipt and memo" : item.missing?.[0] === "memo" ? "Memo" : "Receipt";
      return `${what} missing for ${amount} at ${item.merchant}`;
    }
  }
}

/** Secondary line under the title. */
export function itemMeta(item: InboxItem) {
  const parts =
    item.type === "missing"
      ? [item.requester, item.subject]
      : item.type === "bill"
        ? [item.invoice, item.subject]
        : item.type === "card"
          ? [`${formatMoney(item.amount)} ${item.frequency?.toLowerCase()} limit`, item.subject]
          : [item.merchant, item.subject];
  return [...parts, item.department].filter(Boolean).join(" · ");
}

function daysBetween(from: string, to: string) {
  return Math.round((new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) / 86_400_000);
}

/** "Due Oct 4" / "Overdue" / "2d ago" for the row's right edge. */
export function itemTiming(item: InboxItem): { label: string; overdue: boolean } {
  if (item.due) {
    const days = daysBetween(TODAY, item.due);
    if (days < 0) return { label: `Overdue ${-days}d`, overdue: true };
    if (days === 0) return { label: "Due today", overdue: true };
    return { label: `Due ${formatDate(item.due)}`, overdue: false };
  }
  const age = daysBetween(item.submitted, TODAY);
  return { label: age === 0 ? "Today" : `${age}d ago`, overdue: false };
}

/** Bills show the vendor mark, card requests a card glyph, everything else the person. */
export function ItemIcon({ item, size = 32 }: { item: InboxItem; size?: number }) {
  if (item.type === "bill" && item.merchant) return <MerchantLogo name={item.merchant} size={size} />;
  if (item.type === "card") {
    return (
      <span
        style={{ width: size, height: size }}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-ink-1"
      >
        <CreditCard className="size-[15px] stroke-[1.5]" />
      </span>
    );
  }
  return <Avatar name={item.requester} size={size} />;
}
