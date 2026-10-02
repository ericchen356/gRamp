export const companyProfile = {
  legalName: "Efficient App, Inc.",
  dba: "Efficient App",
  ein: "86-2194821",
  industry: "software",
  size: "11-50",
  website: "efficient.app",
  phone: "(512) 555-0142",
  street: "500 W 2nd St, Suite 1900",
  city: "Austin",
  state: "TX",
  zip: "78701",
  fiscalYearStart: "january",
  currency: "USD",
};

export const industryOptions = [
  { value: "software", label: "Software & SaaS" },
  { value: "fintech", label: "Financial services" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "professional", label: "Professional services" },
];

export const sizeOptions = ["1-10", "11-50", "51-200", "201-500", "500+"].map((value) => ({ value, label: `${value} employees` }));

export const monthOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
].map((label) => ({ value: label.toLowerCase(), label }));

export const currencyOptions = [
  { value: "USD", label: "USD · US Dollar" },
  { value: "GBP", label: "GBP · British Pound" },
  { value: "EUR", label: "EUR · Euro" },
  { value: "INR", label: "INR · Indian Rupee" },
];

export const timezoneOptions = [
  { value: "America/Chicago", label: "Central Time (Austin)" },
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "America/Los_Angeles", label: "Pacific Time (San Francisco)" },
  { value: "Europe/London", label: "Greenwich Mean Time (London)" },
];

export const languageOptions = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

export const dateFormatOptions = [
  { value: "mdy", label: "MM/DD/YYYY" },
  { value: "dmy", label: "DD/MM/YYYY" },
  { value: "iso", label: "YYYY-MM-DD" },
];

export type Channel = "email" | "sms" | "slack";

export type NotificationEvent = {
  id: string;
  label: string;
  description: string;
  channels: Record<Channel, boolean>;
};

export const notificationGroups: { title: string; events: NotificationEvent[] }[] = [
  {
    title: "Cards & spend",
    events: [
      { id: "declined", label: "Transaction declined", description: "When a card transaction is declined", channels: { email: true, sms: true, slack: true } },
      { id: "receipt", label: "Missing receipts", description: "Reminders for transactions without a receipt", channels: { email: true, sms: false, slack: true } },
      { id: "limit", label: "Card limit reached", description: "When a card hits 90% of its limit", channels: { email: true, sms: false, slack: false } },
      { id: "shipped", label: "Card shipped", description: "Physical card shipping updates", channels: { email: true, sms: true, slack: false } },
    ],
  },
  {
    title: "Approvals",
    events: [
      { id: "approval", label: "Requests awaiting my approval", description: "Funds, reimbursements and bills", channels: { email: true, sms: false, slack: true } },
      { id: "decision", label: "Decisions on my requests", description: "When a request is approved or declined", channels: { email: true, sms: false, slack: true } },
    ],
  },
  {
    title: "Bill Pay & accounting",
    events: [
      { id: "bill", label: "Bill payment sent", description: "When a vendor payment is initiated", channels: { email: true, sms: false, slack: false } },
      { id: "sync", label: "Accounting sync failures", description: "When transactions fail to sync to QuickBooks", channels: { email: true, sms: false, slack: true } },
      { id: "close", label: "Weekly close summary", description: "Every Monday at 9:00 AM", channels: { email: true, sms: false, slack: false } },
    ],
  },
  {
    title: "Treasury",
    events: [
      { id: "balance", label: "Low balance alert", description: "When the business account drops below $50,000", channels: { email: true, sms: true, slack: true } },
      { id: "sweep", label: "Automated transfers", description: "Sweeps and scheduled deposits", channels: { email: false, sms: false, slack: false } },
    ],
  },
];

export type Integration = {
  name: string;
  /** Name passed to the logo component. */
  logo: string;
  description: string;
  category: "Accounting" | "HR & payroll" | "Communication" | "Travel & productivity";
  connected?: { since: string; lastSync?: string; account?: string };
  popular?: boolean;
};

