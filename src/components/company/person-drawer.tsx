"use client";

import { CreditCard, Mail } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Status } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { DetailRow, Progress, Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { roleDescriptions, roles, type Member } from "@/data/company";
import { people, type Person } from "@/data/people";
import { transactions } from "@/data/transactions";
import { formatDateLong, formatMoney } from "@/lib/format";
import { useCompany } from "./company-store";
import { Field } from "@/components/ui/field";

const roleOptions = roles.map((role) => ({ value: role, label: role }));
const managerOptions = people.map((person) => ({ value: person.name, label: person.name }));

type PersonCard = { name: string; kind: "Physical" | "Virtual"; last4: string; limit: number; spent: number };

/** Derives a plausible card list from the person's transactions (physical card first, then vendor cards). */
function cardsFor(member: Member): PersonCard[] {
  const own = transactions.filter((t) => t.cardholder === member.name);
  const last4 = own[0]?.cardLast4 ?? member.id.length.toString().padStart(4, "1");
  const merchants = [...new Set(own.map((t) => t.merchant))];
  const fallback = ["Travel", "Software", "Team meals"];
  const cards: PersonCard[] = [];
  for (let i = 0; i < member.cards; i += 1) {
    if (i === 0) {
      cards.push({ name: "Physical card", kind: "Physical", last4, limit: 5000, spent: Math.min(member.spendThisMonth * 0.4, 4800) });
    } else {
      const name = merchants[i - 1] ?? fallback[(i - 1) % fallback.length];
      const spent = own.filter((t) => t.merchant === name).reduce((sum, t) => sum + t.amount, 0);
      cards.push({
        name: `${name} card`,
        kind: "Virtual",
        last4: String((Number(last4) * (i + 3)) % 10000).padStart(4, "0"),
        limit: Math.max(1000, Math.ceil((spent * 1.6) / 500) * 500),
        spent,
      });
    }
  }
  return cards;
}

export function PersonDrawer({ member: m, onClose }: { member: Member | null; onClose: () => void }) {
  const { update, resend, remove } = useCompany();
  const toast = useToast();

  return (
    <Drawer open={!!m} onClose={onClose} title="Person">
      {m && (
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar name={m.name} size={48} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[20px] leading-tight tracking-[-0.01em] text-ink">{m.name}</div>
              <div className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-ink-2">
                <Mail className="size-3.5 stroke-[1.5]" />
                {m.email}
              </div>
            </div>
            {m.status === "Active" ? <Status tone="success">Active</Status> : <Status tone="pending">Invited</Status>}
          </div>

          <div className="mt-6 grid grid-cols-2 border-y border-line">
            <Stat label="Spend this month" value={formatMoney(m.spendThisMonth)} size="md" className="py-4 pr-4" />
            <Stat label="Active cards" value={m.cards} size="md" className="border-l border-line py-4 pl-5" />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <Field label="Role" hint={roleDescriptions[m.role]}>
              <Select
                variant="field"
                label="Role"
                value={m.role}
                options={roleOptions}
                onChange={(role) => {
                  update(m.id, { role: role as Person["role"] });
                  toast.show(`${m.name.split(" ")[0]}’s role updated to ${role}`);
                }}
                placeholder="Select role"
              />
            </Field>
            <Field label="Manager">
              <Select
                variant="field"
                label="Manager"
                value={m.manager ?? null}
                options={managerOptions.filter((option) => option.value !== m.name)}
                onChange={(manager) => {
                  update(m.id, { manager });
                  toast.show(`Manager updated to ${manager}`);
                }}
                placeholder="No manager"
              />
            </Field>
          </div>

          <h3 className="mt-7 mb-1 text-[13px] text-ink">Profile</h3>
          <DetailRow label="Title">{m.title}</DetailRow>
          <DetailRow label="Department">{m.department}</DetailRow>
          <DetailRow label="Location">{m.location}</DetailRow>
          <DetailRow label={m.status === "Invited" ? "Invited" : "Joined"}>{formatDateLong(m.since)}</DetailRow>

          <h3 className="mt-7 mb-2 flex items-center justify-between text-[13px] text-ink">
            Cards
            <Link href="/cards?new=1" className="text-[12px] text-ink-2 underline decoration-ink-4 underline-offset-2 hover:text-ink">
              Issue card
            </Link>
          </h3>
          {m.cards === 0 ? (
            <div className="flex flex-col items-center gap-2 border border-dashed border-line-strong bg-subtle py-7 text-center">
              <CreditCard className="size-5 stroke-[1.25] text-ink-4" />
              <p className="text-[13px] text-ink-2">{m.status === "Invited" ? "Cards can be issued once they join" : "No cards yet"}</p>
            </div>
          ) : (
            <ul className="border-t border-line">
              {cardsFor(m).map((card) => (
                <li key={card.name} className="flex items-center gap-3 border-b border-line-soft py-3">
                  <span className="flex h-6 w-9 shrink-0 items-end justify-end rounded-[3px] bg-ink p-1">
                    <span className="h-1 w-2.5 rounded-[1px] bg-ink-3" />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-[13px] text-ink">{card.name}</div>
                    <div className="mt-0.5 text-[11px] text-ink-2">
                      {card.kind} ···· {card.last4}
                    </div>
                  </div>
                  <div className="w-[132px] shrink-0">
                    <div className="mb-1 text-right text-[11px] text-ink-2 tabular">
                      {formatMoney(card.spent)} <span className="text-ink-3">/ {formatMoney(card.limit).replace(".00", "")}</span>
                    </div>
                    <Progress value={card.spent} max={card.limit} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex gap-2">
            {m.status === "Invited" ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    resend(m.id);
                    toast.show(`Invite resent to ${m.email}`);
                  }}
                >
                  Resend invite
                </Button>
                <Button variant="danger" onClick={() => { onClose(); remove(m.id); toast.show(`Invite for ${m.name} revoked`, "neutral"); }}>
                  Revoke invite
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onClose}>Close</Button>
                <Button variant="danger" onClick={() => toast.show(`Deactivation scheduled for ${m.name}. Their cards will be locked.`, "neutral")}>
                  Deactivate
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
