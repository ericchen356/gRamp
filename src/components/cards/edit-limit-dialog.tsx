"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { CardFrequency, RampCard } from "@/data/cards";
import { formatMoney, formatMoneyWhole } from "@/lib/format";
import { SpendMeter } from "./card-status";
import { useCards } from "./cards-store";
import { Field, MoneyInput } from "@/components/ui/field";
import { parseAmount } from "@/lib/format";

const periodOptions = (["Monthly", "Quarterly", "Yearly", "One-time"] as CardFrequency[]).map((value) => ({ value, label: value }));

function EditLimitForm({ card, onClose }: { card: RampCard; onClose: () => void }) {
  const { updateCard } = useCards();
  const toast = useToast();
  const [limit, setLimit] = useState(card.limit.toLocaleString("en-US"));
  const [frequency, setFrequency] = useState<CardFrequency>(card.frequency);
  const next = parseAmount(limit);

  return (
    <>
      <DialogHeader title="Edit limit" description={`${card.name} ···· ${card.last4} · ${card.cardholder}`} onClose={onClose} />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <SpendMeter spent={card.spent} limit={next || card.limit} caption={`${formatMoneyWhole(Math.max(0, (next || card.limit) - card.spent))} available`} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Spend limit">
            <MoneyInput value={limit} onValueChange={setLimit} suffix="USD" autoFocus />
          </Field>
          <Field label="Resets">
            <Select variant="field" label="Frequency" value={frequency} options={periodOptions} onChange={(v) => setFrequency(v as CardFrequency)} placeholder="Frequency" />
          </Field>
        </div>
        {next > 0 && next < card.spent && (
          <p className="text-[12px] text-flag">New limit is below this period’s spend. The card will decline until it resets.</p>
        )}
      </div>
      <DialogFooter>
        <Button size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="md"
          variant="primary"
          disabled={next <= 0}
          onClick={() => {
            updateCard(card.id, { limit: next, frequency });
            toast.show(`Limit updated to ${formatMoney(next)} ${frequency.toLowerCase()}`);
            onClose();
          }}
        >
          Save limit
        </Button>
      </DialogFooter>
    </>
  );
}

/** Small dialog for changing a card's limit and reset frequency. */
export function EditLimitDialog({ card, onClose }: { card: RampCard | null; onClose: () => void }) {
  return (
    <Dialog open={!!card} onClose={onClose} className="max-w-[480px]">
      {card && <EditLimitForm key={card.id} card={card} onClose={onClose} />}
    </Dialog>
  );
}
