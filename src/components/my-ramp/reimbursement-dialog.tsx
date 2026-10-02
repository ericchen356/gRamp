"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/tabs";
import { reimbursementCategories, type Reimbursement } from "@/data/my-ramp";
import { formatMoney } from "@/lib/format";
import { ReceiptDropzone } from "./receipt-dropzone";
import { Field, TextArea, TextInput } from "@/components/ui/field";

const MILEAGE_RATE = 0.7;
const categoryOptions = reimbursementCategories.map((c) => ({ value: c, label: c }));

type Draft = { kind: "expense" | "mileage"; merchant: string; amount: string; miles: string; date: string; category: string | null; memo: string; receipt: string | null };

const emptyDraft: Draft = { kind: "expense", merchant: "", amount: "", miles: "", date: "2026-10-02", category: null, memo: "", receipt: null };

/** "New reimbursement" form: out-of-pocket expense or mileage. */
export function ReimbursementDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reimbursement: Reimbursement) => void;
}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [touched, setTouched] = useState(false);
  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));

  const amount =
    draft.kind === "mileage"
      ? Math.round((Number(draft.miles) || 0) * MILEAGE_RATE * 100) / 100
      : Number(draft.amount.replace(/[^0-9.]/g, "")) || 0;
  const valid = amount > 0 && (draft.kind === "mileage" || (draft.merchant.trim() && draft.category));

  const close = () => {
    setDraft(emptyDraft);
    setTouched(false);
    onClose();
  };

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    onSubmit({
      id: `re_${Date.now()}`,
      merchant: draft.kind === "mileage" ? "Mileage" : draft.merchant.trim(),
      description: draft.memo.trim() || (draft.kind === "mileage" ? `${draft.miles} mi` : "Out-of-pocket expense"),
      category: draft.kind === "mileage" ? "Mileage" : (draft.category ?? "Other"),
      amount,
      date: draft.date,
      status: "pending",
      approver: "Tina Cruz",
    });
    close();
  };

  return (
    <Dialog open={open} onClose={close} className="max-w-[560px]">
      <DialogHeader title="New reimbursement" description="Submitted to Tina Cruz for approval. Paid out with the next payroll run." onClose={close} />
      <div className="space-y-4 px-6 pt-4 pb-6">
        <Segmented
          className="gap-2"
          value={draft.kind}
          onChange={(kind) => patch({ kind })}
          options={[
            { value: "expense", label: "Out-of-pocket" },
            { value: "mileage", label: "Mileage" },
          ]}
        />
        {draft.kind === "expense" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Merchant" hint={touched && !draft.merchant.trim() ? <span className="text-danger">Add a merchant</span> : undefined}>
                <TextInput value={draft.merchant} onChange={(e) => patch({ merchant: e.target.value })} placeholder="e.g. Blue Bottle Coffee" autoFocus />
              </Field>
              <Field label="Amount" hint={touched && !amount ? <span className="text-danger">Enter an amount</span> : undefined}>
                <TextInput prefix="$" inputMode="decimal" value={draft.amount} onChange={(e) => patch({ amount: e.target.value })} placeholder="0.00" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Transaction date">
                <TextInput type="date" value={draft.date} onChange={(e) => patch({ date: e.target.value })} max="2026-10-02" />
              </Field>
              <div>
                <span className="mb-1.5 block text-[12px] text-ink-2">Category</span>
                <Select variant="field" value={draft.category} onChange={(category) => patch({ category })} options={categoryOptions} placeholder="Choose category" label="Category" />
                {touched && !draft.category && <span className="mt-1.5 block text-[12px] text-danger">Choose a category</span>}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Distance" hint={`IRS rate $${MILEAGE_RATE.toFixed(2)}/mi`}>
              <TextInput inputMode="decimal" value={draft.miles} onChange={(e) => patch({ miles: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Trip date">
              <TextInput type="date" value={draft.date} onChange={(e) => patch({ date: e.target.value })} max="2026-10-02" />
            </Field>
          </div>
        )}
        <Field label="Memo">
          <TextArea value={draft.memo} onChange={(e) => patch({ memo: e.target.value })} placeholder="What was this for?" className="min-h-[64px]" />
        </Field>
        {draft.kind === "expense" && (
          <div>
            <span className="mb-1.5 block text-[12px] text-ink-2">Receipt</span>
            <ReceiptDropzone onComplete={(name) => patch({ receipt: name })} />
          </div>
        )}
      </div>
      <DialogFooter>
        <span className="mr-auto text-[13px] text-ink-2 tabular">
          {amount > 0 ? `Total ${formatMoney(amount)}` : ""}
        </span>
        <Button onClick={close}>Cancel</Button>
        <Button variant="primary" onClick={submit}>
          Submit
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
