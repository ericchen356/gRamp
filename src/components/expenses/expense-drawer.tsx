"use client";

import { CircleAlert, CircleCheck, Flag, Paperclip, Receipt } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CardVisual } from "@/components/cards/card-visual";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { DetailRow } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { cards } from "@/data/cards";
import type { CardExpense } from "@/data/expenses";
import { cn } from "@/lib/cn";
import { formatDateLong, formatMoney } from "@/lib/format";
import { ExpenseStatusDot, receiptLabel } from "./expense-status";
import { useExpenses } from "./expenses-store";
import { TextInput } from "@/components/ui/field";

function Check({ ok, children }: { ok: boolean; children: ReactNode }) {
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <div className="flex items-center gap-2.5 py-2 text-[13px] text-ink-1">
      <Icon className={cn("size-4 shrink-0 stroke-[1.5]", ok ? "text-positive" : "text-flag")} />
      {children}
    </div>
  );
}

function MemoEditor({ expense }: { expense: CardExpense }) {
  const { updateExpense } = useExpenses();
  const toast = useToast();
  const [draft, setDraft] = useState("");
  if (expense.memo) return <p className="text-[13px] text-ink-1">{expense.memo}</p>;
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.trim()) return;
        const missing = expense.missing?.filter((m) => m !== "memo");
        updateExpense([expense.id], {
          memo: draft.trim(),
          missing,
          expenseStatus: missing?.length ? expense.expenseStatus : expense.flagged ? "flagged" : "approved",
        });
        toast.show("Memo added");
      }}
    >
      <TextInput value={draft} onValueChange={setDraft} placeholder="Add a business purpose" className="h-9 text-[13px]" />
      <Button size="md" type="submit" disabled={!draft.trim()}>
        Save
      </Button>
    </form>
  );
}

/** Right-hand detail sheet for a card transaction in Expenses. */
export function ExpenseDrawer({
  expense: e,
  onClose,
  onApprove,
}: {
  expense: CardExpense | null;
  onClose: () => void;
  onApprove: (id: string) => void;
}) {
  const { updateExpense } = useExpenses();
  const toast = useToast();
  const card = e ? cards.find((c) => c.last4 === e.cardLast4) : undefined;

  return (
    <Drawer open={!!e} onClose={onClose} title="Card transaction">
      {e && (
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <MerchantLogo name={e.merchant} size={40} />
            <div className="min-w-0">
              <div className="truncate text-[16px] text-ink">{e.merchant}</div>
              <div className="text-[12px] text-ink-2">{e.category}</div>
            </div>
            <span className="ml-auto">
              <ExpenseStatusDot status={e.expenseStatus} />
            </span>
          </div>

          <div className="mt-6 text-[36px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(e.amount)}</div>
          <div className="mt-2 text-[13px] text-ink-2">
            {formatDateLong(e.date)} · {e.pending ? "Pending" : "Cleared"}
          </div>

          <div className="mt-6 flex items-center gap-3 border-y border-line py-3">
            <Avatar name={e.cardholder} size={28} />
            <div className="min-w-0 flex-1 text-[13px]">
              <div className="text-ink">{e.cardholder}</div>
              <div className="truncate text-ink-2">
                {e.cardName} ···· {e.cardLast4}
              </div>
            </div>
            <CardVisual type={card?.type ?? "physical"} last4={e.cardLast4} />
          </div>

          <h3 className="mt-6 mb-1 text-[13px] text-ink">Policy</h3>
          <div className="divide-y divide-line-soft">
            <Check ok={e.receipt !== "missing"}>{receiptLabel(e.receipt)}</Check>
            <Check ok={!!e.memo}>{e.memo ? "Memo provided" : "Memo missing"}</Check>
            <Check ok={!e.flagged}>{e.flagged ? "Flagged for review by Tina Cruz" : "Within card limit and allowed categories"}</Check>
          </div>

          <h3 className="mt-6 mb-1 text-[13px] text-ink">Details</h3>
          <DetailRow label="Department">{e.department}</DetailRow>
          <DetailRow label="Location">{e.location}</DetailRow>
          <DetailRow label="GL account">{e.glAccount}</DetailRow>
          <DetailRow label="Spend program">{card?.program ?? "None"}</DetailRow>

          <h3 className="mt-6 mb-2 text-[13px] text-ink">Receipt</h3>
          {e.receipt === "missing" ? (
            <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-subtle py-8 text-center">
              <Receipt className="size-6 stroke-[1.25] text-ink-4" />
              <p className="text-[13px] text-ink-2">Receipt missing</p>
              <Button size="xs" onClick={() => toast.show(`Receipt request sent to ${e.cardholder}`)}>
                Request from {e.cardholder.split(" ")[0]}
              </Button>
            </div>
          ) : e.receipt === "attached" ? (
            <div className="flex items-center gap-2 border border-line px-3 py-2.5 text-[13px] text-ink-1">
              <Paperclip className="size-4 stroke-[1.5] text-ink-2" />
              receipt_{e.merchant.toLowerCase().replace(/\W+/g, "_")}.pdf
            </div>
          ) : (
            <p className="text-[13px] text-ink-2">Not required for purchases under $75.</p>
          )}

          <h3 className="mt-6 mb-2 text-[13px] text-ink">Memo</h3>
          <MemoEditor key={e.id} expense={e} />

          <div className="mt-8 flex gap-2">
            {e.expenseStatus !== "approved" && (
              <Button
                variant="primary"
                onClick={() => {
                  onApprove(e.id);
                  onClose();
                }}
              >
                Approve
              </Button>
            )}
            <Button
              onClick={() => {
                updateExpense([e.id], {
                  flagged: !e.flagged,
                  expenseStatus: e.flagged ? (e.missing?.length ? "missing_items" : "approved") : "flagged",
                });
                toast.show(e.flagged ? "Flag removed" : "Transaction flagged for review");
              }}
              className="gap-1.5"
            >
              <Flag className="size-3.5 stroke-[1.5]" />
              {e.flagged ? "Remove flag" : "Flag"}
            </Button>
            <Button variant="ghost" onClick={onClose} className="ml-auto">
              Close
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
