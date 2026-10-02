"use client";

import { ArrowDownToLine, Repeat2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Segmented } from "@/components/ui/tabs";
import { currentUser } from "@/data/people";
import { allAccounts, type Automation, type AutomationFrequency, type AutomationKind } from "@/data/treasury";
import { formatMoneyWhole } from "@/lib/format";
import { Field, TextInput } from "@/components/ui/field";
import { formatAmountInput, parseAmount } from "@/lib/format";

const accountOptions = allAccounts.map((account) => ({ value: account.name, label: account.name, description: `•• ${account.last4}` }));
const frequencies: AutomationFrequency[] = ["Daily", "Weekly", "Monthly", "When threshold is crossed"];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (automation: Automation) => void;
};

/** "New automation": sweep (keep a target balance) or recurring deposit. */
export function AutomationDialog({ open, onClose, onCreate }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-[560px]">
      {open && <AutomationForm onClose={onClose} onCreate={onCreate} />}
    </Dialog>
  );
}

function AutomationForm({ onClose, onCreate }: Omit<Props, "open">) {
  const [kind, setKind] = useState<AutomationKind>("sweep");
  const [from, setFrom] = useState<string | null>("Business Account");
  const [to, setTo] = useState<string | null>("Investment Account");
  const [amount, setAmount] = useState("200,000");
  const [frequency, setFrequency] = useState<AutomationFrequency>("Daily");
  const [name, setName] = useState("");

  const value = parseAmount(amount);
  const valid = !!from && !!to && from !== to && value > 0;
  const fallbackName =
    kind === "sweep" ? `Sweep excess funds above ${formatMoneyWhole(value)}` : `Deposit ${formatMoneyWhole(value)} to ${to ?? "account"}`;

  const submit = () => {
    if (!from || !to) return;
    onCreate({
      id: `auto_${Date.now()}`,
      kind,
      name: name.trim() || fallbackName,
      from,
      to,
      amount: value,
      frequency,
      lastRun: null,
      nextRun: "2026-10-03",
      createdBy: currentUser.name,
      enabled: true,
    });
  };

  return (
    <>
      <DialogHeader
        title="New automation"
        description="Move money between accounts on a schedule or when a balance crosses a threshold."
        onClose={onClose}
      />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <Segmented
          value={kind}
          onChange={setKind}
          className="gap-2"
          options={[
            {
              value: "sweep",
              label: (
                <>
                  <Repeat2 /> Sweep
                </>
              ),
            },
            {
              value: "deposit",
              label: (
                <>
                  <ArrowDownToLine /> Deposit
                </>
              ),
            },
          ]}
        />
        <p className="-mt-1 text-[12px] text-ink-2">
          {kind === "sweep"
            ? "Keeps a target balance in the source account and moves everything above it."
            : "Moves a fixed amount into the destination account on a schedule."}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
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
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={kind === "sweep" ? "Keep at least" : "Amount"}>
            <TextInput
              prefix="$"
              inputMode="decimal"
              value={amount}
              onValueChange={(next) => setAmount(formatAmountInput(next))}
              aria-label={kind === "sweep" ? "Target balance" : "Amount"}
            />
          </Field>
          <Field label="Runs">
            <Select
              variant="field"
              label="Frequency"
              value={frequency}
              options={frequencies.map((option) => ({ value: option, label: option }))}
              onChange={(next) => setFrequency(next as AutomationFrequency)}
              placeholder="Select frequency"
            />
          </Field>
        </div>
        <Field label="Name (optional)">
          <TextInput value={name} onValueChange={setName} placeholder={fallbackName} aria-label="Automation name" />
        </Field>
      </div>
      <DialogFooter>
        <span className="mr-auto text-[12px] text-ink-3">Another admin will be asked to approve.</span>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid} onClick={submit}>
          Create automation
        </Button>
      </DialogFooter>
    </>
  );
}
