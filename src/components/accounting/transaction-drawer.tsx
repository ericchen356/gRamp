"use client";

import { Paperclip, Receipt } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { DetailRow } from "@/components/ui/stat";
import type { AccountingStatus, Transaction } from "@/data/transactions";
import { formatDateLong, formatMoney } from "@/lib/format";

/** Right-hand transaction detail sheet opened from accounting rows. */
export function TransactionDrawer({
  transaction: t,
  onClose,
  onMove,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onMove: (ids: string[], status: AccountingStatus, message: string) => void;
}) {
  return (
    <Drawer open={!!t} onClose={onClose} title="Transaction">
      {t && (
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <MerchantLogo name={t.merchant} size={40} />
            <div>
              <div className="text-[16px] text-ink">{t.merchant}</div>
              <div className="text-[12px] text-ink-2">{t.category}</div>
            </div>
            {t.flagged && (
              <Tag tone="danger" className="ml-auto">
                Flagged
              </Tag>
            )}
          </div>

          <div className="mt-6 text-[36px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(t.amount)}</div>
          <div className="mt-2 text-[13px] text-ink-2">
            {formatDateLong(t.date)} · {t.pending ? "Pending" : "Cleared"}
          </div>

          <div className="mt-6 flex items-center gap-3 border-y border-line py-3">
            <Avatar name={t.cardholder} size={28} />
            <div className="text-[13px]">
              <div className="text-ink">{t.cardholder}</div>
              <div className="text-ink-2">Physical card ···· {t.cardLast4}</div>
            </div>
          </div>

          <h3 className="mt-6 mb-1 text-[13px] text-ink">Accounting</h3>
          <DetailRow label="GL account">{t.glAccount}</DetailRow>
          <DetailRow label="QuickBooks Department">{t.department}</DetailRow>
          <DetailRow label="QuickBooks Class">{t.location}</DetailRow>
          <DetailRow label="QuickBooks Job">{t.job ?? "—"}</DetailRow>
          <DetailRow label="Billable">{t.billable ? "Yes" : "No"}</DetailRow>

          <h3 className="mt-6 mb-2 text-[13px] text-ink">Receipt</h3>
          {t.missing?.includes("receipt") ? (
            <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-subtle py-8 text-center">
              <Receipt className="size-6 stroke-[1.25] text-ink-4" />
              <p className="text-[13px] text-ink-2">Receipt missing</p>
              <Button size="xs" onClick={() => onMove([t.id], t.status, `Receipt request sent to ${t.cardholder}`)}>
                Request from {t.cardholder.split(" ")[0]}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border border-line px-3 py-2.5 text-[13px] text-ink-1">
              <Paperclip className="size-4 stroke-[1.5] text-ink-2" />
              receipt_{t.merchant.toLowerCase().replace(/\s+/g, "_")}.pdf
            </div>
          )}

          <h3 className="mt-6 mb-2 text-[13px] text-ink">Memo</h3>
          <p className="text-[13px] text-ink-2">
            {t.missing?.includes("memo") ? "No memo provided" : (t.memo ?? `Team expense — ${t.department.toLowerCase()}`)}
          </p>

          <div className="mt-8 flex gap-2">
            {t.status === "needs_review" && (
              <Button variant="primary" onClick={() => { onMove([t.id], "ready_to_sync", "Transaction successfully updated"); onClose(); }}>
                Mark ready to sync
              </Button>
            )}
            {t.status === "ready_to_sync" && (
              <Button variant="primary" onClick={() => { onMove([t.id], "synced", "Transaction synced to QuickBooks"); onClose(); }}>
                Sync now
              </Button>
            )}
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