export const integrations: Integration[] = [
  { name: "QuickBooks Online", logo: "QuickBooks", category: "Accounting", description: "Sync transactions, bills and reimbursements to your general ledger.", connected: { since: "2023-03-15", lastSync: "12 minutes ago", account: "Efficient App, Inc." } },
  { name: "NetSuite", logo: "NetSuite", category: "Accounting", description: "Multi-subsidiary sync with custom segments and auto-coding.", popular: true },
  { name: "Xero", logo: "Xero", category: "Accounting", description: "Push coded spend to Xero with tracking categories." },
  { name: "Sage Intacct", logo: "Sage Intacct", category: "Accounting", description: "Dimension-level coding for multi-entity close." },
  { name: "Gusto", logo: "Gusto", category: "HR & payroll", description: "Auto-provision cards and reimburse through payroll.", connected: { since: "2024-01-10", lastSync: "Today, 6:00 AM", account: "15 employees" } },
  { name: "Rippling", logo: "Rippling", category: "HR & payroll", description: "Keep departments, managers and offboarding in sync." },
  { name: "BambooHR", logo: "BambooHR", category: "HR & payroll", description: "Import the employee directory and org chart." },
  { name: "Slack", logo: "Slack", category: "Communication", description: "Approve requests and upload receipts from Slack.", connected: { since: "2023-04-02", account: "#finance-ops" } },
  { name: "Microsoft Teams", logo: "Microsoft Teams", category: "Communication", description: "Get approval requests and alerts in Teams." },
  { name: "Google Workspace", logo: "Google Workspace", category: "Travel & productivity", description: "Single sign-on and receipt forwarding from Gmail." },
  { name: "Amazon Business", logo: "Amazon", category: "Travel & productivity", description: "Match Amazon orders to receipts automatically." },
  { name: "Uber for Business", logo: "Uber", category: "Travel & productivity", description: "Ride receipts and memos imported automatically." },
];

export type BankAccountRow = {
  id: string;
  bank: string;
  nickname: string;
  type: "Checking" | "Savings";
  last4: string;
  routingLast4: string;
  entity: string;
  balance: number;
  status: "Verified" | "Pending verification";
  primary?: boolean;
};

export const bankAccounts: BankAccountRow[] = [
  { id: "b1", bank: "Chase", nickname: "Operating", type: "Checking", last4: "4021", routingLast4: "0021", entity: "Efficient App, Inc.", balance: 842311.07, status: "Verified", primary: true },
  { id: "b2", bank: "Silicon Valley Bank", nickname: "Payroll", type: "Checking", last4: "7783", routingLast4: "4170", entity: "Efficient App, Inc.", balance: 286400.0, status: "Verified" },
  { id: "b3", bank: "Ramp Treasury", nickname: "Business Account", type: "Checking", last4: "0918", routingLast4: "0391", entity: "Efficient App, Inc.", balance: 155851.11, status: "Verified" },
  { id: "b4", bank: "Barclays", nickname: "UK Operating", type: "Checking", last4: "5520", routingLast4: "2004", entity: "Efficient App Ltd", balance: 214880.4, status: "Verified" },
  { id: "b5", bank: "Mercury", nickname: "Reserve", type: "Savings", last4: "6604", routingLast4: "0098", entity: "Efficient App, Inc.", balance: 0, status: "Pending verification" },
];

export type Session = { id: string; device: string; browser: string; location: string; ip: string; lastActive: string; current?: boolean };

export const sessions: Session[] = [
  { id: "s1", device: "MacBook Pro", browser: "Chrome 141", location: "Austin, TX", ip: "104.28.62.19", lastActive: "Active now", current: true },
  { id: "s2", device: "iPhone 16 Pro", browser: "Ramp for iOS 5.42", location: "Austin, TX", ip: "172.58.110.4", lastActive: "2 hours ago" },
  { id: "s3", device: "iPad Air", browser: "Safari 19", location: "Dallas, TX", ip: "98.97.12.201", lastActive: "Yesterday, 8:14 PM" },
  { id: "s4", device: "Windows PC", browser: "Edge 140", location: "New York, NY", ip: "68.174.33.92", lastActive: "Sep 24, 2026" },
];

