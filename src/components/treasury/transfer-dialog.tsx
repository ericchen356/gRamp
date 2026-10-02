"use client";

import { ArrowDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { allAccounts } from "@/data/treasury";
import { formatMoney } from "@/lib/format";
import { Field, TextInput } from "@/components/ui/field";
import { formatAmountInput, parseAmount } from "@/lib/format";

const accountOptions = allAccounts.map((account) => ({
  value: account.name,
  label: account.name,
  description: `•• ${account.last4}`,
}));

/** "New › Transfer funds": one-off move between two treasury accounts. */
export function TransferDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose}>
      {/* Remount on open so the form always starts clean. */}
      {open && <TransferForm onClose={onClose} />}
    </Dialog>
  );
}

function TransferForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [from, setFrom] = useState<string | null>("Business Account");
  const [to, setTo] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const source = allAccounts.find((account) => account.name === from);
  const value = parseAmount(amount);
  const overdrawn = !!source && value > source.balance;
  const valid = !!from && !!to && from !== to && value > 0 && !overdrawn;

  const submit = () => {
    toast.show(`${formatMoney(value)} transfer to ${to} scheduled`);
    onClose();
  };

  return (
    <>
      <DialogHeader title="Transfer funds" description="Move money between your Ramp Treasury accounts." onClose={onClose} />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <Field label="From" hint={source && `Available ${formatMoney(source.balance)}`}>
          <Select
            variant="field"
            label="From account"
            value={from}
            options={accountOptions}
            onChange={(next) => {
              setFrom(next);
              if (next === to) setTo(null);
            }}
            placeholder="Select account"
          />
        </Field>
        <div className="-my-1 flex justify-center text-ink-3">
          <ArrowDown className="size-4 stroke-[1.5]" />
        </div>
        <Field label="To">
          <Select
            variant="field"
            label="To account"
            value={to}
            options={accountOptions.filter((option) => option.value !== from)}
            onChange={setTo}
            placeholder="Select account"
          />
        </Field>
        <Field
          label="Amount"
          hint={overdrawn ? <span className="text-danger">Amount exceeds the available balance</span> : undefined}
        >
          <TextInput
            prefix="$"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onValueChange={(next) => setAmount(formatAmountInput(next))}
            aria-label="Amount"
          />
        </Field>
        <Field label="Memo (optional)">
          <TextInput value={memo} onValueChange={setMemo} placeholder="Add a note for your records" aria-label="Memo" />
        </Field>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={submit}>
          Transfer
        </Button>
      </DialogFooter>
    </>
  );
}
