"use client";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Columns3,
  FileWarning,
  ListFilter,
  Rows3,
  UserX,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { Status, Tag } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuItem, Popover } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { AddFilterButton, LockedFilter, SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { quickbooks, type AccountingStatus, type Transaction } from "@/data/transactions";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney } from "@/lib/format";
import { useAccounting } from "./accounting-store";
import { TransactionDrawer } from "./transaction-drawer";

const statusLabels: Record<AccountingStatus, string> = {
  needs_review: "Needs review",
  ready_to_sync: "Ready to sync",
  waiting: "Waiting for cardholder",
  synced: "Synced",
};

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

type Props = {
  /** Tab filter; omit for the Overview tab (all statuses). */
  status?: AccountingStatus;
};

/** Merchant cell: logo, name, "Flagged · Category" and the trailing state icon. */
function MerchantCell({ transaction }: { transaction: Transaction }) {
  const StateIcon = transaction.pending ? Clock3 : transaction.missing?.length ? UserX : null;
  return (
    <div className="flex items-center gap-3">
      <MerchantLogo name={transaction.merchant} size={30} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[13px] text-ink">{transaction.merchant}</div>
        <div className="mt-0.5 truncate text-[11px] text-ink-2">
          {transaction.flagged && <span className="text-flag">Flagged</span>}
          {transaction.flagged && " · "}
          {transaction.category}
        </div>
      </div>
      {StateIcon && (
        <StateIcon
          className="size-[14px] shrink-0 stroke-[1.5] text-ink-2"
          aria-label={transaction.pending ? "Pending" : "Missing items from cardholder"}
        />
      )}
    </div>
  );
}

