/**
 * Accounting sub-ledgers (Reimbursements, Payments, Treasury). Each row carries
 * its accounting `coding` (GL account, QuickBooks department/class...) keyed by
 * the coding field ids declared in the ledger configs.
 */
import { people } from "./people";
import { quickbooks } from "./transactions";

export type LedgerStatus = "needs_review" | "ready_to_sync" | "waiting" | "synced";

export type LedgerRowBase = {
  id: string;
  status: LedgerStatus;
  amount: number;
  date: string;
  coding: Record<string, string | null>;
};

export const ledgerOptions = {
  expenseAccounts: [
    ...quickbooks.glAccounts,
    "6330 Mileage",
    "6710 Professional Development",
    "6810 Home Office",
    "6910 Legal & Professional",
    "6920 Insurance",
  ].sort(),
  departments: quickbooks.departments,
  classes: quickbooks.classes,
  balanceSheetAccounts: [
    "1010 Operating Cash",
    "1020 Treasury Investments",
    "1030 Payroll Cash",
    "1040 India Operations Cash",
    "4910 Interest Income",
    "6050 Bank Fees",
  ],
};

/* ------------------------------------------------------------------ */
/* Reimbursements                                                       */
/* ------------------------------------------------------------------ */

export type ReimbursementRow = LedgerRowBase & {
  employee: string;
  kind: "mileage" | "out_of_pocket";
  /** Merchant for out-of-pocket, trip description for mileage. */
  description: string;
  miles?: number;
  memo: string;
  waitingFor?: "receipt" | "memo" | "approval";
};

type ReimbursementSeed = [
  employee: string,
  kind: ReimbursementRow["kind"],
  description: string,
  amountOrMiles: number,
  date: string,
  gl: string | null,
  memo: string,
  status: LedgerStatus,
  waitingFor?: ReimbursementRow["waitingFor"],
];

const MILEAGE_RATE = 0.7;

