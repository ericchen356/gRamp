export type MyCard = {
  id: string;
  name: string;
  kind: "Physical" | "Virtual";
  last4: string;
  expires: string;
  spent: number;
  limit: number;
  interval: "Monthly" | "Annual" | "One-time";
  /** Visual finish of the card face. */
  finish: "black" | "sage" | "stone";
  status: "Active" | "Locked";
  merchantLock?: string;
};

export const myCards: MyCard[] = [
  { id: "card_0042", name: "Alexander Bass", kind: "Physical", last4: "0042", expires: "08/29", spent: 4182.4, limit: 10000, interval: "Monthly", finish: "black", status: "Active" },
  { id: "card_4417", name: "Software subscriptions", kind: "Virtual", last4: "4417", expires: "03/28", spent: 1922, limit: 2500, interval: "Monthly", finish: "sage", status: "Active", merchantLock: "SaaS / Software" },
  { id: "card_9013", name: "Team offsites", kind: "Virtual", last4: "9013", expires: "11/27", spent: 2860.75, limit: 6000, interval: "Annual", finish: "stone", status: "Active" },
];

export type AttentionItem = {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  card: string;
  category: string;
};

export const attentionItems: AttentionItem[] = [
  { id: "att_1", merchant: "Google Workspace", amount: 672, date: "2026-09-27", card: "0042", category: "SaaS / Software" },
  { id: "att_2", merchant: "Notion", amount: 240, date: "2026-09-20", card: "4417", category: "SaaS / Software" },
];

export type MyTransaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  card: string;
  receipt: boolean;
  memo?: string;
  pending?: boolean;
};

export const myTransactions: MyTransaction[] = [
  { id: "mt_1", merchant: "Slack", category: "SaaS / Software", amount: 1250, date: "2026-09-30", card: "4417", receipt: true, memo: "Pro plan · 50 seats" },
  { id: "mt_2", merchant: "Uber", category: "Rideshare", amount: 27.4, date: "2026-09-30", card: "0042", receipt: true, pending: true },
  { id: "mt_3", merchant: "Sweetgreen", category: "Restaurants", amount: 61.85, date: "2026-09-29", card: "0042", receipt: true, memo: "Lunch with Tina — Q4 close planning" },
  { id: "mt_4", merchant: "Google Workspace", category: "SaaS / Software", amount: 672, date: "2026-09-27", card: "0042", receipt: false },
  { id: "mt_5", merchant: "Delta", category: "Airlines", amount: 486.2, date: "2026-09-25", card: "9013", receipt: true, memo: "AUS → JFK, offsite" },
  { id: "mt_6", merchant: "Marriott", category: "Lodging", amount: 1240.6, date: "2026-09-24", card: "9013", receipt: true, memo: "Offsite lodging, 2 nights" },
  { id: "mt_7", merchant: "Notion", category: "SaaS / Software", amount: 240, date: "2026-09-20", card: "4417", receipt: false },
  { id: "mt_8", merchant: "Figma", category: "SaaS / Software", amount: 180, date: "2026-09-18", card: "4417", receipt: true },
  { id: "mt_9", merchant: "Starbucks", category: "Restaurants", amount: 14.3, date: "2026-09-17", card: "0042", receipt: true },
];

export type ReimbursementStatus = "draft" | "pending" | "approved" | "paid" | "rejected";

export type Reimbursement = {
  id: string;
  merchant: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: ReimbursementStatus;
  approver?: string;
};

export const myReimbursements: Reimbursement[] = [
  { id: "re_1", merchant: "Lyft", description: "Airport ride — SaaStr", category: "Rideshare", amount: 58.4, date: "2026-09-28", status: "pending", approver: "Tina Cruz" },
  { id: "re_2", merchant: "Amazon", description: "Standing desk mat", category: "Office Supplies", amount: 89.99, date: "2026-09-21", status: "approved", approver: "Tina Cruz" },
  { id: "re_3", merchant: "Mileage", description: "Client visit — Round Rock (42 mi)", category: "Mileage", amount: 28.14, date: "2026-09-15", status: "paid", approver: "Tina Cruz" },
  { id: "re_4", merchant: "WSJ", description: "Annual subscription", category: "Subscriptions", amount: 233.88, date: "2026-09-02", status: "paid", approver: "Tina Cruz" },
  { id: "re_5", merchant: "Parking", description: "Downtown garage — board meeting", category: "Parking", amount: 32, date: "2026-08-28", status: "rejected", approver: "Tina Cruz" },
];

export const reimbursementCategories = [
  "Meals",
  "Rideshare",
  "Mileage",
  "Parking",
  "Office Supplies",
  "Subscriptions",
  "Travel",
  "Other",
];
