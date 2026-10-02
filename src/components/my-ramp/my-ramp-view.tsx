"use client";

import { Eye, EyeOff, Lock, LockOpen, Plus, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/stat";
import { CellStack, Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  attentionItems,
  myCards,
  myReimbursements,
  myTransactions,
  type MyCard,
  type Reimbursement,
  type ReimbursementStatus,
} from "@/data/my-ramp";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney } from "@/lib/format";
import { CardVisual } from "./card-visual";
import { ReceiptDropzone } from "./receipt-dropzone";
import { ReimbursementDialog } from "./reimbursement-dialog";

const reimbursementStatus: Record<ReimbursementStatus, { tone: "success" | "warning" | "danger" | "neutral" | "info" | "pending"; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  pending: { tone: "pending", label: "Pending approval" },
  approved: { tone: "info", label: "Approved" },
  paid: { tone: "success", label: "Paid" },
  rejected: { tone: "danger", label: "Rejected" },
};

const cardName = (last4: string) => myCards.find((c) => c.last4 === last4)?.name ?? "Card";

function CardTile({ card, onToggleLock }: { card: MyCard; onToggleLock: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const pct = card.spent / card.limit;
  return (
    <div className="min-w-0">
      <CardVisual card={card} revealed={revealed} />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[15px] text-ink">{card.kind === "Physical" ? "Physical card" : card.name}</div>
          <div className="mt-1 truncate text-[12px] text-ink-2">
            {card.kind} · •• {card.last4}
            {card.merchantLock && ` · ${card.merchantLock} only`}
          </div>
        </div>
        {card.status === "Locked" ? <Tag tone="neutral">Locked</Tag> : <Tag tone="success">Active</Tag>}
      </div>
      <Progress value={card.spent} max={card.limit} tone={pct > 0.75 ? "warning" : "ink"} className="mt-3.5" />
      <div className="mt-2 flex justify-between text-[12px] text-ink-2 tabular">
        <span>
          <span className="text-ink">{formatMoney(card.spent)}</span> spent
        </span>
        <span>
          {formatMoney(card.limit)} {card.interval.toLowerCase()}
        </span>
      </div>
      <div className="mt-3.5 flex gap-1.5">
        <Button size="xs" variant="ghost" className="-ml-2.5" onClick={() => setRevealed((v) => !v)}>
          {revealed ? <EyeOff className="size-3.5 stroke-[1.5]" /> : <Eye className="size-3.5 stroke-[1.5]" />}
          {revealed ? "Hide number" : "Show number"}
        </Button>
        <Button size="xs" variant="ghost" onClick={onToggleLock}>
          {card.status === "Locked" ? <LockOpen className="size-3.5 stroke-[1.5]" /> : <Lock className="size-3.5 stroke-[1.5]" />}
          {card.status === "Locked" ? "Unlock" : "Lock"}
        </Button>
      </div>
    </div>
  );
}

/** Personal view for the signed-in cardholder: cards, to-dos, activity and reimbursements. */
export function MyRampView({ openNewReimbursement = false }: { openNewReimbursement?: boolean }) {
  const toast = useToast();
  const [cards, setCards] = useState(myCards);
  const [attention, setAttention] = useState(attentionItems);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [receipts, setReceipts] = useState<Set<string>>(new Set());
  const [reimbursements, setReimbursements] = useState(myReimbursements);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Deep link from Home (`?new=reimbursement`). The dialog portals into
  // document.body, so it can only open after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (openNewReimbursement) setDialogOpen(true);
  }, [openNewReimbursement]);

  const toggleLock = (card: MyCard) => {
    const locked = card.status !== "Locked";
    setCards((current) => current.map((c) => (c.id === card.id ? { ...c, status: locked ? "Locked" : "Active" } : c)));
    toast.show(`${card.kind === "Physical" ? "Physical card" : card.name} ${locked ? "locked" : "unlocked"} · •• ${card.last4}`, "neutral");
  };

  const receiptUploaded = (id: string, merchant: string, date: string) => {
    setReceipts((current) => new Set(current).add(`${merchant}-${date}`));
    setLeaving((current) => new Set(current).add(id));
    window.setTimeout(() => setAttention((current) => current.filter((item) => item.id !== id)), 260);
    toast.show(`Receipt added to ${merchant} transaction`);
  };

  const pendingTotal = reimbursements.filter((r) => r.status === "pending" || r.status === "approved").reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <PageHeader
        title="My Ramp"
        actions={
          <>
            <Button size="lg" onClick={() => toast.show("Card request sent to Tina Cruz", "neutral")}>
              Request card
            </Button>
            <Button size="lg" variant="primary" onClick={() => setDialogOpen(true)}>
              New reimbursement
            </Button>
          </>
        }
      />

      <section className="px-page pt-12">
        <SectionHeading
          size="md"
          actions={
            <button type="button" onClick={() => toast.show("Card settings opened", "neutral")} className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink">
              <Settings2 className="size-3.5 stroke-[1.5]" />
              Manage cards
            </button>
          }
        >
          My cards
        </SectionHeading>
        <div className="mt-5 grid grid-cols-4 gap-8">
          {cards.map((card) => (
            <CardTile key={card.id} card={card} onToggleLock={() => toggleLock(card)} />
          ))}
          <button
            type="button"
            onClick={() => toast.show("Card request sent to Tina Cruz", "neutral")}
            className="flex aspect-[1.586] w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-line-strong text-[13px] text-ink-2 transition-colors hover:border-ink-4 hover:bg-subtle hover:text-ink"
          >
            <Plus className="size-5 stroke-[1.5]" />
            Request a new card
          </button>
        </div>
      </section>

      <section id="attention" className="scroll-mt-6 pt-14">
        <SectionHeading size="md" className="px-page">
          Items needing your attention <span className="text-ink-3 tabular">({attention.length})</span>
        </SectionHeading>
        {attention.length === 0 ? (
          <p className="mx-page mt-4 border border-line bg-subtle px-5 py-4 text-[13px] text-ink-2">
            You’re all set — every transaction has its receipt and memo.
          </p>
        ) : (
          <ul className="mt-4 border-t border-line">
            {attention.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-4 border-b border-line-soft py-3 pr-page pl-page transition-[opacity,transform] duration-200",
                  leaving.has(item.id) && "-translate-y-1 opacity-0",
                )}
              >
                <MerchantLogo name={item.merchant} size={32} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[14px] text-ink">{item.merchant}</div>
                  <div className="mt-0.5 text-[12px] text-ink-2">
                    {formatDate(item.date)} · {cardName(item.card)} •• {item.card}
                  </div>
                </div>
                <Tag tone="warning">Missing receipt</Tag>
                <span className="w-[110px] text-right text-[14px] text-ink tabular">{formatMoney(item.amount)}</span>
                <ReceiptDropzone compact className="w-[300px]" onComplete={() => receiptUploaded(item.id, item.merchant, item.date)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pt-14">
        <SectionHeading size="md" className="px-page" actions={<span className="ml-auto text-[13px] text-ink-2">Last 30 days</span>}>
          My transactions
        </SectionHeading>
        <Table className="mt-4 border-t border-line" minWidth={980}>
          <THead>
            <tr>
              <Th className="w-[28%]">Merchant</Th>
              <Th className="w-[18%]">Card</Th>
              <Th className="w-[10%]">Date</Th>
              <Th className="w-[12%]">Receipt</Th>
              <Th>Memo</Th>
              <Th className="w-[130px]" align="right">
                Amount
              </Th>
            </tr>
          </THead>
          <TBody>
            {myTransactions.map((t) => {
              const hasReceipt = t.receipt || receipts.has(`${t.merchant}-${t.date}`);
              return (
                <Tr key={t.id} onClick={() => toast.show(`${t.merchant} · ${formatMoney(t.amount)}`, "neutral")}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <MerchantLogo name={t.merchant} size={30} />
                      <CellStack primary={t.merchant} secondary={t.pending ? "Pending" : t.category} />
                    </div>
                  </Td>
                  <Td>
                    <CellStack primary={<span className="text-[13px]">{cardName(t.card)}</span>} secondary={`•• ${t.card}`} />
                  </Td>
                  <Td className="text-ink-2">{formatDate(t.date)}</Td>
                  <Td>{hasReceipt ? <Status tone="success">Attached</Status> : <Status tone="warning">Missing</Status>}</Td>
                  <Td className={cn("max-w-0 truncate", !t.memo && "text-ink-4")}>{t.memo ?? "Add memo"}</Td>
                  <Td align="right" className="text-[14px] text-ink">
                    {formatMoney(t.amount)}
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </section>

      <section className="pt-14">
        <SectionHeading
          size="md"
          className="px-page"
          actions={
            <span className="ml-auto text-[13px] text-ink-2">
              <span className="text-ink tabular">{formatMoney(pendingTotal)}</span> on the way
            </span>
          }
        >
          My reimbursements
        </SectionHeading>
        <Table className="mt-4 border-t border-line" minWidth={980}>
          <THead>
            <tr>
              <Th className="w-[28%]">Expense</Th>
              <Th className="w-[18%]">Category</Th>
              <Th className="w-[10%]">Date</Th>
              <Th className="w-[12%]">Approver</Th>
              <Th>Status</Th>
              <Th className="w-[130px]" align="right">
                Amount
              </Th>
            </tr>
          </THead>
          <TBody>
            {reimbursements.map((r) => (
              <Tr key={r.id} onClick={() => toast.show(`${r.merchant} · ${reimbursementStatus[r.status].label}`, "neutral")}>
                <Td>
                  <div className="flex items-center gap-3">
                    <MerchantLogo name={r.merchant} size={30} />
                    <CellStack primary={r.merchant} secondary={r.description} />
                  </div>
                </Td>
                <Td>{r.category}</Td>
                <Td className="text-ink-2">{formatDate(r.date)}</Td>
                <Td>{r.approver}</Td>
                <Td>
                  <Status tone={reimbursementStatus[r.status].tone}>{reimbursementStatus[r.status].label}</Status>
                </Td>
                <Td align="right" className="text-[14px] text-ink">
                  {formatMoney(r.amount)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </section>

      <ReimbursementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={(reimbursement: Reimbursement) => {
          setReimbursements((current) => [reimbursement, ...current]);
          toast.show(`Reimbursement for ${formatMoney(reimbursement.amount)} submitted to ${reimbursement.approver}`);
        }}
      />
    </div>
  );
}
