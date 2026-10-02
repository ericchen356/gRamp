"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { currentUser } from "@/data/people";
import { requestBehaviorLabels, type ProgramIcon as ProgramIconKey, type RequestBehavior, type SpendProgram } from "@/data/spend-programs";
import { cn } from "@/lib/cn";
import { ProgramIcon, programIconOptions } from "./program-icon";
import { usePrograms } from "./programs-store";
import { Field, MoneyInput, TextInput } from "@/components/ui/field";
import { parseAmount } from "@/lib/format";

const behaviorOptions = (Object.keys(requestBehaviorLabels) as RequestBehavior[]).map((value) => ({
  value,
  label: requestBehaviorLabels[value],
}));

const cardTypeOptions = (["Virtual", "Physical", "Virtual or physical"] as const).map((value) => ({ value, label: value }));
const frequencyOptions = (["Monthly", "Quarterly", "Yearly", "One-time"] as const).map((value) => ({ value, label: value }));

const initial = {
  name: "",
  description: "",
  icon: "software" as ProgramIconKey,
  request: "approval" as RequestBehavior,
  cardType: "Virtual" as SpendProgram["cardType"],
  memberLimit: "",
  frequency: "Monthly" as SpendProgram["frequency"],
};

/** "New program" composer: creates a draft program and opens it. */
export function NewProgramDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { programs, addProgram } = usePrograms();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const limit = parseAmount(form.memberLimit);
  const valid = !!form.name.trim() && limit > 0;

  const close = () => {
    setForm(initial);
    onClose();
  };

  const create = () => {
    const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const id = programs.some((p) => p.id === slug) ? `${slug}-${programs.length}` : slug;
    addProgram({
      id,
      name: form.name.trim(),
      icon: form.icon,
      description: form.description.trim() || "New spend program",
      owner: currentUser.name,
      request: form.request,
      cardType: form.cardType,
      memberLimit: limit,
      frequency: form.frequency,
      monthlyLimit: limit * 10,
      spentThisMonth: 0,
      categories: [],
      approvers: form.request === "approval" ? ["Manager"] : [],
      receiptThreshold: 75,
      status: "draft",
      updated: "2026-10-02",
      members: [],
    });
    toast.show(`${form.name.trim()} saved as a draft`);
    close();
    router.push(`/spend-programs/${id}`);
  };

  return (
    <Dialog open={open} onClose={close} className="max-w-[560px]">
      <DialogHeader
        title="New spend program"
        description="Templates for how employees request cards: limits, categories, receipts and approvals."
        onClose={close}
      />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <Field label="Icon">
          <div className="flex gap-2">
            {programIconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                aria-label={icon}
                aria-pressed={form.icon === icon}
                onClick={() => set("icon", icon)}
                className={cn("rounded-[7px] p-px ring-1 transition-shadow", form.icon === icon ? "ring-ink" : "ring-transparent hover:ring-line-strong")}
              >
                <ProgramIcon icon={icon} size={34} />
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Program name">
            <TextInput value={form.name} onValueChange={(v) => set("name", v)} placeholder="e.g. Customer dinners" autoFocus />
          </Field>
          <Field label="Card type">
            <Select
              variant="field"
              label="Card type"
              value={form.cardType}
              options={cardTypeOptions}
              onChange={(v) => set("cardType", v as SpendProgram["cardType"])}
              placeholder="Card type"
            />
          </Field>
        </div>
        <Field label="Description">
          <TextInput value={form.description} onValueChange={(v) => set("description", v)} placeholder="Shown to employees when they request a card" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Default limit per member">
            <MoneyInput value={form.memberLimit} onValueChange={(v) => set("memberLimit", v)} placeholder="0.00" suffix="USD" />
          </Field>
          <Field label="Resets">
            <Select
              variant="field"
              label="Limit frequency"
              value={form.frequency}
              options={frequencyOptions}
              onChange={(v) => set("frequency", v as SpendProgram["frequency"])}
              placeholder="Frequency"
            />
          </Field>
        </div>
        <Field label="Who can get a card">
          <Select
            variant="field"
            label="Request behavior"
            value={form.request}
            options={behaviorOptions}
            onChange={(v) => set("request", v as RequestBehavior)}
            placeholder="Request behavior"
          />
        </Field>
      </div>
      <DialogFooter>
        <Button size="md" onClick={close}>
          Cancel
        </Button>
        <Button size="md" variant="primary" disabled={!valid} onClick={create}>
          Create program
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
