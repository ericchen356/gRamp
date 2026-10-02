"use client";

import {
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  Car,
  CreditCard,
  Landmark,
  Percent,
  ReceiptText,
  Repeat2,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import {
  ledgerOptions,
  paymentRows,
  reimbursementRows,
  treasuryLedgerRows,
  type PaymentMethod,
  type PaymentRow,
  type ReimbursementRow,
  type TreasuryActivityKind,
  type TreasuryLedgerRow,
} from "@/data/ledgers";
import { people } from "@/data/people";
import { formatDate, formatDateLong, formatMoney } from "@/lib/format";
import { createLedgerStore } from "./ledger-store";
import type { CodingField, LedgerConfig } from "./ledger-types";

/* Shared cell pieces -------------------------------------------------- */

function Identity({ media, title, subtitle }: { media: ReactNode; title: ReactNode; subtitle: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {media}
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[13px] text-ink">{title}</div>
        <div className="mt-0.5 truncate text-[11px] text-ink-2">{subtitle}</div>
      </div>
    </div>
  );
}

function IconTile({ icon: Icon, size = 30 }: { icon: LucideIcon; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-ink-1"
      aria-hidden
    >
      <Icon className="size-[45%] stroke-[1.5]" />
    </span>
  );
}

function IconLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <Icon className="size-3.5 shrink-0 stroke-[1.5] text-ink-2" />
      {children}
    </span>
  );
}

function DrawerIdentity({ media, title, subtitle }: { media: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      {media}
      <div>
        <div className="text-[16px] text-ink">{title}</div>
        <div className="text-[12px] text-ink-2">{subtitle}</div>
      </div>
    </div>
  );
}

const glField: CodingField = {
  key: "gl",
  header: "GL Account",
  label: "GL account",
  width: 220,
  options: ledgerOptions.expenseAccounts,
  placeholder: "Select account",
  required: true,
};

const departmentField: CodingField = {
  key: "department",
  header: "QuickBooks Department",
  label: "Department",
  width: 200,
  options: ledgerOptions.departments,
  placeholder: "Select department",
  required: true,
};

const classField: CodingField = {
  key: "class",
  header: "QuickBooks Class",
  label: "Class",
  width: 180,
  options: ledgerOptions.classes,
  placeholder: "Select class",
};

/* Reimbursements ------------------------------------------------------ */

const reimbursementKind = (row: ReimbursementRow) => (row.kind === "mileage" ? "Mileage" : "Out-of-pocket");
const waitingTags: Record<NonNullable<ReimbursementRow["waitingFor"]>, string> = {
  receipt: "Receipt",
  memo: "Memo",
  approval: "Approval",
};