export const billing = {
  plan: "Ramp Plus",
  pricePerUser: 15,
  activeUsers: 15,
  nextInvoiceDate: "2026-10-31",
  renewal: "2027-03-14",
  paymentMethod: "Ramp Business Account ····0918",
  features: [
    "Procurement and intake-to-pay workflows",
    "Custom approval chains and multi-entity",
    "Advanced accounting rules and NetSuite custom fields",
    "5% back on hotels and flights booked through Ramp Travel",
    "Dedicated account manager and priority support",
  ],
};

export type Invoice = { id: string; number: string; date: string; period: string; amount: number; status: "Paid" | "Due" };

export const invoices: Invoice[] = [
  { id: "i1", number: "RP-2026-0930", date: "2026-09-30", period: "Sep 1 – Sep 30, 2026", amount: 225, status: "Paid" },
  { id: "i2", number: "RP-2026-0831", date: "2026-08-31", period: "Aug 1 – Aug 31, 2026", amount: 210, status: "Paid" },
  { id: "i3", number: "RP-2026-0731", date: "2026-07-31", period: "Jul 1 – Jul 31, 2026", amount: 210, status: "Paid" },
  { id: "i4", number: "RP-2026-0630", date: "2026-06-30", period: "Jun 1 – Jun 30, 2026", amount: 195, status: "Paid" },
  { id: "i5", number: "RP-2026-0531", date: "2026-05-31", period: "May 1 – May 31, 2026", amount: 195, status: "Paid" },
];

export type ApiKey = { id: string; name: string; key: string; scopes: string[]; created: string; lastUsed: string; createdBy: string };

export const apiKeys: ApiKey[] = [
  { id: "k1", name: "NetSuite middleware", key: "ramp_live_sk_8fd21c7a0be94e1d93a5c4f7e2b13f9a", scopes: ["transactions:read", "receipts:read"], created: "2025-11-04", lastUsed: "4 minutes ago", createdBy: "Tina Cruz" },
  { id: "k2", name: "Data warehouse sync", key: "ramp_live_sk_31b9e07dd2c44a8f8e6a0f5c9d72a41e", scopes: ["transactions:read", "users:read", "cards:read"], created: "2026-02-18", lastUsed: "1 hour ago", createdBy: "Alexander Bass" },
  { id: "k3", name: "Internal Slack bot", key: "ramp_live_sk_c47a2f1e9b0d4c3a8e5f6b7d1a2c07b2", scopes: ["cards:write", "limits:write"], created: "2026-07-09", lastUsed: "Sep 29, 2026", createdBy: "Ethan Park" },
];

export const apiScopes = ["transactions:read", "receipts:read", "users:read", "cards:read", "cards:write", "limits:write", "bills:read", "accounting:write"];

export type Webhook = { id: string; url: string; events: string[]; status: "Active" | "Failing" | "Disabled"; lastDelivery: string; successRate: number };

export const webhooks: Webhook[] = [
  { id: "w1", url: "https://api.efficient.app/hooks/ramp", events: ["transaction.cleared", "transaction.declined"], status: "Active", lastDelivery: "2 minutes ago", successRate: 99.98 },
  { id: "w2", url: "https://hooks.zapier.com/hooks/catch/1820431/ramp", events: ["reimbursement.approved"], status: "Active", lastDelivery: "Yesterday", successRate: 100 },
  { id: "w3", url: "https://etl.efficient.app/ingest/ramp-bills", events: ["bill.paid", "bill.created"], status: "Failing", lastDelivery: "Sep 30, 2026", successRate: 71.4 },
];
