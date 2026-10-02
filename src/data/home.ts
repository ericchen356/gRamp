export const businessAccount = {
  balance: 1284512.18,
  available: 1196230.42,
  /** Balance at the end of each of the last 12 weeks (sparkline). */
  trend: [1012400, 1048210, 1031980, 1094300, 1120540, 1108120, 1153900, 1172660, 1161020, 1219840, 1248310, 1284512],
};

export const creditLine = {
  limit: 1000000,
  used: 357700,
  statementDate: "2026-10-31",
};

export const cashback = {
  yearToDate: 83683.56,
  thisMonth: 5385.56,
  rate: 1.5,
  monthly: [6120, 6540, 7010, 6880, 7430, 8020, 8410, 8960, 9240, 9688, 5385],
};

export type HomeTask = {
  id: string;
  label: string;
  detail: string;
  count: number;
  /** Inbox tab the task deep-links to. */
  tab: "approvals" | "missing" | "reimbursements" | "bills" | "cards";
  urgent?: boolean;
};

export const homeTasks: HomeTask[] = [
  { id: "t_approvals", label: "Review approvals", detail: "Oldest waiting 4 days", count: 58, tab: "approvals", urgent: true },
  { id: "t_missing", label: "Missing receipts and memos", detail: "Across 19 cardholders", count: 64, tab: "missing" },
  { id: "t_reimb", label: "Approve reimbursements", detail: "$9,482.16 requested", count: 21, tab: "reimbursements" },
  { id: "t_bills", label: "Bills ready to pay", detail: "3 due this week", count: 17, tab: "bills", urgent: true },
  { id: "t_cards", label: "Card requests", detail: "From Sales and Engineering", count: 7, tab: "cards" },
];

export type UpcomingBill = {
  id: string;
  vendor: string;
  invoice: string;
  amount: number;
  due: string;
  status: "scheduled" | "approval" | "overdue";
};

export const upcomingBills: UpcomingBill[] = [
  { id: "b_1", vendor: "WeWork", invoice: "INV-10422", amount: 21000, due: "2026-10-05", status: "scheduled" },
  { id: "b_2", vendor: "Salesforce", invoice: "SF-2026-0931", amount: 37500, due: "2026-10-08", status: "approval" },
  { id: "b_3", vendor: "Gusto", invoice: "Payroll fees · Oct", amount: 1840.5, due: "2026-10-09", status: "scheduled" },
  { id: "b_4", vendor: "Rippling", invoice: "RP-88213", amount: 4620, due: "2026-09-30", status: "overdue" },
  { id: "b_5", vendor: "Carta", invoice: "CA-55102", amount: 2900, due: "2026-10-14", status: "approval" },
];
