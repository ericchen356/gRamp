"use client";

import { Car, Check, FileWarning, Paperclip, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, IconButton } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuItem, MenuLabel } from "@/components/ui/popover";
import { DetailRow, Stat } from "@/components/ui/stat";
import { CellStack, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { FilterChip } from "@/components/ui/toolbar";
import { reimbursementStatusLabels, type Reimbursement, type ReimbursementStatus } from "@/data/expenses";
import { people } from "@/data/people";
import { formatDate, formatDateLong, formatMoney, pluralize } from "@/lib/format";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { ReimbursementTag } from "./expense-status";
import { useExpenses } from "./expenses-store";

const statuses: ReimbursementStatus[] = ["pending", "needs_info", "approved", "paid", "rejected"];

function MerchantMark({ r, size = 30 }: { r: Reimbursement; size?: number }) {
  if (r.type === "Mileage") {
    return (
      <span style={{ width: size, height: size }} className="inline-flex shrink-0 items-center justify-center rounded-full bg-chip text-ink-1">
        <Car className="size-[15px] stroke-[1.5]" />
      </span>
    );
  }
  return <MerchantLogo name={r.merchant} size={size} />;
}

/** Expenses › Reimbursements: out-of-pocket, mileage and per diem claims. */
export function ReimbursementsTable() {
  const { reimbursements, updateReimbursement } = useExpenses();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReimbursementStatus | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reimbursements.filter(
      (r) =>
        (!status || r.status === status) &&
        (!q || `${r.employee} ${r.merchant} ${r.memo} ${r.category} ${r.approver}`.toLowerCase().includes(q)),
    );
  }, [reimbursements, status, query]);

  const sum = (list: Reimbursement[]) => list.reduce((total, r) => total + r.amount, 0);
  const awaiting = reimbursements.filter((r) => r.status === "pending" || r.status === "needs_info");
  const toPay = reimbursements.filter((r) => r.status === "approved");
  const paid = reimbursements.filter((r) => r.status === "paid");
  const open = reimbursements.find((r) => r.id === openId) ?? null;

  const decide = (r: Reimbursement, next: ReimbursementStatus) => {
    updateReimbursement(r.id, { status: next });
    toast.show(
      next === "approved"
        ? `Approved ${formatMoney(r.amount)} for ${r.employee}`
        : next === "rejected"
          ? `Rejected reimbursement from ${r.employee}`
          : `${r.employee} was paid ${formatMoney(r.amount)}`,
      next === "rejected" ? "neutral" : "success",
    );
  };

  return (
    <>
      <section className="flex gap-[66px] px-page pt-9 pb-10">
        <Stat label="Awaiting approval" value={formatMoney(sum(awaiting))} caption={pluralize(awaiting.length, "request")} size="md" />
        <Stat label="Approved, not yet paid" value={formatMoney(sum(toPay))} caption="Next ACH batch Oct 3" size="md" />
        <Stat label="Paid in the last 30 days" value={formatMoney(sum(paid))} caption={pluralize(paid.length, "reimbursement")} size="md" tone="money" />
      </section>

      <DataToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search employees, merchants, memos..."
        filterCount={status ? 1 : 0}
        onClearFilters={() => setStatus(null)}
        options={[
          { label: "Export CSV", onSelect: () => toast.show("Export started. We'll email you the CSV.", "neutral") },
          { label: "Reimbursement settings", onSelect: () => toast.show("Opening reimbursement settings", "neutral") },
        ]}
        chips={status && <FilterChip label="Status" value={reimbursementStatusLabels[status]} onRemove={() => setStatus(null)} />}
        filterMenu={(close) => (
          <>
            <MenuLabel>Status</MenuLabel>
            {statuses.map((value) => (
              <MenuItem
                key={value}
                selected={status === value}
                onSelect={() => {
                  setStatus(value);
                  close();
                }}
              >
                {reimbursementStatusLabels[value]}
              </MenuItem>
            ))}
          </>
        )}
      />

      <Table className="border-t border-line" minWidth={1240}>
        <THead>
          <tr>
            <Th className="w-[200px]">Employee</Th>
            <Th className="w-[118px]">Type</Th>
            <Th>Merchant</Th>
            <Th className="w-[120px]" align="right">
              Amount
            </Th>
            <Th className="w-[110px]" sort="desc">
              Submitted
            </Th>
            <Th className="w-[160px]">Status</Th>
            <Th className="w-[168px]">Approver</Th>
            <Th className="w-[148px]">Actions</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((r) => {
            const person = people.find((p) => p.name === r.employee);
            return (
              <Tr key={r.id} onClick={() => setOpenId(r.id)}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={r.employee} size={28} />
                    <CellStack primary={<span className="text-[13px]">{r.employee}</span>} secondary={person?.department} />
                  </div>
                </Td>
                <Td className="whitespace-nowrap">{r.type}</Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <MerchantMark r={r} />
                    <CellStack
                      primary={<span className="text-[13px]">{r.merchant}</span>}
                      secondary={r.type === "Mileage" ? `${r.miles} mi · ${r.memo}` : r.memo}
                    />
                  </div>
                </Td>
                <Td align="right" className="text-ink">
                  {formatMoney(r.amount)}
                </Td>
                <Td className="text-ink-2">{formatDate(r.submitted)}</Td>
                <Td>
                  <ReimbursementTag status={r.status} />
                </Td>
                <Td>
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={r.approver} size={22} />
                    <span className="truncate">{r.approver}</span>
                  </span>
                </Td>
                <Td onClick={(event) => event.stopPropagation()}>
                  {r.status === "pending" || r.status === "needs_info" ? (
                    <span className="flex items-center gap-1.5">
                      <Button size="xs" variant="approve" onClick={() => decide(r, "approved")} className="gap-1">
                        <Check className="size-3 stroke-[2]" />
                        Approve
                      </Button>
                      <IconButton size="sm" variant="bare" label="Reject" onClick={() => decide(r, "rejected")}>
                        <X />
                      </IconButton>
                    </span>
                  ) : r.status === "approved" ? (
                    <Button size="xs" onClick={() => decide(r, "paid")}>
                      Pay now
                    </Button>
                  ) : (
                    <span className="text-[12px] text-ink-3">{r.status === "paid" ? "Paid via ACH" : "Closed"}</span>
                  )}
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <FileWarning className="size-7 stroke-[1.25] text-ink-4" />
          <p className="mt-3 text-[15px] text-ink">No reimbursements</p>
          <p className="mt-1 text-[13px] text-ink-2">Nothing matches the current filters.</p>
        </div>
      )}

      <div className="flex-1" />
      <TableFooter
        right={
          <>
            <span>{pluralize(rows.length, "reimbursement")}</span>
            <span>·</span>
            <span>{formatMoney(sum(rows))} USD</span>
          </>
        }
      />

      <Drawer open={!!open} onClose={() => setOpenId(null)} title="Reimbursement">
        {open && (
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <MerchantMark r={open} size={40} />
              <div className="min-w-0">
                <div className="truncate text-[16px] text-ink">{open.merchant}</div>
                <div className="text-[12px] text-ink-2">
                  {open.type} · {open.category}
                </div>
              </div>
              <span className="ml-auto">
                <ReimbursementTag status={open.status} />
              </span>
            </div>
            <div className="mt-6 text-[36px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(open.amount)}</div>
            <div className="mt-2 text-[13px] text-ink-2">
              Spent {formatDateLong(open.spent)} · Submitted {formatDateLong(open.submitted)}
            </div>

            <div className="mt-6 flex items-center gap-3 border-y border-line py-3">
              <Avatar name={open.employee} size={28} />
              <div className="text-[13px]">
                <div className="text-ink">{open.employee}</div>
                <div className="text-ink-2">Paid to personal account ···· 6610</div>
              </div>
            </div>

            <h3 className="mt-6 mb-1 text-[13px] text-ink">Details</h3>
            <DetailRow label="Memo">{open.memo}</DetailRow>
            {open.miles && <DetailRow label="Distance">{open.miles} mi at $0.70/mi</DetailRow>}
            <DetailRow label="Approver">{open.approver}</DetailRow>
            <DetailRow label="Payout">Next business day ACH</DetailRow>

            {open.type === "Out-of-pocket" && (
              <>
                <h3 className="mt-6 mb-2 text-[13px] text-ink">Receipt</h3>
                <div className="flex items-center gap-2 border border-line px-3 py-2.5 text-[13px] text-ink-1">
                  <Paperclip className="size-4 stroke-[1.5] text-ink-2" />
                  receipt_{open.merchant.toLowerCase().replace(/\W+/g, "_")}.jpg
                </div>
              </>
            )}

            <div className="mt-8 flex gap-2">
              {(open.status === "pending" || open.status === "needs_info") && (
                <>
                  <Button variant="primary" onClick={() => decide(open, "approved")}>
                    Approve
                  </Button>
                  <Button variant="danger" onClick={() => decide(open, "rejected")}>
                    Reject
                  </Button>
                </>
              )}
              {open.status === "approved" && (
                <Button variant="primary" onClick={() => decide(open, "paid")}>
                  Pay now
                </Button>
              )}
              <Button variant="ghost" className="ml-auto" onClick={() => setOpenId(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