/** Full-bleed accounting coding table shared by every Ramp Card tab. */
export function AccountingTable({ status }: Props) {
  const { transactions, setStatus, update } = useAccounting();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        (!status || t.status === status) &&
        (!q || `${t.merchant} ${t.category} ${t.cardholder} ${t.department}`.toLowerCase().includes(q)),
    );
  }, [transactions, status, query]);

  const total = rows.reduce((sum, t) => sum + t.amount, 0);
  const allSelected = rows.length > 0 && rows.every((t) => selected.has(t.id));
  const someSelected = rows.some((t) => selected.has(t.id));
  const openTransaction = transactions.find((t) => t.id === openId) ?? null;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const move = (ids: string[], next: AccountingStatus, message: string) => {
    setStatus(ids, next);
    setSelected(new Set());
    toast.show(message);
  };

  const code = (t: Transaction, patch: Partial<Transaction>) => {
    update(t.id, patch);
    toast.show("Transaction successfully updated");
  };

  return (
    <>
      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} />
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-chip px-3 text-[12px] text-ink-1 hover:bg-sidebar-group"
              aria-label="1 filter applied"
            >
              <ListFilter className="size-3.5 stroke-[1.75]" />1
            </button>
            <IconButton label="Date range">
              <CalendarDays />
            </IconButton>
            <IconButton label="Row density">
              <Rows3 />
            </IconButton>
            <IconButton label="Columns">
              <Columns3 />
            </IconButton>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <Button pill size="sm" onClick={toggle} className="h-8 gap-1 pr-2.5 pl-3 text-[12px]">
                  Options
                  <ChevronDown className="size-3.5 stroke-[1.5]" />
                </Button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={close}>Export CSV</MenuItem>
                  <MenuItem onSelect={close}>Accounting settings</MenuItem>
                  <MenuItem onSelect={close}>Manage accounting rules</MenuItem>
                  <MenuItem onSelect={close}>Sync history</MenuItem>
                </>
              )}
            </Popover>
          </div>
        </ToolbarRow>
        <ToolbarRow className="min-h-0 pb-3">
          {status && <LockedFilter label="Accounting status" value={statusLabels[status]} />}
          <AddFilterButton />
        </ToolbarRow>
      </Toolbar>

      <Table className="flex-1 border-t border-line bg-canvas" minWidth={1540}>
        <THead>
          <tr>
            <Th align="center" className="sticky left-0 z-20 w-[52px] min-w-[52px] bg-canvas px-0!">
              <Checkbox
                label="Select all"
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={(checked) => setSelected(checked ? new Set(rows.map((t) => t.id)) : new Set())}
              />
            </Th>
            <Th className="sticky left-[52px] z-20 w-[212px] min-w-[212px] border-r-0 bg-canvas shadow-[inset_-1px_0_0_var(--color-line)]">
              Merchant
            </Th>
            <Th className="w-[100px]" align="right">
              Amount
            </Th>
            <Th className="w-[84px]">Date</Th>
            <Th className="w-[150px]">Cardholder</Th>
            <Th className="w-[200px]">GL Account</Th>
            <Th className="w-[234px]">QuickBooks Department</Th>
            <Th className="w-[234px]">QuickBooks Class</Th>
            <Th className="w-[234px]">QuickBooks Job</Th>
            <Th className="w-[60px] max-w-[60px] truncate border-r-0" title="Is this billable?">
              Is this...
            </Th>
            <Th className="sticky right-0 z-20 w-[156px] border-l-0 bg-canvas shadow-[inset_1px_0_0_var(--color-line)]">Actions</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((t) => {
            const isSelected = selected.has(t.id);
            const stickyBg = isSelected ? "bg-subtle" : "bg-canvas group-hover/row:bg-subtle";
            return (
              <Tr key={t.id} selected={isSelected} onClick={() => setOpenId(t.id)}>
                <Td className={cn("sticky left-0 z-10 w-[52px] min-w-[52px] px-0! text-center", stickyBg)}>
                  <Checkbox label={`Select ${t.merchant}`} checked={isSelected} onChange={() => toggle(t.id)} />
                </Td>
                <Td
                  className={cn(
                    "sticky left-[52px] z-10 w-[212px] min-w-[212px] border-r-0 pl-[14px]! shadow-[inset_-1px_0_0_var(--color-line)]",
                    stickyBg,
                  )}
                >
                  <MerchantCell transaction={t} />
                </Td>
                <Td align="right" className="text-ink">
                  {formatMoney(t.amount)}
                </Td>
                <Td className="text-ink-2">{formatDate(t.date)}</Td>
                <Td className="truncate">{t.cardholder}</Td>
                <Td onClick={(event) => event.stopPropagation()}>
                  <Select
                    label="GL account"
                    value={t.glAccount}
                    options={toOptions(quickbooks.glAccounts)}
                    onChange={(glAccount) => code(t, { glAccount })}
                    placeholder="Select account"
                    variant="cell"
                  />
                </Td>
                <Td onClick={(event) => event.stopPropagation()}>
                  {t.autoCoded ? (
                    <span className="flex items-center gap-2 text-[13px]">
                      <Zap className="size-3 shrink-0 stroke-[1.5] text-ink-2" />
                      {t.department} ( {t.autoCoded} )
                    </span>
                  ) : (
                    <Select
                      label="Department"
                      value={t.department}
                      options={toOptions(quickbooks.departments)}
                      onChange={(department) => code(t, { department })}
                      placeholder="Select department"
                      variant="cell"
                    />
                  )}
                </Td>
                <Td>{t.location}</Td>
                <Td>{t.job}</Td>
                <Td className="border-r-0 text-center" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    label="Billable"
                    checked={!!t.billable}
                    onChange={(billable) => code(t, { billable })}
                  />
                </Td>
                <Td
                  className={cn("sticky right-0 z-10 border-r-0 shadow-[inset_1px_0_0_var(--color-line)]", stickyBg)}
                  onClick={(event) => event.stopPropagation()}
                >
                  <RowAction transaction={t} onMove={move} />
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <FileWarning className="size-7 stroke-[1.25] text-ink-4" />
          <p className="mt-3 text-[15px] text-ink">Nothing here</p>
          <p className="mt-1 text-[13px] text-ink-2">No transactions match the current filters.</p>
        </div>
      )}

      <div className="flex-1" />
      <TableFooter
        left={
          someSelected ? (
            <>
              <span className="text-ink-1">{selected.size} selected</span>
              {status === "needs_review" && (
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => move([...selected], "ready_to_sync", `${selected.size} transactions marked ready to sync`)}
                >
                  Mark ready
                </Button>
              )}
              {status === "ready_to_sync" && (
                <Button size="xs" variant="primary" onClick={() => move([...selected], "synced", `${selected.size} transactions synced to QuickBooks`)}>
                  Sync now
                </Button>
              )}
              <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </>
          ) : (
            <button type="button" className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
              Select
              <ChevronDown className="size-3 stroke-[1.75]" />
            </button>
          )
        }
        right={
          <>
            <span>
              1–{rows.length} of {rows.length} transactions
            </span>
            <span>·</span>
            <span>{formatMoney(total)} USD</span>
          </>
        }
      />

      <TransactionDrawer transaction={openTransaction} onClose={() => setOpenId(null)} onMove={move} />
    </>
  );
}

function RowAction({
  transaction: t,
  onMove,
}: {
  transaction: Transaction;
  onMove: (ids: string[], status: AccountingStatus, message: string) => void;
}) {
  switch (t.status) {
    case "ready_to_sync":
      return (
        <span className="text-[12px] whitespace-nowrap text-ink-3">
          Ready to sync.{" "}
          <button
            type="button"
            className="ml-1 text-ink underline underline-offset-2 hover:decoration-2"
            onClick={() => onMove([t.id], "needs_review", "Transaction moved back to Needs review")}
          >
            Undo
          </button>
        </span>
      );
    case "needs_review":
      return (
        <Button size="xs" onClick={() => onMove([t.id], "ready_to_sync", "Transaction successfully updated")}>
          Mark ready
        </Button>
      );
    case "waiting":
      return (
        <span className="flex items-center gap-2 text-[12px] whitespace-nowrap">
          <Tag tone="warning" className="h-[18px] text-[11px]">
            {t.missing?.includes("receipt") ? "Receipt" : "Memo"}
          </Tag>
          <button type="button" className="text-ink underline underline-offset-2" onClick={() => onMove([t.id], "waiting", `Reminder sent to ${t.cardholder}`)}>
            Remind
          </button>
        </span>
      );
    case "synced":
      return <Status tone="success">Synced</Status>;
  }
}
