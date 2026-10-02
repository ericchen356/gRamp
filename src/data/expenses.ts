import { cards } from "./cards";
import { transactions, type Transaction } from "./transactions";

/** Approval state of a card transaction from the expense-management side. */
export type ExpenseStatus = "approved" | "needs_approval" | "missing_items" | "flagged" | "declined";
export type ReceiptState = "attached" | "missing" | "not_required";

export type CardExpense = Transaction & {
  cardName: string;
  receipt: ReceiptState;
  expenseStatus: ExpenseStatus;
};

const RECEIPT_THRESHOLD = 75;

const memos: Record<string, string> = {
  Sweetgreen: "Lunch with Seattle agency team",
  Amazon: "Printer paper, toner and cables",
  Zoom: "Monthly Zoom Pro seats",
  Slack: "Slack Business+ annual seats",
  Uber: "Ride to Acme HQ for renewal meeting",
  "United Airlines": "SFO → JFK for Northwind onsite",
  Figma: "Figma Organization · 6 editors",
  Marriott: "2 nights · Marriott Marquis SF",
  "Amazon Web Services": "September AWS usage",
  "Google Workspace": "Workspace Business Standard",
  WeWork: "October hot desks · NYC",
  Linear: "Linear Plus seats",
  "Home Depot": "Shelving for supply closet",
  Hilton: "Hilton Union Square · client visit",
  Costco: "Kitchen restock",
  HubSpot: "HubSpot Marketing Pro",
  Datadog: "APM + logs",
  Airbnb: "Team stay for Dreamforce",
  Notion: "Notion Plus",
  Adobe: "Creative Cloud · 2 seats",
  Verizon: "Company phones",
  OpenAI: "API usage",
  Anthropic: "API usage",
  Salesforce: "Sales Cloud seats",
};

function statusFor(t: Transaction): ExpenseStatus {
  if (t.flagged) return "flagged";
  if (t.missing?.length) return "missing_items";
  if (t.amount >= 1000 && t.status === "needs_review") return "needs_approval";
  return "approved";
}

function receiptFor(t: Transaction): ReceiptState {
  if (t.missing?.includes("receipt")) return "missing";
  return t.amount < RECEIPT_THRESHOLD ? "not_required" : "attached";
}

/** Card transactions as seen from Expenses: same ledger as Accounting, with policy state. */
export const cardExpenses: CardExpense[] = transactions.map((t) => ({
  ...t,
  memo: t.missing?.includes("memo") ? undefined : (t.memo ?? memos[t.merchant]),
  cardName: cards.find((card) => card.last4 === t.cardLast4)?.name ?? "Physical card",
  receipt: receiptFor(t),
  expenseStatus: statusFor(t),
}));

export const expenseStatusLabels: Record<ExpenseStatus, string> = {
  approved: "Approved",
  needs_approval: "Needs approval",
  missing_items: "Missing items",
  flagged: "Flagged",
  declined: "Declined",
};

export type ReimbursementType = "Out-of-pocket" | "Mileage" | "Per diem";
export type ReimbursementStatus = "pending" | "approved" | "paid" | "needs_info" | "rejected";

export type Reimbursement = {
  id: string;
  employee: string;
  type: ReimbursementType;
  merchant: string;
  category: string;
  amount: number;
  submitted: string;
  /** Date the expense was incurred. */
  spent: string;
  status: ReimbursementStatus;
  approver: string;
  memo: string;
  /** Mileage only. */
  miles?: number;
};