export const reimbursementsLedger: LedgerConfig<ReimbursementRow> = {
  key: "reimbursements",
  title: "Reimbursements",
  basePath: "/accounting/reimbursements",
  noun: { one: "reimbursement", other: "reimbursements" },
  waitingLabel: "Waiting for employee",
  syncTarget: "QuickBooks",
  minWidth: 1640,
  primary: {
    header: "Employee",
    width: 232,
    render: (row) => (
      <Identity
        media={<Avatar name={row.employee} size={30} />}
        title={row.employee}
        subtitle={people.find((person) => person.name === row.employee)?.title ?? "Employee"}
      />
    ),
  },
  columns: [
    { id: "amount", header: "Amount", width: 110, align: "right", className: "text-ink", render: (row) => formatMoney(row.amount) },
    {
      id: "type",
      header: "Type",
      width: 150,
      render: (row) => <IconLabel icon={row.kind === "mileage" ? Car : ReceiptText}>{reimbursementKind(row)}</IconLabel>,
    },
    { id: "submitted", header: "Submitted", width: 92, className: "text-ink-2", render: (row) => formatDate(row.date) },
    {
      id: "description",
      header: "Description",
      width: 250,
      render: (row) => (
        <div className="max-w-[226px] leading-tight">
          <div className="truncate text-[13px] text-ink-1">{row.kind === "mileage" ? `${row.miles} mi · ${row.description}` : row.description}</div>
          <div className="mt-0.5 truncate text-[11px] text-ink-2">{row.memo}</div>
        </div>
      ),
    },
  ],
  coding: [glField, departmentField, classField],
  search: (row) => `${row.employee} ${row.description} ${row.memo} ${reimbursementKind(row)} ${Object.values(row.coding).join(" ")}`,
  waiting: (row) => ({
    tag: waitingTags[row.waitingFor ?? "receipt"],
    action:
      row.waitingFor === "approval"
        ? { label: "Nudge", message: `Approval reminder sent to ${people.find((p) => p.name === row.employee)?.manager ?? "the approver"}` }
        : { label: "Remind", message: `Reminder sent to ${row.employee}` },
  }),
  drawer: {
    title: "Reimbursement",
    identity: (row) => (
      <DrawerIdentity
        media={<Avatar name={row.employee} size={40} />}
        title={row.employee}
        subtitle={people.find((person) => person.name === row.employee)?.title ?? "Employee"}
      />
    ),
    subtitle: (row) =>
      `Submitted ${formatDateLong(row.date)} · ${reimbursementKind(row)}${row.kind === "mileage" ? ` · ${row.miles} mi at $0.70/mi` : ""}`,
    details: (row) => [
      { label: row.kind === "mileage" ? "Trip" : "Merchant", value: row.description },
      { label: "Memo", value: row.memo },
      { label: "Receipt", value: row.kind === "mileage" ? "Not required" : row.waitingFor === "receipt" ? "Missing" : "Attached" },
      { label: "Payout", value: "ACH to employee · next payroll" },
    ],
  },
  store: createLedgerStore(reimbursementRows, "Reimbursements"),
};

/* Payments -------------------------------------------------------------- */

const methodIcons: Record<PaymentMethod, LucideIcon> = {
  ACH: Landmark,
  Wire: Landmark,
  Check: Banknote,
  Card: CreditCard,
};

export const paymentsLedger: LedgerConfig<PaymentRow> = {
  key: "payments",
  title: "Payments",
  basePath: "/accounting/payments",
  noun: { one: "payment", other: "payments" },
  waitingLabel: "Waiting for settlement",
  syncTarget: "QuickBooks",
  minWidth: 1640,
  primary: {
    header: "Vendor",
    width: 232,
    render: (row) => <Identity media={<MerchantLogo name={row.vendor} size={30} />} title={row.vendor} subtitle={row.category} />,
  },
  columns: [
    { id: "amount", header: "Amount", width: 120, align: "right", className: "text-ink", render: (row) => formatMoney(row.amount) },
    { id: "invoice", header: "Invoice", width: 140, className: "text-ink-1 tabular", render: (row) => row.invoice },
    {
      id: "method",
      header: "Payment method",
      width: 160,
      render: (row) => (
        <IconLabel icon={methodIcons[row.method]}>
          {row.method} <span className="text-ink-3">{row.methodDetail}</span>
        </IconLabel>
      ),
    },
    {
      id: "paid",
      header: "Paid",
      width: 92,
      className: "text-ink-2",
      render: (row) => formatDate(row.date),
    },
    {
      id: "approver",
      header: "Approved by",
      width: 160,
      render: (row) => (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Avatar name={row.approver} size={20} />
          {row.approver}
        </span>
      ),
    },
  ],
  coding: [glField, departmentField, classField],
  search: (row) => `${row.vendor} ${row.category} ${row.invoice} ${row.method} ${row.approver} ${Object.values(row.coding).join(" ")}`,
  waiting: (row) => ({
    tag: row.settles ? `Settles ${formatDate(row.settles)}` : "In transit",
    action: { label: "Track", message: `${row.vendor} payment is in transit via ${row.method}` },
  }),
  drawer: {
    title: "Bill payment",
    identity: (row) => <DrawerIdentity media={<MerchantLogo name={row.vendor} size={40} />} title={row.vendor} subtitle={row.category} />,
    subtitle: (row) => `Paid ${formatDateLong(row.date)} · ${row.method} ${row.methodDetail}`,
    details: (row) => [
      { label: "Invoice", value: row.invoice },
      { label: "Payment method", value: `${row.method} ${row.methodDetail}` },
      { label: "Approved by", value: row.approver },
      { label: "Settlement", value: row.settles ? `Expected ${formatDateLong(row.settles)}` : "Settled" },
    ],
  },
  store: createLedgerStore(paymentRows, "Payments"),
};

