"use client";

import { ChevronDown, Columns3, Inbox, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { AvatarStack } from "@/components/ui/avatar";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuItem, MenuLabel, Popover } from "@/components/ui/popover";
import { Stat } from "@/components/ui/stat";
import { CellStack, EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { AddFilterButton, FilterChip, SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { isDueThisWeek, isOverdue, remittanceFor, type Bill, type BillMethod, type BillStage } from "@/data/bills";
import { daysFromToday } from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, pluralize } from "@/lib/format";
import { BillDrawer } from "./bill-drawer";
import { BillStatus } from "./bill-status";
import { useBills } from "./bills-store";

const methods: BillMethod[] = ["ACH", "Wire", "Check", "Card"];

const sum = (list: Bill[]) => list.reduce((total, b) => total + b.amount, 0);

/** Short remittance line under the payment method ("Chase ···· 3147"). */
function methodDetail(bill: Bill) {
  return remittanceFor(bill).replace(/^(ACH|Domestic wire) to /, "");
}

function DueCell({ bill }: { bill: Bill }) {
  const days = daysFromToday(bill.dueDate);
  const overdue = isOverdue(bill);
  let secondary: string;
  if (bill.stage === "paid") secondary = bill.paidOn ? `Paid ${formatDate(bill.paidOn)}` : "Paid";
  else if (overdue) secondary = `${pluralize(-days, "day")} overdue`;
  else if (days === 0) secondary = "Due today";
  else if (days < 0) secondary = `${pluralize(-days, "day")} ago`;
  else secondary = `in ${pluralize(days, "day")}`;
  return (
    <div className="leading-tight">
      <div className={cn("text-[13px]", overdue ? "text-warning" : "text-ink-1")}>{formatDate(bill.dueDate)}</div>
      <div className={cn("mt-0.5 text-[12px]", overdue ? "text-warning" : "text-ink-2")}>{secondary}</div>
    </div>
  );
}

/** Bill Pay table for one stage (Drafts / For approval / For payment / Paid). */
export function BillsTable({ stage, initialBillId }: { stage: BillStage; initialBillId?: string }) {
  const { bills, approve, pay, submit } = useBills();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<BillMethod | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(initialBillId ?? null);

  const inStage = useMemo(() => bills.filter((b) => b.stage === stage), [bills, stage]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inStage
      .filter((b) => !method || b.method === method)
      .filter((b) => !q || `${b.vendor} ${b.invoiceNumber} ${b.submittedBy} ${b.department}`.toLowerCase().includes(q))
      .sort((a, b) =>
        stage === "paid" ? (b.paidOn ?? "").localeCompare(a.paidOn ?? "") : a.dueDate.localeCompare(b.dueDate),
      );
  }, [inStage, method, query, stage]);

  const selectedRows = rows.filter((b) => selected.has(b.id));
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const openBill = bills.find((b) => b.id === openId) ?? null;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const act = (list: Bill[]) => {
    const ids = list.map((b) => b.id);
    const label = list.length === 1 ? list[0].vendor : pluralize(list.length, "bill");
    if (stage === "payment") {
      pay(ids);
      toast.show(`Payment of ${formatMoney(sum(list))} to ${label} initiated`);
    } else if (stage === "approval") {
      approve(ids);
      toast.show(`${list.length === 1 ? `${label} bill` : label} approved`);
    } else if (stage === "draft") {
      submit(ids);
      toast.show(`${list.length === 1 ? `${label} bill` : label} submitted for approval`);
    }
    setSelected(new Set());
  };

  const overdue = inStage.filter(isOverdue);
  const dueThisWeek = inStage.filter((b) => isDueThisWeek(b) && !b.scheduledFor);
  const scheduled = inStage.filter((b) => b.scheduledFor);

  return (
    <>
      {stage === "payment" && (
        <section className="px-page pt-10 pb-10">
          <div className="flex flex-wrap gap-x-[66px] gap-y-6">
            <Stat label="Due this week" value={formatMoney(sum(dueThisWeek))} caption={pluralize(dueThisWeek.length, "bill")} />
            <Stat
              label="Overdue"
              value={formatMoney(sum(overdue))}
              tone={overdue.length ? "warning" : "default"}
              caption={pluralize(overdue.length, "bill")}
            />
            <Stat label="Scheduled" value={formatMoney(sum(scheduled))} caption={pluralize(scheduled.length, "payment")} />
            <Stat label="Total for payment" value={formatMoney(sum(inStage))} caption={`Paid from Operating ···· 4410`} />
          </div>
        </section>
      )}
      <Toolbar className={cn(stage !== "payment" && "border-t-0")}>
        <ToolbarRow className="min-h-[50px]">
          <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search or add filter..." />
          {method ? (
            <FilterChip label="Payment method" value={method} onRemove={() => setMethod(null)} />
          ) : (
            <Popover trigger={({ toggle }) => <AddFilterButton onClick={toggle} />}>
              {(close) => (
                <>
                  <MenuLabel>Payment method</MenuLabel>
                  {methods.map((m) => (
                    <MenuItem
                      key={m}
                      hint={inStage.filter((b) => b.method === m).length}
                      onSelect={() => {
                        setMethod(m);
                        close();
                      }}
                    >
                      {m}
                    </MenuItem>
                  ))}
                </>
              )}
            </Popover>
          )}
          <div className="ml-auto flex items-center gap-2.5">
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
                  <MenuItem onSelect={() => { close(); toast.show("Bills exported to CSV"); }}>Export CSV</MenuItem>
                  <MenuItem onSelect={close}>Approval policies</MenuItem>
                  <MenuItem onSelect={close}>Payment settings</MenuItem>
                </>
              )}
            </Popover>
          </div>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1180}>
        <THead>
          <tr>
            <Th align="center" className="w-[52px] min-w-[52px] px-0!">
              <Checkbox
                label="Select all"
                checked={allSelected}
                indeterminate={!allSelected && selectedRows.length > 0}
                onChange={(checked) => setSelected(checked ? new Set(rows.map((b) => b.id)) : new Set())}
              />
            </Th>
            <Th className="w-[23%] pl-[14px]!">Vendor</Th>
            <Th className="w-[11%]" align="right">
              Amount
            </Th>
            <Th className="w-[11%]" sort={stage === "paid" ? undefined : "asc"}>
              Due date
            </Th>
            <Th className="w-[14%]">Payment method</Th>
            <Th className="w-[11%]">Approvers</Th>
            <Th className="w-[15%]">Status</Th>
            <Th>Action</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((bill) => {
            const isSelected = selected.has(bill.id);
            return (
              <Tr key={bill.id} selected={isSelected} onClick={() => setOpenId(bill.id)}>
                <Td className="w-[52px] min-w-[52px] px-0! text-center">
                  <Checkbox label={`Select ${bill.vendor} ${bill.invoiceNumber}`} checked={isSelected} onChange={() => toggle(bill.id)} />
                </Td>
                <Td className="h-[62px] pl-[14px]!">
                  <div className="flex items-center gap-3.5">
                    <MerchantLogo name={bill.vendor} size={32} />
                    <CellStack primary={bill.vendor} secondary={bill.invoiceNumber} />
                  </div>
                </Td>
                <Td align="right" className="text-[14px] text-ink">
                  {formatMoney(bill.amount)}
                </Td>
                <Td>
                  <DueCell bill={bill} />
                </Td>
                <Td>
                  <CellStack primary={<span className="text-[13px]">{bill.method}</span>} secondary={methodDetail(bill)} />
                </Td>
                <Td>
                  {bill.approvers.length ? (
                    <span title={bill.approvers.map((a) => `${a.name} (${a.state})`).join(", ")}>
                      <AvatarStack names={bill.approvers.map((a) => a.name)} size={24} />
                    </span>
                  ) : (
                    <span className="text-ink-3">Not assigned</span>
                  )}
                </Td>
                <Td>
                  <BillStatus bill={bill} />
                </Td>
                <Td onClick={(event) => event.stopPropagation()}>
                  <RowAction bill={bill} onAct={() => act([bill])} onReview={() => setOpenId(bill.id)} />
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <EmptyState
          icon={<Inbox />}
          title={query || method ? "No bills match" : "You're all caught up"}
          description={query || method ? "Try a different search or remove the filter." : "New bills will show up here."}
        />
      )}

      <div className="flex-1" />
      <TableFooter
        left={
          selectedRows.length ? (
            <>
              <span className="text-ink-1">
                {selectedRows.length} selected · {formatMoney(sum(selectedRows))}
              </span>
              {stage !== "paid" && (
                <Button size="xs" variant="primary" onClick={() => act(selectedRows)}>
                  {stage === "payment" ? `Pay ${formatMoney(sum(selectedRows))}` : stage === "approval" ? `Approve ${selectedRows.length}` : `Submit ${selectedRows.length}`}
                </Button>
              )}
              {stage === "paid" && (
                <Button size="xs" onClick={() => { toast.show(`${pluralize(selectedRows.length, "remittance")} downloaded`); setSelected(new Set()); }}>
                  Download remittances
                </Button>
              )}
              <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelected(new Set(rows.map((b) => b.id)))}
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
              {rows.length ? `1–${rows.length}` : "0"} of {pluralize(rows.length, "bill")}
            </span>
            <span>·</span>
            <span>{formatMoney(sum(rows))} USD</span>
          </>
        }
      />

      <BillDrawer bill={openBill} onClose={() => setOpenId(null)} />
    </>
  );
}

function RowAction({ bill, onAct, onReview }: { bill: Bill; onAct: () => void; onReview: () => void }) {
  switch (bill.stage) {
    case "draft":
      return (
        <Button size="xs" onClick={onReview}>
          Review
        </Button>
      );
    case "approval":
      return (
        <Button size="xs" variant="approve" onClick={onAct}>
          Approve
        </Button>
      );
    case "payment":
      return bill.scheduledFor ? (
        <Button size="xs" variant="ghost" onClick={onReview}>
          Edit
        </Button>
      ) : (
        <Button size="xs" onClick={onAct}>
          Pay
        </Button>
      );
    case "paid":
      return (
        <Button size="xs" variant="ghost" onClick={onReview}>
          View
        </Button>
      );
  }
}