const reimbursementSeeds: ReimbursementSeed[] = [
  ["Jordan Lee", "mileage", "Austin office → Dell Medical", 42.6, "2026-10-01", "6330 Mileage", "Client onsite, Dell Medical", "needs_review"],
  ["Priya Raman", "out_of_pocket", "Eventbrite", 149, "2026-10-01", "6710 Professional Development", "Growth Summit ticket", "needs_review"],
  ["Liam Novak", "out_of_pocket", "Home Depot", 86.74, "2026-10-01", "6200 Office Supplies", "Shelving for supply closet", "ready_to_sync"],
  ["Sofia Alvarez", "out_of_pocket", "Uber", 64.18, "2026-09-30", "6320 Travel", "Airport → client HQ", "needs_review"],
  ["Diego Santos", "mileage", "SFO → Palo Alto customer visit", 58.4, "2026-09-30", "6330 Mileage", "Demo with Northwind", "needs_review"],
  ["Ethan Park", "out_of_pocket", "Best Buy", 329.99, "2026-09-30", null, "Monitor for home office", "needs_review"],
  ["Ava Thompson", "out_of_pocket", "Costco", 212.46, "2026-09-30", "6200 Office Supplies", "Snacks and kitchen restock", "waiting", "receipt"],
  ["Marcus Hale", "out_of_pocket", "Sweetgreen", 96.3, "2026-09-29", "6110 Meals & Entertainment", "Team lunch, campaign kickoff", "needs_review"],
  ["Hannah Okafor", "out_of_pocket", "O'Reilly Media", 499, "2026-09-29", "6710 Professional Development", "Annual learning subscription", "ready_to_sync"],
  ["Noah Kim", "out_of_pocket", "Blick Art Materials", 58.12, "2026-09-29", null, "Prototyping supplies", "needs_review"],
  ["Grace Whitfield", "mileage", "Austin → Round Rock career fair", 36.2, "2026-09-28", "6330 Mileage", "UT career fair booth", "needs_review"],
  ["Jordan Lee", "out_of_pocket", "Delta", 412.6, "2026-09-28", "6320 Travel", "Flight change fee, Denver trip", "waiting", "memo"],
  ["Mia Chen", "out_of_pocket", "USPS", 18.4, "2026-09-28", "6230 Postage & Shipping", "1099 mailings", "needs_review"],
  ["Tina Cruz", "out_of_pocket", "AICPA", 285, "2026-09-27", "6710 Professional Development", "CPE credits", "ready_to_sync"],
  ["Sofia Alvarez", "mileage", "SF office → Oakland", 24.8, "2026-09-27", "6330 Mileage", "Partner meeting", "needs_review"],
  ["Ethan Park", "out_of_pocket", "Amazon", 74.99, "2026-09-26", "6810 Home Office", "Keyboard replacement", "needs_review"],
  ["Diego Santos", "out_of_pocket", "Marriott", 588.42, "2026-09-26", "6320 Travel", "2 nights, Seattle customer visit", "waiting", "approval"],
  ["Priya Raman", "out_of_pocket", "Starbucks", 23.65, "2026-09-26", "6110 Meals & Entertainment", "Candidate coffee", "needs_review"],
  ["Liam Novak", "mileage", "Brooklyn → Newark warehouse", 31.5, "2026-09-25", "6330 Mileage", "Inventory audit", "needs_review"],
  ["Noah Kim", "out_of_pocket", "Figma Config", 899, "2026-09-25", "6710 Professional Development", "Conference pass", "ready_to_sync"],
  ["Marcus Hale", "out_of_pocket", "Lyft", 41.22, "2026-09-25", null, "Late night after event", "needs_review"],
  ["Hannah Okafor", "out_of_pocket", "DoorDash", 184.9, "2026-09-24", "6110 Meals & Entertainment", "On-call team dinner", "waiting", "receipt"],
  ["Ava Thompson", "mileage", "Office → Costco → office", 14.2, "2026-09-24", "6330 Mileage", "Supply run", "needs_review"],
  ["Grace Whitfield", "out_of_pocket", "LinkedIn", 119.99, "2026-09-24", "6410 Software", "Recruiter Lite seat", "needs_review"],
  ["Jordan Lee", "out_of_pocket", "Hilton", 312.8, "2026-09-23", "6320 Travel", "Denver, 1 night", "ready_to_sync"],
  ["Mia Chen", "out_of_pocket", "Staples", 42.15, "2026-09-23", "6200 Office Supplies", "Binders and labels", "needs_review"],
  ["Ethan Park", "mileage", "Manhattan → JFK", 18.6, "2026-09-22", "6330 Mileage", "Re:Invent travel", "waiting", "memo"],
  ["Sofia Alvarez", "out_of_pocket", "Nobu", 642.1, "2026-09-22", "6110 Meals & Entertainment", "Customer dinner, 6 guests", "needs_review"],
  ["Priya Raman", "out_of_pocket", "Canva", 119.99, "2026-09-21", null, "Pro plan, annual", "needs_review"],
  ["Diego Santos", "out_of_pocket", "Shell", 54.3, "2026-09-21", "6320 Travel", "Rental car fuel", "needs_review"],
  ["Noah Kim", "mileage", "Seattle → Bellevue", 22.4, "2026-09-20", "6330 Mileage", "User research sessions", "waiting", "approval"],
  ["Tina Cruz", "out_of_pocket", "FedEx", 38.6, "2026-09-19", "6230 Postage & Shipping", "Signed contracts overnight", "needs_review"],
  ["Hannah Okafor", "out_of_pocket", "Apple", 249, "2026-09-19", "6810 Home Office", "AirPods for on-call", "waiting", "receipt"],
  ["Marcus Hale", "mileage", "Seattle → Tacoma event", 64.8, "2026-09-18", "6330 Mileage", "Field marketing event", "needs_review"],
  ["Liam Novak", "out_of_pocket", "WeWork", 45, "2026-09-18", "6500 Rent", "Day pass, Boston", "needs_review"],
  ["Grace Whitfield", "out_of_pocket", "Sweetgreen", 31.4, "2026-09-17", "6110 Meals & Entertainment", "Interview lunch", "waiting", "memo"],
];