export const reimbursements: Reimbursement[] = [
  { id: "re_1001", employee: "Priya Raman", type: "Out-of-pocket", merchant: "Blue Bottle Coffee", category: "Restaurants", amount: 42.5, submitted: "2026-10-01", spent: "2026-09-30", status: "pending", approver: "Marcus Hale", memo: "Coffee with Brex → Ramp switcher (prospect)" },
  { id: "re_1002", employee: "Jordan Lee", type: "Mileage", merchant: "Mileage", category: "Mileage", amount: 98.42, submitted: "2026-10-01", spent: "2026-09-29", status: "pending", approver: "Sofia Alvarez", memo: "Palo Alto ↔ San Jose customer visits", miles: 140.6 },
  { id: "re_1003", employee: "Ethan Park", type: "Out-of-pocket", merchant: "O'Reilly Media", category: "Education", amount: 499, submitted: "2026-09-30", spent: "2026-09-28", status: "needs_info", approver: "Hannah Okafor", memo: "Annual learning subscription" },
  { id: "re_1004", employee: "Grace Whitfield", type: "Per diem", merchant: "Per diem · Chicago", category: "Travel", amount: 237, submitted: "2026-09-30", spent: "2026-09-26", status: "approved", approver: "Liam Novak", memo: "3 days · campus recruiting fair" },
  { id: "re_1005", employee: "Noah Kim", type: "Out-of-pocket", merchant: "B&H Photo", category: "Electronics", amount: 189.99, submitted: "2026-09-29", spent: "2026-09-27", status: "approved", approver: "Hannah Okafor", memo: "USB-C dock for design workstation" },
  { id: "re_1006", employee: "Diego Santos", type: "Out-of-pocket", merchant: "Shell", category: "Fuel and Gas", amount: 61.18, submitted: "2026-09-28", spent: "2026-09-28", status: "paid", approver: "Sofia Alvarez", memo: "Rental car refuel · Oakland" },
  { id: "re_1007", employee: "Tina Cruz", type: "Out-of-pocket", merchant: "Texas Secretary of State", category: "Government Services", amount: 300, submitted: "2026-09-27", spent: "2026-09-25", status: "paid", approver: "Alexander Bass", memo: "Annual franchise tax filing fee" },
  { id: "re_1008", employee: "Mia Chen", type: "Mileage", merchant: "Mileage", category: "Mileage", amount: 34.3, submitted: "2026-09-26", spent: "2026-09-24", status: "paid", approver: "Tina Cruz", memo: "Bank deposit run", miles: 49 },
  { id: "re_1009", employee: "Marcus Hale", type: "Out-of-pocket", merchant: "Canva", category: "SaaS / Software", amount: 119.99, submitted: "2026-09-25", spent: "2026-09-25", status: "rejected", approver: "Alexander Bass", memo: "Canva Pro · should go on Marketing tools card" },
  { id: "re_1010", employee: "Ava Thompson", type: "Out-of-pocket", merchant: "Trader Joe's", category: "Groceries", amount: 76.84, submitted: "2026-09-24", spent: "2026-09-23", status: "paid", approver: "Liam Novak", memo: "Snacks for all-hands" },
  { id: "re_1011", employee: "Sofia Alvarez", type: "Per diem", merchant: "Per diem · New York", category: "Travel", amount: 316, submitted: "2026-09-22", spent: "2026-09-19", status: "paid", approver: "Alexander Bass", memo: "4 days · Northwind QBR" },
  { id: "re_1012", employee: "Hannah Okafor", type: "Out-of-pocket", merchant: "Eventbrite", category: "Education", amount: 249, submitted: "2026-09-20", spent: "2026-09-18", status: "approved", approver: "Alexander Bass", memo: "Staff+ engineering summit ticket" },
];

export const reimbursementStatusLabels: Record<ReimbursementStatus, string> = {
  pending: "Pending approval",
  approved: "Approved",
  paid: "Paid",
  needs_info: "Needs info",
  rejected: "Rejected",
};

export type TripLeg =
  | {
      kind: "flight";
      carrier: string;
      flight: string;
      from: string;
      to: string;
      date: string;
      departs: string;
      arrives: string;
      cabin: string;
      amount: number;
    }
  | {
      kind: "hotel";
      name: string;
      brand: string;
      city: string;
      checkIn: string;
      nights: number;
      amount: number;
    }
  | {
      kind: "car";
      company: string;
      city: string;
      pickUp: string;
      days: number;
      amount: number;
    };

export type TripPolicy = "in_policy" | "out_of_policy" | "pending_approval";

export type Trip = {
  id: string;
  name: string;
  destination: string;
  purpose: string;
  travelers: string[];
  start: string;
  end: string;
  policy: TripPolicy;
  policyNote?: string;
  legs: TripLeg[];
};

export const trips: Trip[] = [
  {
    id: "trip_01",
    name: "Northwind renewal onsite",
    destination: "New York, NY",
    purpose: "Customer visit",
    travelers: ["Sofia Alvarez", "Jordan Lee"],
    start: "2026-10-07",
    end: "2026-10-09",
    policy: "in_policy",
    legs: [
      { kind: "flight", carrier: "Delta", flight: "DL 1488", from: "SFO", to: "JFK", date: "2026-10-07", departs: "7:05 AM", arrives: "3:41 PM", cabin: "Economy", amount: 1124.6 },
      { kind: "hotel", name: "Marriott Marquis Times Square", brand: "Marriott", city: "New York", checkIn: "2026-10-07", nights: 2, amount: 1096.0 },
      { kind: "flight", carrier: "Delta", flight: "DL 2213", from: "JFK", to: "SFO", date: "2026-10-09", departs: "6:30 PM", arrives: "9:58 PM", cabin: "Economy", amount: 0 },
    ],
  },
  {
    id: "trip_02",
    name: "SaaStr Annual",
    destination: "San Mateo, CA",
    purpose: "Conference",
    travelers: ["Marcus Hale", "Priya Raman", "Grace Whitfield"],
    start: "2026-10-14",
    end: "2026-10-16",
    policy: "pending_approval",
    policyNote: "Awaiting approval from Alexander Bass",
    legs: [
      { kind: "flight", carrier: "United Airlines", flight: "UA 1734", from: "SEA", to: "SFO", date: "2026-10-14", departs: "8:20 AM", arrives: "10:32 AM", cabin: "Economy", amount: 1362.9 },
      { kind: "hotel", name: "Hilton San Francisco Airport Bayfront", brand: "Hilton", city: "Burlingame", checkIn: "2026-10-14", nights: 2, amount: 1488.0 },
      { kind: "car", company: "Hertz", city: "SFO", pickUp: "2026-10-14", days: 3, amount: 274.35 },
    ],
  },
  {
    id: "trip_03",
    name: "Engineering offsite",
    destination: "Austin, TX",
    purpose: "Team offsite",
    travelers: ["Hannah Okafor", "Ethan Park", "Noah Kim"],
    start: "2026-11-03",
    end: "2026-11-06",
    policy: "out_of_policy",
    policyNote: "Hotel exceeds $300/night cap by $42",
    legs: [
      { kind: "flight", carrier: "United Airlines", flight: "UA 2091", from: "EWR", to: "AUS", date: "2026-11-03", departs: "9:15 AM", arrives: "12:48 PM", cabin: "Economy Plus", amount: 1687.2 },
      { kind: "hotel", name: "Hotel Van Zandt", brand: "Van Zandt", city: "Austin", checkIn: "2026-11-03", nights: 3, amount: 3078.0 },
    ],
  },
  {
    id: "trip_04",
    name: "Dreamforce",
    destination: "San Francisco, CA",
    purpose: "Conference",
    travelers: ["Diego Santos"],
    start: "2026-11-17",
    end: "2026-11-19",
    policy: "in_policy",
    legs: [
      { kind: "hotel", name: "Airbnb · SoMa loft", brand: "Airbnb", city: "San Francisco", checkIn: "2026-11-17", nights: 2, amount: 512.0 },
    ],
  },
];

