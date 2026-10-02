"use client";

import { Copy, CreditCard, Eye, EyeOff, Gauge, Lock, LockOpen, MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { SectionHeading, PageHeader } from "@/components/ui/page-header";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { DetailRow, Progress } from "@/components/ui/stat";
import { Switch } from "@/components/ui/checkbox";
import { EmptyState, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { ExpenseStatusDot, ReceiptIcon } from "@/components/expenses/expense-status";
import { merchantCategories, type RampCard } from "@/data/cards";
import { cardExpenses } from "@/data/expenses";
import { people } from "@/data/people";
import { formatDate, formatDateLong, formatMoney, formatMoneyWhole } from "@/lib/format";
import { useCardActions } from "./card-actions";
import { CardStatusDot } from "./card-status";
import { CardVisual } from "./card-visual";
import { useCards } from "./cards-store";
import { EditLimitDialog } from "./edit-limit-dialog";

const DEFAULT_BLOCKED = ["Gambling"];

function allowedSet(card: RampCard) {
  return new Set(card.allowedCategories ?? merchantCategories.map((c) => c.id).filter((id) => !DEFAULT_BLOCKED.includes(id)));
}

const resetLabel: Record<RampCard["frequency"], string> = {
  Monthly: "Resets Nov 1",
  Quarterly: "Resets Jan 1",
  Yearly: "Resets Jan 1, 2027",
  "One-time": "Does not reset",
};

/** /cards/[id]: card art, limit, merchant controls and recent transactions. */
export function CardDetail({ id }: { id: string }) {
  const { cards } = useCards();
  const card = cards.find((c) => c.id === id);

  if (!card) {
    return (
      <EmptyState
        icon={<CreditCard />}
        title="Card not found"
        description="This card may have been terminated or you may not have access to it."
        action={
          <Link href="/cards" className="text-[13px] text-ink underline underline-offset-2">
            Back to cards
          </Link>
        }
      />
    );
  }
  return <CardDetailView card={card} />;
}

function CardDetailView({ card }: { card: RampCard }) {
  const { updateCard } = useCards();
  const toast = useToast();
  const { locked, toggleLock, terminate, confirmDialog } = useCardActions(card);
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const allowed = allowedSet(card);
  const terminated = card.status === "terminated";
  const transactions = cardExpenses.filter((t) => t.cardLast4 === card.last4).sort((a, b) => b.date.localeCompare(a.date));
  const holder = people.find((p) => p.name === card.cardholder);
  const available = Math.max(0, card.limit - card.spent);
  const number = `4291 8830 1027 ${card.last4}`;

  const toggleCategory = (category: string, on: boolean) => {
    const next = new Set(allowed);
    if (on) next.add(category);
    else next.delete(category);
    updateCard(card.id, { allowedCategories: merchantCategories.map((c) => c.id).filter((c) => next.has(c)) });
    toast.show(`${category} ${on ? "allowed" : "blocked"} on ···· ${card.last4}`, on ? "success" : "neutral");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Funds & cards"
        eyebrowHref="/cards"
        title={card.name}
        actions={
          !terminated && (
            <>
              <Popover
                align="end"
                trigger={({ toggle }) => (
                  <IconButton variant="bare" label="More actions" onClick={toggle} className="mr-1.5 [&_svg]:size-[18px]">
                    <MoreVertical />
                  </IconButton>
                )}
              >
                {(close) => (
                  <>
                    <MenuItem icon={<RefreshCw />} onSelect={() => { close(); toast.show(`Replacement for ···· ${card.last4} ordered`, "neutral"); }}>
                      Replace card
                    </MenuItem>
                    <MenuItem icon={<Copy />} onSelect={() => { close(); toast.show("Card number copied", "neutral"); }}>
                      Copy card number
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<Trash2 />} destructive onSelect={() => { close(); terminate(); }}>
                      Terminate card
                    </MenuItem>
                  </>
                )}
              </Popover>
              <Button size="lg" onClick={toggleLock} className="gap-2">
                {locked ? <LockOpen className="size-4 stroke-[1.5]" /> : <Lock className="size-4 stroke-[1.5]" />}
                {locked ? "Unlock card" : "Lock card"}
              </Button>
              <Button size="lg" variant="primary" onClick={() => setEditing(true)} className="gap-2">
                <Gauge className="size-4 stroke-[1.5]" />
                Edit limit
              </Button>
            </>
          )
        }
      />
      <div className="mt-3 flex items-center gap-3 border-b border-line px-page pb-6 text-[14px] text-ink-2">
        <span>{card.type === "virtual" ? "Virtual" : "Physical"} card</span>
        <span className="text-ink-4">·</span>
        <span className="tabular">···· {card.last4}</span>
        <span className="text-ink-4">·</span>
        <CardStatusDot status={card.status} />
      </div>

      <div className="grid grid-cols-[344px_minmax(0,1fr)] gap-16 px-page pt-10 pb-12">
        <div>
          <CardVisual
            size="lg"
            type={card.type}
            last4={card.last4}
            cardholder={card.cardholder}
            name={card.name}
            expires={card.expires}
            locked={locked}
          />
          <div className="mt-4 flex items-center justify-between border border-line px-4 py-3">
            <div className="text-[13px] leading-tight">
              <div className="text-ink tabular tracking-[0.04em]">{revealed ? number : `•••• •••• •••• ${card.last4}`}</div>
              <div className="mt-1 text-[12px] text-ink-2 tabular">
                Exp {card.expires} · CVC {revealed ? "418" : "•••"}
              </div>
            </div>
            <div className="flex gap-1">
              <IconButton variant="bare" size="sm" label={revealed ? "Hide details" : "Show details"} onClick={() => setRevealed((v) => !v)}>
                {revealed ? <EyeOff /> : <Eye />}
              </IconButton>
              <IconButton variant="bare" size="sm" label="Copy card number" onClick={() => toast.show("Card number copied", "neutral")}>
                <Copy />
              </IconButton>
            </div>
          </div>

          <div className="mt-6">
            <DetailRow label="Cardholder">
              <span className="inline-flex items-center gap-2">
                <Avatar name={card.cardholder} size={20} />
                {card.cardholder}
              </span>
            </DetailRow>
            <DetailRow label="Department">{holder?.department ?? "—"}</DetailRow>
            <DetailRow label="Spend program">{card.program ?? "None"}</DetailRow>
            <DetailRow label="Issued">{formatDateLong(card.issued)}</DetailRow>
            <DetailRow label="Billing address">
              <span className="block">100 Congress Ave, Suite 2000</span>
              <span className="block">Austin, TX 78701</span>
            </DetailRow>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-[12px] text-ink-2">Spent this {card.frequency === "One-time" ? "period" : card.frequency.replace("ly", "").toLowerCase()}</div>
              <div className="mt-1 text-[40px] leading-[1.05] tracking-[-0.025em] text-ink tabular">{formatMoney(card.spent)}</div>
            </div>
            <div className="pb-1 text-right text-[13px] leading-snug">
              <div className="text-ink tabular">{formatMoney(available)} available</div>
              <div className="text-ink-2">
                {formatMoneyWhole(card.limit)} {card.frequency.toLowerCase()} limit · {resetLabel[card.frequency]}
              </div>
            </div>
          </div>
          <Progress value={card.spent} max={card.limit} tone={card.spent / card.limit >= 0.9 ? "warning" : "ink"} className="mt-4 h-1.5" />

          <SectionHeading size="md" className="mt-12">
            Merchant controls
          </SectionHeading>
          <p className="mt-1.5 text-[13px] text-ink-2">
            Purchases outside allowed categories are declined at the point of sale.
          </p>
          <div className="mt-4 divide-y divide-line-soft border-y border-line">
            {merchantCategories.map((category) => {
              const on = allowed.has(category.id);
              return (
                <div key={category.id} className="flex items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className={on ? "text-[14px] text-ink" : "text-[14px] text-ink-3"}>{category.id}</div>
                    <div className="mt-0.5 text-[12px] text-ink-2">{category.description}</div>
                  </div>
                  <span className="w-[64px] text-right text-[12px] text-ink-3">{on ? "Allowed" : "Blocked"}</span>
                  <Switch label={`Allow ${category.id}`} checked={on} onChange={(next) => toggleCategory(category.id, next)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="border-t border-line pt-9">
        <SectionHeading size="md" className="px-page">
          Recent transactions
        </SectionHeading>
        {transactions.length ? (
          <Table className="mt-5 border-t border-line" minWidth={980}>
            <THead>
              <tr>
                <Th>Merchant</Th>
                <Th className="w-[140px]" align="right">
                  Amount
                </Th>
                <Th className="w-[110px]" sort="desc">
                  Date
                </Th>
                <Th className="w-[90px]" align="center">
                  Receipt
                </Th>
                <Th className="w-[300px]">Memo</Th>
                <Th className="w-[170px]">Status</Th>
              </tr>
            </THead>
            <TBody>
              {transactions.map((t) => (
                <Tr key={t.id} interactive={false}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <MerchantLogo name={t.merchant} size={30} />
                      <div className="min-w-0 leading-tight">
                        <div className="truncate text-[13px] text-ink">{t.merchant}</div>
                        <div className="mt-0.5 truncate text-[11px] text-ink-2">{t.category}</div>
                      </div>
                    </div>
                  </Td>
                  <Td align="right" className="text-ink">
                    {formatMoney(t.amount)}
                  </Td>
                  <Td className="text-ink-2">{formatDate(t.date)}</Td>
                  <Td align="center">
                    <ReceiptIcon state={t.receipt} />
                  </Td>
                  <Td className="max-w-[300px] truncate">{t.memo ?? <span className="text-ink-4">No memo</span>}</Td>
                  <Td>
                    <ExpenseStatusDot status={t.expenseStatus} />
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState icon={<CreditCard />} title="No transactions yet" description="Purchases made with this card will show up here." />
        )}
      </section>

      <EditLimitDialog card={editing ? card : null} onClose={() => setEditing(false)} />
      {confirmDialog}
    </div>
  );
}
