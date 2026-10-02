export type HelpCategoryId = "cards" | "bill-pay" | "reimbursements" | "accounting" | "treasury" | "travel";

export type HelpCategory = { id: HelpCategoryId; name: string; description: string; articles: number };

export const helpCategories: HelpCategory[] = [
  { id: "cards", name: "Cards", description: "Issue, lock and set limits on physical and virtual cards.", articles: 64 },
  { id: "bill-pay", name: "Bill Pay", description: "Upload invoices, approvals and paying vendors.", articles: 48 },
  { id: "reimbursements", name: "Reimbursements", description: "Out-of-pocket expenses, mileage and payouts.", articles: 31 },
  { id: "accounting", name: "Accounting", description: "Syncing, coding rules and month-end close.", articles: 57 },
  { id: "treasury", name: "Treasury", description: "Business accounts, yield and transfers.", articles: 22 },
  { id: "travel", name: "Travel", description: "Booking flights and hotels with Ramp Travel.", articles: 26 },
];

export type HelpArticle = { id: string; title: string; category: HelpCategoryId; readMinutes: number; updated: string };

export const helpArticles: HelpArticle[] = [
  { id: "a1", title: "Set up spend limits and approval policies for your team", category: "cards", readMinutes: 4, updated: "2026-09-18" },
  { id: "a2", title: "Connect QuickBooks Online and map your chart of accounts", category: "accounting", readMinutes: 6, updated: "2026-09-02" },
  { id: "a3", title: "Pay a vendor by ACH, check or international wire", category: "bill-pay", readMinutes: 3, updated: "2026-08-27" },
  { id: "a4", title: "Submit a mileage reimbursement from the mobile app", category: "reimbursements", readMinutes: 2, updated: "2026-09-21" },
  { id: "a5", title: "Automate receipt matching with email forwarding", category: "accounting", readMinutes: 3, updated: "2026-07-30" },
  { id: "a6", title: "How yield is calculated on your Ramp Business Account", category: "treasury", readMinutes: 5, updated: "2026-09-11" },
  { id: "a7", title: "Lock, replace or cancel a lost card", category: "cards", readMinutes: 2, updated: "2026-06-14" },
  { id: "a8", title: "Book a trip within policy and earn 5% back with Ramp Plus", category: "travel", readMinutes: 4, updated: "2026-09-25" },
];

export type TicketStatus = "Open" | "Waiting on you" | "Resolved";

export type Ticket = { id: string; subject: string; category: string; status: TicketStatus; updated: string; agent: string };

export const tickets: Ticket[] = [
  { id: "#48213", subject: "NetSuite subsidiary mapping for UK entity", category: "Accounting", status: "Open", updated: "2026-10-01", agent: "Maya R." },
  { id: "#48170", subject: "Vendor payment to Barclays returned (R03)", category: "Bill Pay", status: "Waiting on you", updated: "2026-09-30", agent: "Chris D." },
  { id: "#47902", subject: "Increase company-wide card limit to $750k", category: "Cards", status: "Resolved", updated: "2026-09-22", agent: "Maya R." },
  { id: "#47655", subject: "Duplicate receipts after Gmail forwarding", category: "Accounting", status: "Resolved", updated: "2026-09-09", agent: "Priscilla T." },
];
