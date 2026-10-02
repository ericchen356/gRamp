"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { CardFrequency } from "@/data/cards";
import { currentUser, people } from "@/data/people";
import { formatMoney } from "@/lib/format";
import { useCards } from "./cards-store";
import { Field, MoneyInput, TextInput } from "@/components/ui/field";
import { parseAmount } from "@/lib/format";

const ownerOptions = people.map((p) => ({ value: p.name, label: p.id === currentUser.id ? `${p.name} (You)` : p.name }));
const periodOptions = (["Monthly", "Quarterly", "Yearly", "One-time"] as CardFrequency[]).map((value) => ({ value, label: value }));

const initial = { name: "", owner: currentUser.name as string | null, limit: "", period: "Monthly" as CardFrequency, description: "" };

/** Funds tab "Create fund" composer. */
export function CreateFundDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { funds, addFund } = useCards();
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const limit = parseAmount(form.limit);
  const valid = !!form.name.trim() && !!form.owner && limit > 0;

  const close = () => {
    setForm(initial);
    onClose();
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogHeader title="Create fund" description="A shared budget that members spend from with their own cards." onClose={close} />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <Field label="Fund name">
          <TextInput value={form.name} onValueChange={(v) => set("name", v)} placeholder="e.g. Q1 sales kickoff" />
        </Field>
        <Field label="Purpose">
          <TextInput value={form.description} onValueChange={(v) => set("description", v)} placeholder="What is this budget for?" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner">
            <Select variant="field" label="Owner" value={form.owner} options={ownerOptions} onChange={(v) => set("owner", v)} placeholder="Choose owner" />
          </Field>
          <Field label="Resets">
            <Select
              variant="field"
              label="Period"
              value={form.period}
              options={periodOptions}
              onChange={(v) => set("period", v as CardFrequency)}
              placeholder="Period"
            />
          </Field>
        </div>
        <Field label="Limit">
          <MoneyInput value={form.limit} onValueChange={(v) => set("limit", v)} placeholder="0.00" suffix="USD" />
        </Field>
      </div>
      <DialogFooter>
        <Button size="md" onClick={close}>
          Cancel
        </Button>
        <Button
          size="md"
          variant="primary"
          disabled={!valid}
          onClick={() => {
            if (!form.owner) return;
            addFund({
              id: `fund_${funds.length + 1}`,
              name: form.name.trim(),
              description: form.description.trim() || "New fund",
              owner: form.owner,
              members: [form.owner],
              spent: 0,
              limit,
              period: form.period,
              resets: form.period === "One-time" ? undefined : "2026-11-01",
              status: "active",
            });
            toast.show(`${form.name.trim()} created with a ${formatMoney(limit)} limit`);
            close();
          }}
        >
          Create fund
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
