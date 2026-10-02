export type AccountingStatus = "needs_review" | "ready_to_sync" | "waiting" | "synced";

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  cardholder: string;
  cardLast4: string;
  flagged?: boolean;
  /** Missing receipt / memo from the cardholder. */
  missing?: ("receipt" | "memo")[];
  /** Coding was auto-applied by an accounting rule; number = rule matches. */
  autoCoded?: number;
  department: string;
  location: string;
  job?: string;
  glAccount: string;
  billable?: boolean;
  memo?: string;
  status: AccountingStatus;
  pending?: boolean;
};

const raw: Omit<Transaction, "id">[] = [
  { merchant: "Sweetgreen", category: "Restaurants", amount: 48.21, date: "2026-09-30", cardholder: "Marcus Hale", cardLast4: "4021", flagged: true, missing: ["receipt"], department: "Marketing", location: "Seattle", job: "Tail B", glAccount: "6110 Meals & Entertainment", status: "ready_to_sync" },
  { merchant: "Amazon", category: "General Merchandise", amount: 86.4, date: "2026-09-29", cardholder: "Liam Novak", cardLast4: "7783", missing: ["receipt"], department: "Operations", location: "New York", glAccount: "6200 Office Supplies", status: "ready_to_sync" },
  { merchant: "Amazon", category: "General Merchandise", amount: 32.99, date: "2026-09-29", cardholder: "Ava Thompson", cardLast4: "1190", missing: ["receipt"], department: "Operations", location: "New York", glAccount: "6200 Office Supplies", status: "ready_to_sync" },
  { merchant: "Zoom", category: "SaaS / Software", amount: 149.9, date: "2026-09-28", cardholder: "Priya Raman", cardLast4: "5520", autoCoded: 15, pending: true, department: "Marketing", location: "New York", glAccount: "6410 Software", status: "ready_to_sync" },
  { merchant: "Delta", category: "Fuel and Gas", amount: 44.55, date: "2026-09-27", cardholder: "Jordan Lee", cardLast4: "3317", flagged: true, missing: ["memo"], department: "Sales", location: "San Francisco", glAccount: "6320 Travel", status: "ready_to_sync" },
  { merchant: "Slack", category: "SaaS / Software", amount: 1250, date: "2026-09-30", cardholder: "Alexander Bass", cardLast4: "0042", department: "Engineering", location: "New York", glAccount: "6410 Software", status: "needs_review", autoCoded: 8 },
  { merchant: "Uber", category: "Rideshare", amount: 38.72, date: "2026-09-30", cardholder: "Sofia Alvarez", cardLast4: "6604", department: "Sales", location: "San Francisco", glAccount: "6320 Travel", status: "needs_review" },
  { merchant: "United Airlines", category: "Airlines", amount: 642.3, date: "2026-09-29", cardholder: "Diego Santos", cardLast4: "8812", department: "Sales", location: "San Francisco", glAccount: "6320 Travel", status: "needs_review", missing: ["receipt"] },
  { merchant: "Figma", category: "SaaS / Software", amount: 540, date: "2026-09-29", cardholder: "Noah Kim", cardLast4: "2208", department: "Design", location: "Seattle", glAccount: "6410 Software", status: "needs_review", autoCoded: 4 },
  { merchant: "Marriott", category: "Lodging", amount: 389.14, date: "2026-09-28", cardholder: "Jordan Lee", cardLast4: "3317", department: "Sales", location: "San Francisco", glAccount: "6320 Travel", status: "needs_review", flagged: true },
  { merchant: "Amazon Web Services", category: "Cloud Infrastructure", amount: 8420.66, date: "2026-09-28", cardholder: "Hannah Okafor", cardLast4: "9930", department: "Engineering", location: "New York", glAccount: "6420 Hosting", status: "needs_review", autoCoded: 12 },
  { merchant: "Starbucks", category: "Restaurants", amount: 18.45, date: "2026-09-27", cardholder: "Grace Whitfield", cardLast4: "1450", department: "People", location: "Remote", glAccount: "6110 Meals & Entertainment", status: "needs_review", missing: ["receipt", "memo"] },
  { merchant: "Google Workspace", category: "SaaS / Software", amount: 672, date: "2026-09-27", cardholder: "Alexander Bass", cardLast4: "0042", department: "Operations", location: "Austin, TX", glAccount: "6410 Software", status: "needs_review", autoCoded: 6 },
  { merchant: "WeWork", category: "Rent", amount: 4200, date: "2026-09-26", cardholder: "Liam Novak", cardLast4: "7783", department: "Operations", location: "New York", glAccount: "6500 Rent", status: "needs_review" },
  { merchant: "Linear", category: "SaaS / Software", amount: 320, date: "2026-09-26", cardholder: "Ethan Park", cardLast4: "6121", department: "Engineering", location: "New York", glAccount: "6410 Software", status: "needs_review" },
  { merchant: "DoorDash", category: "Restaurants", amount: 212.8, date: "2026-09-25", cardholder: "Hannah Okafor", cardLast4: "9930", department: "Engineering", location: "New York", glAccount: "6110 Meals & Entertainment", status: "needs_review", flagged: true, missing: ["memo"] },
  { merchant: "Home Depot", category: "Hardware", amount: 156.32, date: "2026-09-25", cardholder: "Ava Thompson", cardLast4: "1190", department: "Operations", location: "Austin, TX", glAccount: "6200 Office Supplies", status: "waiting", missing: ["receipt"] },
  { merchant: "Lyft", category: "Rideshare", amount: 24.1, date: "2026-09-25", cardholder: "Priya Raman", cardLast4: "5520", department: "Marketing", location: "New York", glAccount: "6320 Travel", status: "waiting", missing: ["memo"] },
  { merchant: "Hilton", category: "Lodging", amount: 512.88, date: "2026-09-24", cardholder: "Diego Santos", cardLast4: "8812", department: "Sales", location: "San Francisco", glAccount: "6320 Travel", status: "waiting", missing: ["receipt"] },
  { merchant: "FedEx", category: "Shipping", amount: 64.2, date: "2026-09-24", cardholder: "Ava Thompson", cardLast4: "1190", department: "Operations", location: "Austin, TX", glAccount: "6230 Postage & Shipping", status: "waiting", missing: ["receipt", "memo"] },
  { merchant: "Costco", category: "General Merchandise", amount: 431.07, date: "2026-09-23", cardholder: "Liam Novak", cardLast4: "7783", department: "Operations", location: "New York", glAccount: "6200 Office Supplies", status: "waiting", missing: ["receipt"] },
  { merchant: "HubSpot", category: "SaaS / Software", amount: 1800, date: "2026-09-22", cardholder: "Marcus Hale", cardLast4: "4021", department: "Marketing", location: "Seattle", glAccount: "6410 Software", status: "synced" },
  { merchant: "Datadog", category: "SaaS / Software", amount: 2310.45, date: "2026-09-21", cardholder: "Hannah Okafor", cardLast4: "9930", department: "Engineering", location: "New York", glAccount: "6420 Hosting", status: "synced" },
  { merchant: "Airbnb", category: "Lodging", amount: 980, date: "2026-09-20", cardholder: "Sofia Alvarez", cardLast4: "6604", department: "Sales", location: "San Francisco", glAccount: "6320 Travel", status: "synced" },
  { merchant: "Notion", category: "SaaS / Software", amount: 240, date: "2026-09-20", cardholder: "Alexander Bass", cardLast4: "0042", department: "Operations", location: "Austin, TX", glAccount: "6410 Software", status: "synced" },
  { merchant: "Adobe", category: "SaaS / Software", amount: 359.88, date: "2026-09-19", cardholder: "Noah Kim", cardLast4: "2208", department: "Design", location: "Seattle", glAccount: "6410 Software", status: "synced" },
  { merchant: "Verizon", category: "Telecommunications", amount: 289.5, date: "2026-09-18", cardholder: "Liam Novak", cardLast4: "7783", department: "Operations", location: "New York", glAccount: "6600 Utilities", status: "synced" },
  { merchant: "OpenAI", category: "SaaS / Software", amount: 600, date: "2026-09-18", cardholder: "Ethan Park", cardLast4: "6121", department: "Engineering", location: "New York", glAccount: "6410 Software", status: "synced" },
  { merchant: "Anthropic", category: "SaaS / Software", amount: 900, date: "2026-09-17", cardholder: "Ethan Park", cardLast4: "6121", department: "Engineering", location: "New York", glAccount: "6410 Software", status: "synced" },
  { merchant: "Salesforce", category: "SaaS / Software", amount: 3750, date: "2026-09-15", cardholder: "Sofia Alvarez", cardLast4: "6604", department: "Sales", location: "San Francisco", glAccount: "6410 Software", status: "synced" },
];

export const transactions: Transaction[] = raw.map((transaction, index) => ({
  ...transaction,
  id: `txn_${(index + 1).toString().padStart(4, "0")}`,
}));

/** Header counts shown in the Accounting tabs (production-scale numbers). */
export const accountingCounts = {
  overview: 279,
  needs_review: 274,
  ready_to_sync: 5,
  waiting: 36,
};

export const quickbooks = {
  departments: ["Marketing", "Operations", "Sales", "Engineering", "Finance", "Design", "People"],
  classes: ["Seattle", "New York", "San Francisco", "Austin, TX", "Remote"],
  jobs: ["Tail A", "Tail B", "Project Atlas", "Q4 Launch", "Customer Summit"],
  glAccounts: [
    "6110 Meals & Entertainment",
    "6200 Office Supplies",
    "6230 Postage & Shipping",
    "6320 Travel",
    "6410 Software",
    "6420 Hosting",
    "6500 Rent",
    "6600 Utilities",
  ],
};
