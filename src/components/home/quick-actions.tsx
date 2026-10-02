"use client";

import { CreditCard, HandCoins, Plane, ReceiptText, Upload, UserPlus, WalletCards, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { people } from "@/data/people";
import { formatMoney } from "@/lib/format";
import { Field, TextInput } from "@/components/ui/field";

type Action = { label: string; icon: LucideIcon } & ({ href: string } | { action: "issue-card" | "request-funds" | "invite" });

const actions: Action[] = [
  { label: "Issue card", icon: CreditCard, action: "issue-card" },
  { label: "Pay a bill", icon: ReceiptText, href: "/bill-pay" },
  { label: "Reimburse", icon: HandCoins, href: "/my-ramp?new=reimbursement" },
  { label: "Request funds", icon: WalletCards, action: "request-funds" },
  { label: "Upload receipts", icon: Upload, href: "/my-ramp#attention" },
  { label: "Book travel", icon: Plane, href: "/expenses" },
  { label: "Invite people", icon: UserPlus, action: "invite" },
];

const tileClass =
  "group flex h-[92px] flex-col justify-between border border-line bg-canvas p-3.5 text-left text-[14px] text-ink-1 transition-colors hover:border-line-strong hover:bg-subtle [&_svg]:size-[18px] [&_svg]:stroke-[1.5] [&_svg]:text-ink-2 hover:[&_svg]:text-ink";

const cardholderOptions = people.map((p) => ({ value: p.name, label: p.name, description: p.department }));

function IssueCardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [type, setType] = useState<"virtual" | "physical">("virtual");
  const [cardholder, setCardholder] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("2,500");

  const submit = () => {
    if (!cardholder) {
      toast.show("Choose a cardholder to issue the card", "neutral");
      return;
    }
    const amount = Number(limit.replace(/[^0-9.]/g, "")) || 0;
    toast.show(`${type === "virtual" ? "Virtual" : "Physical"} card issued to ${cardholder} · ${formatMoney(amount)}/mo`);
    setCardholder(null);
    setName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader title="Issue a card" description="Cards are live immediately. Physical cards ship in 3–5 business days." onClose={onClose} />
      <div className="space-y-4 px-6 pt-4 pb-6">
        <Segmented
          className="gap-2"
          value={type}
          onChange={setType}
          options={[
            { value: "virtual", label: "Virtual" },
            { value: "physical", label: "Physical" },
          ]}
        />
        <Field label="Cardholder">
          <Select variant="field" value={cardholder} onChange={setCardholder} options={cardholderOptions} placeholder="Choose cardholder" label="Cardholder" />
        </Field>
        <Field label="Card name" hint="Shown on statements and in the cardholder’s app">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "virtual" ? "e.g. Figma subscription" : "e.g. Travel card"} />
        </Field>
        <Field label="Monthly limit">
          <TextInput prefix="$" value={limit} onChange={(e) => setLimit(e.target.value)} inputMode="decimal" />
        </Field>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          Issue card
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/** Row of square outlined shortcut tiles under the greeting. */
export function QuickActions() {
  const toast = useToast();
  const [issueOpen, setIssueOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-7 gap-3 px-page">
        {actions.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon />
              <span>{item.label}</span>
            </>
          );
          if ("href" in item) {
            return (
              <Link key={item.label} href={item.href} className={tileClass}>
                {content}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              type="button"
              className={tileClass}
              onClick={() => {
                if (item.action === "issue-card") setIssueOpen(true);
                else if (item.action === "request-funds") toast.show("Fund request sent to Tina Cruz for approval");
                else toast.show("Invite link copied to clipboard", "neutral");
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
      <IssueCardDialog open={issueOpen} onClose={() => setIssueOpen(false)} />
    </>
  );
}