export const travelStats = {
  quarterSpend: 48210.73,
  quarterChange: 0.12,
  avgFlight: 412.38,
  avgNightly: 268.5,
  inPolicyRate: 0.94,
  upcomingTrips: trips.length,
  travelersThisMonth: 9,
};

/** Monthly travel spend, oldest → newest (Apr–Sep). */
export const travelSpendTrend = [9810, 12440, 8820, 15260, 13730, 19220];

export type PolicyRule = {
  id: string;
  title: string;
  description: string;
  /** Editable limit, when the rule has one. */
  value?: number;
  unit?: "usd" | "usd_per_mile" | "days" | "usd_per_night";
  enabled: boolean;
};

export type PolicySection = {
  id: string;
  title: string;
  description: string;
  appliesTo: string;
  rules: PolicyRule[];
};

export const expensePolicy: PolicySection[] = [
  {
    id: "documentation",
    title: "Receipts & documentation",
    description: "What employees need to submit with each card transaction or reimbursement.",
    appliesTo: "All employees",
    rules: [
      { id: "receipt_threshold", title: "Require a receipt over", description: "Transactions above this amount are flagged until a receipt is attached.", value: 75, unit: "usd", enabled: true },
      { id: "itemized_meals", title: "Itemized receipts for meals", description: "Restaurant receipts must show line items, not just the total.", enabled: true },
      { id: "memo_required", title: "Require a memo over", description: "Employees must explain the business purpose above this amount.", value: 25, unit: "usd", enabled: true },
      { id: "attendees", title: "Collect attendees for team meals", description: "Ask for attendee names when a meal is over $100.", enabled: false },
    ],
  },
  {
    id: "meals",
    title: "Meals & entertainment",
    description: "Limits for individual and team meals while working or traveling.",
    appliesTo: "All employees",
    rules: [
      { id: "meal_daily", title: "Daily meal limit", description: "Covers breakfast, lunch and dinner for one person.", value: 75, unit: "usd", enabled: true },
      { id: "meal_team", title: "Team meal limit per attendee", description: "Applies when two or more employees are present.", value: 50, unit: "usd", enabled: true },
      { id: "alcohol", title: "Block alcohol-only purchases", description: "Bars and liquor stores are declined at the point of sale.", enabled: true },
    ],
  },
  {
    id: "travel",
    title: "Travel",
    description: "Booking rules for flights, hotels and ground transportation.",
    appliesTo: "Employees who travel",
    rules: [
      { id: "hotel_cap", title: "Hotel nightly cap", description: "Higher-cost cities (NYC, SF) automatically get +25%.", value: 300, unit: "usd_per_night", enabled: true },
      { id: "economy", title: "Economy class for flights under 6 hours", description: "Premium economy is allowed on longer flights.", enabled: true },
      { id: "advance_booking", title: "Book flights in advance", description: "Flag flights booked fewer than this many days before departure.", value: 14, unit: "days", enabled: false },
      { id: "preferred_vendors", title: "Prefer Ramp Travel bookings", description: "Out-of-platform bookings require a justification.", enabled: true },
    ],
  },
  {
    id: "reimbursements",
    title: "Reimbursements",
    description: "How out-of-pocket expenses are submitted and paid back.",
    appliesTo: "All employees",
    rules: [
      { id: "mileage_rate", title: "Mileage rate", description: "Matches the 2026 IRS standard business rate.", value: 0.7, unit: "usd_per_mile", enabled: true },
      { id: "submit_window", title: "Submission deadline", description: "Reimbursements must be submitted within this many days of purchase.", value: 30, unit: "days", enabled: true },
      { id: "auto_approve", title: "Auto-approve under", description: "Small, in-policy reimbursements skip manager approval.", value: 25, unit: "usd", enabled: false },
    ],
  },
];
