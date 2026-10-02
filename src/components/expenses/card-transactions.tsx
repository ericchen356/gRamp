"use client";

import { ChevronDown, Clock3, FileWarning } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuDivider, MenuItem, MenuLabel } from "@/components/ui/popover";
import { Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { FilterChip } from "@/components/ui/toolbar";
import { expenseStatusLabels, type CardExpense, type ExpenseStatus } from "@/data/expenses";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, pluralize } from "@/lib/format";
import { DataToolbar, presetLabel, withinPreset, type DatePreset } from "@/components/ui/data-toolbar";
import { ExpenseDrawer } from "./expense-drawer";
import { ExpenseStatusDot, ReceiptIcon } from "./expense-status";
import { useExpenses } from "./expenses-store";

const columns = [
  { id: "date", label: "Date" },
  { id: "cardholder", label: "Cardholder" },
  { id: "card", label: "Card" },
  { id: "receipt", label: "Receipt" },
  { id: "memo", label: "Memo" },
  { id: "department", label: "Department" },
  { id: "status", label: "Status" },
];

const statusOrder: ExpenseStatus[] = ["needs_approval", "missing_items", "flagged", "approved"];

function MerchantCell({ expense }: { expense: CardExpense }) {
  return (
    <div className="flex items-center gap-3">
      <MerchantLogo name={expense.merchant} size={30} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[13px] text-ink">{expense.merchant}</div>
        <div className="mt-0.5 truncate text-[11px] text-ink-2">{expense.category}</div>
      </div>
      {expense.pending && <Clock3 className="size-[14px] shrink-0 stroke-[1.5] text-ink-2" aria-label="Pending" />}
    </div>
  );
}