/* Treasury -------------------------------------------------------------- */

const activityMeta: Record<TreasuryActivityKind, { label: string; icon: LucideIcon }> = {
  interest: { label: "Interest", icon: Percent },
  sweep: { label: "Sweep", icon: Repeat2 },
  transfer: { label: "Transfer", icon: ArrowLeftRight },
  fee: { label: "Fee", icon: ReceiptText },
};

function TreasuryAmount({ row }: { row: TreasuryLedgerRow }) {
  if (row.kind === "interest") return <span className="text-money">+{formatMoney(row.amount)}</span>;
  if (row.kind === "fee") return <span className="text-ink">−{formatMoney(row.amount)}</span>;
  return <span className="text-ink">{formatMoney(row.amount)}</span>;
}

export const treasuryLedger: LedgerConfig<TreasuryLedgerRow> = {
  key: "treasury",
  title: "Treasury",
  basePath: "/accounting/treasury",
  noun: { one: "activity", other: "activities" },
  waitingLabel: "Waiting for settlement",
  syncTarget: "QuickBooks",
  minWidth: 1600,
  primary: {
    header: "Activity",
    width: 252,
    render: (row) => (
      <Identity media={<IconTile icon={activityMeta[row.kind].icon} />} title={row.title} subtitle={activityMeta[row.kind].label} />
    ),
  },
  columns: [
    { id: "amount", header: "Amount", width: 130, align: "right", render: (row) => <TreasuryAmount row={row} /> },
    { id: "date", header: "Date", width: 92, className: "text-ink-2", render: (row) => formatDate(row.date) },
    {
      id: "accounts",
      header: "From → To",
      width: 320,
      render: (row) => (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          {row.from}
          <ArrowRight className="size-3 shrink-0 stroke-[1.75] text-ink-3" />
          {row.to}
        </span>
      ),
    },
  ],
  coding: [
    {
      key: "debit",
      header: "Debit account",
      label: "Debit account",
      width: 220,
      options: ledgerOptions.balanceSheetAccounts,
      placeholder: "Select account",
      required: true,
    },
    {
      key: "credit",
      header: "Credit account",
      label: "Credit account",
      width: 220,
      options: ledgerOptions.balanceSheetAccounts,
      placeholder: "Select account",
      required: true,
    },
    classField,
  ],
  search: (row) => `${row.title} ${activityMeta[row.kind].label} ${row.from} ${row.to} ${Object.values(row.coding).join(" ")}`,
  waiting: (row) => ({
    tag: row.settles ? `Settles ${formatDate(row.settles)}` : "Pending",
  }),
  drawer: {
    title: "Treasury activity",
    identity: (row) => (
      <DrawerIdentity media={<IconTile icon={activityMeta[row.kind].icon} size={40} />} title={row.title} subtitle={activityMeta[row.kind].label} />
    ),
    subtitle: (row) => `${formatDateLong(row.date)} · ${row.from} → ${row.to}`,
    details: (row) => [
      { label: "Type", value: activityMeta[row.kind].label },
      { label: "From", value: row.from },
      { label: "To", value: row.to },
      { label: "Settlement", value: row.settles ? `Expected ${formatDateLong(row.settles)}` : "Settled" },
    ],
  },
  store: createLedgerStore(treasuryLedgerRows, "Treasury"),
};