const personByName = new Map(people.map((person) => [person.name, person]));

export const reimbursementRows: ReimbursementRow[] = reimbursementSeeds.map(
  ([employee, kind, description, amountOrMiles, date, gl, memo, status, waitingFor], index) => {
    const person = personByName.get(employee);
    const mileage = kind === "mileage";
    return {
      id: `rmb_${(index + 1).toString().padStart(3, "0")}`,
      employee,
      kind,
      description,
      miles: mileage ? amountOrMiles : undefined,
      amount: mileage ? Math.round(amountOrMiles * MILEAGE_RATE * 100) / 100 : amountOrMiles,
      date,
      memo,
      status,
      waitingFor,
      coding: {
        gl,
        department: index % 7 === 3 ? null : (person?.department ?? null),
        class: person?.location ?? null,
      },
    };
  },
);

/* ------------------------------------------------------------------ */
/* Payments (bill payments)                                            */
/* ------------------------------------------------------------------ */

export type PaymentMethod = "ACH" | "Check" | "Card" | "Wire";

export type PaymentRow = LedgerRowBase & {
  vendor: string;
  category: string;
  invoice: string;
  method: PaymentMethod;
  /** Last four of the bank account or card used. */
  methodDetail: string;
  approver: string;
  settles?: string;
};

export const paymentRows: PaymentRow[] = [
  { id: "pay_001", vendor: "WeWork", category: "Rent", invoice: "INV-208114", method: "ACH", methodDetail: "•• 4402", approver: "Tina Cruz", amount: 18_400, date: "2026-10-01", status: "needs_review", coding: { gl: "6500 Rent", department: "Operations", class: "New York" } },
  { id: "pay_002", vendor: "Amazon Web Services", category: "Cloud infrastructure", invoice: "AWS-0926-7731", method: "ACH", methodDetail: "•• 4402", approver: "Hannah Okafor", amount: 12_840.22, date: "2026-09-30", status: "needs_review", coding: { gl: "6420 Hosting", department: "Engineering", class: null } },
  { id: "pay_003", vendor: "Salesforce", category: "Software", invoice: "SF-55120", method: "Wire", methodDetail: "•• 4402", approver: "Sofia Alvarez", amount: 22_500, date: "2026-09-29", status: "ready_to_sync", coding: { gl: "6410 Software", department: "Sales", class: "San Francisco" } },
  { id: "pay_004", vendor: "Carta", category: "Legal & professional", invoice: "CRT-1189", method: "Check", methodDetail: "#10482", approver: "Alexander Bass", amount: 2_800, date: "2026-09-29", status: "needs_review", coding: { gl: null, department: "Finance", class: "Austin, TX" } },
  { id: "pay_005", vendor: "Datadog", category: "Software", invoice: "DD-2026-09", method: "Card", methodDetail: "•• 9930", approver: "Hannah Okafor", amount: 9_310.45, date: "2026-09-27", status: "ready_to_sync", coding: { gl: "6420 Hosting", department: "Engineering", class: "New York" } },
  { id: "pay_006", vendor: "DocuSign", category: "Software", invoice: "DS-448201", method: "Card", methodDetail: "•• 0042", approver: "Tina Cruz", amount: 1_560, date: "2026-09-26", status: "needs_review", coding: { gl: "6410 Software", department: null, class: "Austin, TX" } },
  { id: "pay_007", vendor: "Rippling", category: "HR software", invoice: "RPL-77310", method: "ACH", methodDetail: "•• 4402", approver: "Liam Novak", amount: 4_212, date: "2026-10-02", status: "waiting", settles: "2026-10-06", coding: { gl: "6410 Software", department: "People", class: "Remote" } },
];

