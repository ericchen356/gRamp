"use client";

import { Car, Paperclip, Receipt, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { currentUser } from "@/data/people";
import type { ReimbursementType } from "@/data/expenses";
import { formatMoney } from "@/lib/format";
import { TODAY } from "@/components/ui/data-toolbar";
import { useExpenses } from "./expenses-store";
import { ChoiceTile, Field, MoneyInput, TextInput } from "@/components/ui/field";
import { parseAmount } from "@/lib/format";

const MILEAGE_RATE = 0.7;
/** Alexander reports to no one; his reimbursements route to the controller. */
const approver = currentUser.manager ?? "Tina Cruz";

const categories = ["Restaurants", "Travel", "Office supplies", "Education", "Electronics", "SaaS / Software", "Other"].map(
  (value) => ({ value, label: value }),
);

const initial = {
  type: "Out-of-pocket" as ReimbursementType,
  merchant: "",
  amount: "",
  date: TODAY,
  category: null as string | null,
  memo: "",
  from: "",
  to: "",
  miles: "",
  receipt: null as string | null,
};

/** "New reimbursement" composer opened from the Expenses header. */
export function NewReimbursementDialog() {
  const { composerOpen, setComposerOpen, addReimbursement, reimbursements } = useExpenses();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState(initial);

  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const mileage = form.type === "Mileage";
  const miles = parseAmount(form.miles);
  const amount = mileage ? Math.round(miles * MILEAGE_RATE * 100) / 100 : parseAmount(form.amount);
  const valid = mileage ? !!form.from && !!form.to && miles > 0 : !!form.merchant && amount > 0 && !!form.category;

  const close = () => {
    setComposerOpen(false);
    setForm(initial);
  };

  const submit = () => {
    addReimbursement({
      id: `re_${1001 + reimbursements.length}`,
      employee: currentUser.name,
      type: form.type,
      merchant: mileage ? "Mileage" : form.merchant,
      category: mileage ? "Mileage" : (form.category ?? "Other"),
      amount,
      submitted: TODAY,
      spent: form.date,
      status: "pending",
      approver,
      memo: mileage ? `${form.from} → ${form.to}` : form.memo || "Out-of-pocket expense",
      miles: mileage ? miles : undefined,
    });
    toast.show(`Reimbursement for ${formatMoney(amount)} submitted to ${approver}`);
    close();
    router.push("/expenses/reimbursements");
  };

  return (
    <Dialog open={composerOpen} onClose={close} className="max-w-[560px]">
      <DialogHeader
        title="New reimbursement"
        description="Get paid back for business expenses you covered personally."
        onClose={close}
      />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <div className="flex gap-3">
          <ChoiceTile
            selected={!mileage}
            onSelect={() => set("type", "Out-of-pocket")}
            icon={<Receipt className="size-5 stroke-[1.5] text-ink-1" />}
            title="Out-of-pocket"
            description="Meals, supplies or anything paid with a personal card"
          />
          <ChoiceTile
            selected={mileage}
            onSelect={() => set("type", "Mileage")}
            icon={<Car className="size-5 stroke-[1.5] text-ink-1" />}
            title="Mileage"
            description={`Driving for work at $${MILEAGE_RATE.toFixed(2)} per mile`}
          />
        </div>

        {mileage ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From">
                <TextInput value={form.from} onValueChange={(v) => set("from", v)} placeholder="Austin office" />
              </Field>
              <Field label="To">
                <TextInput value={form.to} onValueChange={(v) => set("to", v)} placeholder="Customer HQ" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Distance">
                <TextInput
                  value={form.miles}
                  onValueChange={(v) => set("miles", v.replace(/[^\d.]/g, ""))}
                  placeholder="0"
                  inputMode="decimal"
                  className="tabular"
                />
              </Field>
              <Field label="Date of trip">
                <TextInput type="date" value={form.date} onValueChange={(v) => set("date", v)} max={TODAY} />
              </Field>
            </div>
            <div className="flex items-baseline justify-between border-y border-line py-3 text-[13px]">
              <span className="text-ink-2">
                {miles ? `${miles.toLocaleString("en-US")} mi × $${MILEAGE_RATE.toFixed(2)}` : "Reimbursement amount"}
              </span>
              <span className="text-[20px] tracking-[-0.01em] text-ink tabular">{formatMoney(amount)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Merchant">
                <TextInput value={form.merchant} onValueChange={(v) => set("merchant", v)} placeholder="e.g. Blue Bottle Coffee" />
              </Field>
              <Field label="Amount">
                <MoneyInput value={form.amount} onValueChange={(v) => set("amount", v)} placeholder="0.00" suffix="USD" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <Select
                  variant="field"
                  label="Category"
                  value={form.category}
                  options={categories}
                  onChange={(v) => set("category", v)}
                  placeholder="Select category"
                />
              </Field>
              <Field label="Date of purchase">
                <TextInput type="date" value={form.date} onValueChange={(v) => set("date", v)} max={TODAY} />
              </Field>
            </div>
            <Field label="Receipt">
              {form.receipt ? (
                <div className="flex h-10 items-center gap-2 border border-line px-3 text-[13px] text-ink-1">
                  <Paperclip className="size-4 stroke-[1.5] text-ink-2" />
                  <span className="flex-1 truncate">{form.receipt}</span>
                  <button type="button" aria-label="Remove receipt" onClick={() => set("receipt", null)} className="text-ink-3 hover:text-ink">
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => set("receipt", `receipt_${(form.merchant || "expense").toLowerCase().replace(/\W+/g, "_")}.jpg`)}
                  className="flex h-11 items-center justify-center gap-2 border border-dashed border-line-strong bg-subtle text-[13px] text-ink-2 hover:border-ink-5 hover:text-ink-1"
                >
                  <Upload className="size-4 stroke-[1.5]" />
                  <span>
                    Drop a receipt or <span className="underline underline-offset-2">browse files</span>
                  </span>
                </button>
              )}
            </Field>
          </>
        )}

        <Field label="Memo">
          <TextInput value={form.memo} onValueChange={(v) => set("memo", v)} placeholder="What was this for?" />
        </Field>
      </div>
      <DialogFooter>
        <span className="mr-auto text-[12px] text-ink-3">
          Approver: {approver}
        </span>
        <Button size="md" onClick={close}>
          Cancel
        </Button>
        <Button size="md" variant="primary" disabled={!valid} onClick={submit}>
          Submit
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