/** Expenses › Card transactions: every Ramp card swipe with its policy state. */
export function CardTransactions() {
  const { expenses, updateExpense } = useExpenses();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<DatePreset>("30");
  const [status, setStatus] = useState<ExpenseStatus | null>(null);
  const [cardholder, setCardholder] = useState<string | null>(null);
  const [dense, setDense] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses
      .filter(
        (e) =>
          withinPreset(e.date, preset) &&
          (!status || e.expenseStatus === status) &&
          (!cardholder || e.cardholder === cardholder) &&
          (!q || `${e.merchant} ${e.category} ${e.cardholder} ${e.memo ?? ""} ${e.cardName}`.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, preset, status, cardholder, query]);

  const show = (id: string) => !hidden.has(id);
  const total = rows.reduce((sum, e) => sum + e.amount, 0);
  const allSelected = rows.length > 0 && rows.every((e) => selected.has(e.id));
  const someSelected = rows.some((e) => selected.has(e.id));
  const open = expenses.find((e) => e.id === openId) ?? null;
  const filterCount = (preset !== "all" ? 1 : 0) + (status ? 1 : 0) + (cardholder ? 1 : 0);
  const cardholders = [...new Set(expenses.map((e) => e.cardholder))].sort();

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const approve = (ids: string[]) => {
    updateExpense(ids, { expenseStatus: "approved", flagged: false });
    setSelected(new Set());
    toast.show(ids.length === 1 ? "Transaction approved" : `${ids.length} transactions approved`);
  };

  const cellHeight = dense ? "h-[44px]" : undefined;

  return (
    <>
      <DataToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search merchants, cardholders, memos..."
        filterCount={filterCount}
        onClearFilters={() => {
          setPreset("all");
          setStatus(null);
          setCardholder(null);
        }}
        date={{ value: preset, onChange: setPreset }}
        dense={{ value: dense, onChange: setDense }}
        columns={{
          items: columns,
          hidden,
          onToggle: (id) =>
            setHidden((current) => {
              const next = new Set(current);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            }),
        }}
        options={[
          { label: "Export CSV", onSelect: () => toast.show("Export started. We'll email you the CSV.", "neutral") },
          { label: "Remind all missing receipts", onSelect: () => toast.show("Receipt reminders sent to 6 cardholders") },
          { label: "Expense policy settings", onSelect: () => toast.show("Opening Expense policy", "neutral") },
        ]}
        chips={
          <>
            {preset !== "all" && <FilterChip label="Date" value={presetLabel(preset)} onRemove={() => setPreset("all")} />}
            {status && <FilterChip label="Status" value={expenseStatusLabels[status]} onRemove={() => setStatus(null)} />}
            {cardholder && <FilterChip label="Cardholder" value={cardholder} onRemove={() => setCardholder(null)} />}
          </>
        }
        filterMenu={(close) => (
          <>
            <MenuLabel>Status</MenuLabel>
            {statusOrder.map((value) => (
              <MenuItem
                key={value}
                selected={status === value}
                onSelect={() => {
                  setStatus(value);
                  close();
                }}
              >
                {expenseStatusLabels[value]}
              </MenuItem>
            ))}
            <MenuDivider />
            <MenuLabel>Cardholder</MenuLabel>
            <div className="max-h-48 overflow-y-auto scrollbar-thin">
              {cardholders.map((name) => (
                <MenuItem
                  key={name}
                  selected={cardholder === name}
                  icon={<Avatar name={name} size={18} />}
                  onSelect={() => {
                    setCardholder(name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))}
            </div>
          </>
        )}
      />

      <Table className="border-t border-line bg-canvas" minWidth={1480}>
        <THead>
          <tr>
            <Th align="center" className="sticky left-0 z-20 w-[52px] min-w-[52px] bg-canvas px-0!">
              <Checkbox
                label="Select all"
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={(checked) => setSelected(checked ? new Set(rows.map((e) => e.id)) : new Set())}
              />
            </Th>
            <Th className="sticky left-[52px] z-20 w-[232px] min-w-[232px] bg-canvas shadow-[inset_-1px_0_0_var(--color-line)]">
              Merchant
            </Th>
            <Th className="w-[112px]" align="right">
              Amount
            </Th>
            {show("date") && (
              <Th className="w-[88px]" sort="desc">
                Date
              </Th>
            )}
            {show("cardholder") && <Th className="w-[176px]">Cardholder</Th>}
            {show("card") && <Th className="w-[210px]">Card</Th>}
            {show("receipt") && (
              <Th className="w-[72px]" align="center">
                Receipt
              </Th>
            )}
            {show("memo") && <Th className="min-w-[240px]">Memo</Th>}
            {show("department") && <Th className="w-[128px]">Department</Th>}
            {show("status") && <Th className="w-[160px]">Status</Th>}
          </tr>
        </THead>
        <TBody>
          {rows.map((e) => {
            const isSelected = selected.has(e.id);
            const stickyBg = isSelected ? "bg-subtle" : "bg-canvas group-hover/row:bg-subtle";
            return (
              <Tr key={e.id} selected={isSelected} onClick={() => setOpenId(e.id)}>
                <Td className={cn("sticky left-0 z-10 w-[52px] min-w-[52px] px-0! text-center", stickyBg, cellHeight)}>
                  <Checkbox label={`Select ${e.merchant}`} checked={isSelected} onChange={() => toggle(e.id)} />
                </Td>
                <Td
                  className={cn(
                    "sticky left-[52px] z-10 w-[232px] min-w-[232px] border-r-0 pl-[14px]! shadow-[inset_-1px_0_0_var(--color-line)]",
                    stickyBg,
                    cellHeight,
                  )}
                >
                  <MerchantCell expense={e} />
                </Td>
                <Td align="right" className={cn("text-ink", cellHeight)}>
                  {formatMoney(e.amount)}
                </Td>
                {show("date") && <Td className={cn("text-ink-2", cellHeight)}>{formatDate(e.date)}</Td>}
                {show("cardholder") && (
                  <Td className={cellHeight}>
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar name={e.cardholder} size={22} />
                      <span className="truncate">{e.cardholder}</span>
                    </span>
                  </Td>
                )}
                {show("card") && (
                  <Td className={cellHeight}>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-ink-2 tabular">···· {e.cardLast4}</span>
                      <span className="truncate text-ink-1">{e.cardName}</span>
                    </span>
                  </Td>
                )}
                {show("receipt") && (
                  <Td align="center" className={cellHeight}>
                    <ReceiptIcon state={e.receipt} />
                  </Td>
                )}
                {show("memo") && (
                  <Td className={cn("max-w-[320px]", cellHeight)}>
                    {e.memo ? <span className="block truncate">{e.memo}</span> : <span className="text-ink-4">Add memo</span>}
                  </Td>
                )}
                {show("department") && <Td className={cellHeight}>{e.department}</Td>}
                {show("status") && (
                  <Td className={cellHeight}>
                    <ExpenseStatusDot status={e.expenseStatus} />
                  </Td>
                )}
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <FileWarning className="size-7 stroke-[1.25] text-ink-4" />
          <p className="mt-3 text-[15px] text-ink">No transactions</p>
          <p className="mt-1 text-[13px] text-ink-2">Try a wider date range or clear your filters.</p>
        </div>
      )}

      <div className="flex-1" />
      <TableFooter
        left={
          someSelected ? (
            <>
              <span className="text-ink-1">{selected.size} selected</span>
              <Button size="xs" variant="primary" onClick={() => approve([...selected])}>
                Approve
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  setSelected(new Set());
                  toast.show(`Reminders sent for ${pluralize(selected.size, "transaction")}`);
                }}
              >
                Remind
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelected(new Set(rows.map((e) => e.id)))}
              className="inline-flex items-center gap-1 text-ink-2 hover:text-ink"
            >
              Select
              <ChevronDown className="size-3 stroke-[1.75]" />
            </button>
          )
        }
        right={
          <>
            <span>
              {rows.length ? `1–${rows.length}` : 0} of {pluralize(rows.length, "transaction")}
            </span>
            <span>·</span>
            <span>{formatMoney(total)} USD</span>
          </>
        }
      />

      <ExpenseDrawer expense={open} onClose={() => setOpenId(null)} onApprove={(id) => approve([id])} />
    </>
  );
}