/* ------------------------------------------------------------------ */
/* Treasury activity                                                    */
/* ------------------------------------------------------------------ */

export type TreasuryActivityKind = "interest" | "sweep" | "transfer" | "fee";

export type TreasuryLedgerRow = LedgerRowBase & {
  kind: TreasuryActivityKind;
  title: string;
  from: string;
  to: string;
  settles?: string;
};

type TreasurySeed = [TreasuryActivityKind, string, string, string, number, string, LedgerStatus, string | null, string | null, string?];

const treasurySeeds: TreasurySeed[] = [
  ["interest", "Interest earned", "Ramp Treasury", "Investment Account", 412.33, "2026-10-01", "needs_review", "1020 Treasury Investments", "4910 Interest Income"],
  ["sweep", "Sweep excess operating cash", "Business Account", "Investment Account", 250_000, "2026-10-01", "needs_review", "1020 Treasury Investments", "1010 Operating Cash"],
  ["transfer", "Fund payroll before run", "Business Account", "Payroll Account", 180_000, "2026-09-30", "ready_to_sync", "1030 Payroll Cash", "1010 Operating Cash"],
  ["fee", "Portfolio management fee", "Investment Account", "Ramp Treasury", 21.4, "2026-09-30", "needs_review", "6050 Bank Fees", null],
  ["sweep", "Sweep excess operating cash", "Business Account", "Investment Account", 118_400, "2026-09-29", "needs_review", "1020 Treasury Investments", "1010 Operating Cash"],
  ["transfer", "Top up India operations", "Business Account", "Operations Account", 75_000, "2026-09-29", "waiting", "1040 India Operations Cash", "1010 Operating Cash", "2026-10-03"],
  ["interest", "Interest earned", "Ramp Treasury", "Business Account", 96.18, "2026-09-28", "ready_to_sync", "1010 Operating Cash", "4910 Interest Income"],
  ["sweep", "Return idle investment cash", "Investment Account", "Business Account", 50_000, "2026-09-26", "needs_review", null, "1020 Treasury Investments"],
  ["transfer", "Manual transfer", "Investment Account", "Business Account", 30_000, "2026-09-25", "needs_review", "1010 Operating Cash", "1020 Treasury Investments"],
  ["sweep", "Sweep excess operating cash", "Business Account", "Investment Account", 92_750, "2026-09-24", "ready_to_sync", "1020 Treasury Investments", "1010 Operating Cash"],
  ["transfer", "Fund payroll before run", "Business Account", "Payroll Account", 180_000, "2026-09-23", "needs_review", "1030 Payroll Cash", "1010 Operating Cash"],
  ["interest", "Interest earned", "Ramp Treasury", "Investment Account", 398.07, "2026-09-22", "ready_to_sync", "1020 Treasury Investments", "4910 Interest Income"],
  ["transfer", "T-bill purchase settlement", "Investment Account", "Ramp Treasury", 500_000, "2026-09-18", "waiting", "1020 Treasury Investments", "1020 Treasury Investments", "2026-10-02"],
  ["sweep", "Sweep India surplus", "Operations Account", "Investment Account", 210_000, "2026-09-17", "needs_review", "1020 Treasury Investments", "1040 India Operations Cash"],
  ["fee", "Wire fee", "Business Account", "Ramp Treasury", 15, "2026-09-16", "needs_review", "6050 Bank Fees", "1010 Operating Cash"],
];

export const treasuryLedgerRows: TreasuryLedgerRow[] = treasurySeeds.map(
  ([kind, title, from, to, amount, date, status, debit, credit, settles], index) => ({
    id: `trs_${(index + 1).toString().padStart(3, "0")}`,
    kind,
    title,
    from,
    to,
    amount,
    date,
    status,
    settles,
    coding: { debit, credit, class: kind === "interest" || kind === "fee" ? "Austin, TX" : null },
  }),
);
