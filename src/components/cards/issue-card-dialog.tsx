"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { CardFrequency, CardType } from "@/data/cards";
import { currentUser, people } from "@/data/people";
import { spendPrograms } from "@/data/spend-programs";
import { formatMoney } from "@/lib/format";
import { CardVisual } from "./card-visual";
import { useCards } from "./cards-store";
import { ChoiceTile, Field, MoneyInput, TextInput } from "@/components/ui/field";
import { parseAmount } from "@/lib/format";

const cardholderOptions = people.map((p) => ({
  value: p.name,
  label: p.id === currentUser.id ? `${p.name} (You)` : p.name,
  description: p.department,
}));

const frequencyOptions: { value: CardFrequency; label: string }[] = [
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Yearly", label: "Yearly" },
  { value: "One-time", label: "One-time" },
];

const programOptions = [
  { value: "none", label: "No spend program" },
  ...spendPrograms.filter((p) => p.status === "active").map((p) => ({ value: p.name, label: p.name })),
];

const initial = {
  type: "virtual" as CardType,
  cardholder: currentUser.name as string | null,
  name: "",
  limit: "",
  frequency: "Monthly" as CardFrequency,
  program: "none",
};

function IssueCardDialog({ open, onClose }: { open: boolean; onClose: (navigating?: boolean) => void }) {
  const { cards, addCard } = useCards();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const limit = parseAmount(form.limit);
  const valid = !!form.cardholder && !!form.name.trim() && limit > 0;
  const previewLast4 = String(4000 + ((cards.length * 7919) % 5999)).padStart(4, "0");

  const close = (navigating = false) => {
    setForm(initial);
    onClose(navigating);
  };

  const submit = () => {
    if (!form.cardholder) return;
    const id = `card_${previewLast4}`;
    addCard({
      id,
      name: form.name.trim(),
      last4: previewLast4,
      cardholder: form.cardholder,
      type: form.type,
      limit,
      spent: 0,
      frequency: form.frequency,
      status: form.type === "virtual" ? "active" : "not_activated",
      program: form.program === "none" ? undefined : form.program,
      expires: "10/29",
      issued: "2026-10-02",
    });
    toast.show(
      form.type === "virtual"
        ? `Virtual card ···· ${previewLast4} issued to ${form.cardholder}`
        : `Physical card for ${form.cardholder} ships in 5–7 business days`,
    );
    close(true);
    router.push(`/cards/${id}`);
  };

  return (
    <Dialog open={open} onClose={() => close()} className="max-w-[560px]">
      <DialogHeader
        title="Issue card"
        description="Virtual cards work instantly. Physical cards ship within a week."
        onClose={() => close()}
      />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <div className="flex gap-3">
          <ChoiceTile
            selected={form.type === "virtual"}
            onSelect={() => set("type", "virtual")}
            icon={<CardVisual type="virtual" last4={previewLast4} />}
            title="Virtual"
            description="For online and recurring spend"
          />
          <ChoiceTile
            selected={form.type === "physical"}
            onSelect={() => set("type", "physical")}
            icon={<CardVisual type="physical" last4={previewLast4} />}
            title="Physical"
            description="For in-person spend and travel"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cardholder">
            <Select
              variant="field"
              label="Cardholder"
              value={form.cardholder}
              options={cardholderOptions}
              onChange={(v) => set("cardholder", v)}
              placeholder="Choose cardholder"
            />
          </Field>
          <Field label="Card name">
            <TextInput value={form.name} onValueChange={(v) => set("name", v)} placeholder="e.g. Figma subscription" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Spend limit">
            <MoneyInput value={form.limit} onValueChange={(v) => set("limit", v)} placeholder="0.00" suffix="USD" />
          </Field>
          <Field label="Resets">
            <Select
              variant="field"
              label="Limit frequency"
              value={form.frequency}
              options={frequencyOptions}
              onChange={(v) => set("frequency", v as CardFrequency)}
              placeholder="Frequency"
            />
          </Field>
        </div>
        <Field label="Spend program" hint="Programs apply category restrictions, receipt rules and approvers automatically.">
          <Select
            variant="field"
            label="Spend program"
            value={form.program}
            options={programOptions}
            onChange={(v) => set("program", v)}
            placeholder="Choose program"
          />
        </Field>
      </div>
      <DialogFooter>
        <span className="mr-auto text-[12px] text-ink-3">
          {limit > 0 ? `${formatMoney(limit)} ${form.frequency.toLowerCase()} limit` : "No limit set"}
        </span>
        <Button size="md" onClick={() => close()}>
          Cancel
        </Button>
        <Button size="md" variant="primary" disabled={!valid} onClick={submit}>
          Issue card
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/**
 * "Issue card" CTA plus its dialog. The dialog also opens from `?new=1`
 * (command palette, Home shortcuts); closing it strips the param.
 */
export function IssueCardLauncher() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [manualOpen, setManualOpen] = useState(false);
  // The shared Dialog portals into document.body, so only honor `?new=1` once hydrated.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const fromUrl = hydrated && params.get("new") === "1";

  return (
    <>
      <Button size="lg" variant="primary" onClick={() => setManualOpen(true)}>
        Issue card
      </Button>
      <IssueCardDialog
        open={manualOpen || fromUrl}
        onClose={(navigating) => {
          setManualOpen(false);
          if (fromUrl && !navigating) router.replace(pathname, { scroll: false });
        }}
      />
    </>
  );
}

export function IssueCardButtonFallback() {
  return (
    <Button size="lg" variant="primary">
      Issue card
    </Button>
  );
}
