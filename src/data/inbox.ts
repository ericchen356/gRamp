export type InboxType = "approval" | "missing" | "reimbursement" | "bill" | "card";

export type InboxItem = {
  id: string;
  type: InboxType;
  /** Person who raised the request (or the cardholder for missing items). */
  requester: string;
  amount: number;
  /** Merchant / vendor, when the item is tied to one. */
  merchant?: string;
  /** Short subject used in the title ("Figma annual renewal"). */
  subject: string;
  category: string;
  department: string;
  submitted: string;
  due?: string;
  memo?: string;
  policy?: string;
  /** Out-of-policy or unusual items show a warning line. */
  warning?: string;
  /** For missing items: what's missing. */
  missing?: ("receipt" | "memo")[];
  /** For card requests. */
  cardType?: "Virtual" | "Physical";
  frequency?: "Monthly" | "One-time" | "Annual";
  invoice?: string;
};

export const inboxTabs: { value: "all" | InboxType; label: string; count: number }[] = [
  { value: "all", label: "All", count: 167 },
  { value: "approval", label: "Approvals", count: 58 },
  { value: "missing", label: "Missing items", count: 64 },
  { value: "reimbursement", label: "Reimbursements", count: 21 },
  { value: "bill", label: "Bills", count: 17 },
  { value: "card", label: "Card requests", count: 7 },
];

/** Route `?tab=` aliases used by Home deep links. */
export const tabAliases: Record<string, "all" | InboxType> = {
  all: "all",
  approvals: "approval",
  missing: "missing",
  reimbursements: "reimbursement",
  bills: "bill",
  cards: "card",
};

const raw: Omit<InboxItem, "id">[] = [
  { type: "reimbursement", requester: "Priya Raman", amount: 1240, merchant: "Marriott", subject: "Client offsite lodging", category: "Lodging", department: "Marketing", submitted: "2026-09-30", due: "2026-10-04", memo: "Two nights in Brooklyn for the Q4 brand offsite with Lumen.", policy: "Travel & lodging" },
  { type: "approval", requester: "Hannah Okafor", amount: 8420.66, merchant: "Amazon Web Services", subject: "Card limit increase for AWS", category: "Cloud Infrastructure", department: "Engineering", submitted: "2026-09-30", due: "2026-10-03", memo: "Load testing for the November launch pushes us over the $8k card limit.", policy: "Software & infrastructure", warning: "Exceeds monthly card limit by $420.66" },
  { type: "bill", requester: "Liam Novak", amount: 21000, merchant: "WeWork", subject: "October office rent", category: "Rent", department: "Operations", submitted: "2026-09-29", due: "2026-10-05", invoice: "INV-10422", policy: "Facilities" },
  { type: "missing", requester: "Marcus Hale", amount: 48.21, merchant: "Sweetgreen", subject: "Team lunch", category: "Restaurants", department: "Marketing", submitted: "2026-09-30", missing: ["receipt"], policy: "Meals" },
  { type: "card", requester: "Diego Santos", amount: 3000, subject: "Conference travel card", category: "Travel", department: "Sales", submitted: "2026-09-29", cardType: "Virtual", frequency: "One-time", memo: "SaaStr Annual — flights, hotel and meals for 3 days.", policy: "Travel & lodging" },
  { type: "approval", requester: "Sofia Alvarez", amount: 3750, merchant: "Salesforce", subject: "Salesforce seat expansion", category: "SaaS / Software", department: "Sales", submitted: "2026-09-29", due: "2026-10-06", memo: "Adding 5 Sales Cloud seats for new AEs starting in October.", policy: "Software & infrastructure" },
  { type: "reimbursement", requester: "Jordan Lee", amount: 86.5, merchant: "Uber", subject: "Rides to customer meetings", category: "Rideshare", department: "Sales", submitted: "2026-09-29", memo: "Acme HQ and back, Sept 24–26.", policy: "Travel & lodging" },
  { type: "missing", requester: "Liam Novak", amount: 86.4, merchant: "Amazon", subject: "Office supplies", category: "General Merchandise", department: "Operations", submitted: "2026-09-29", missing: ["receipt"], policy: "Office" },
  { type: "bill", requester: "Tina Cruz", amount: 37500, merchant: "Salesforce", subject: "Annual subscription renewal", category: "SaaS / Software", department: "Sales", submitted: "2026-09-28", due: "2026-10-08", invoice: "SF-2026-0931", policy: "Software & infrastructure", warning: "9% above last year's contract" },
  { type: "approval", requester: "Noah Kim", amount: 540, merchant: "Figma", subject: "Figma annual renewal", category: "SaaS / Software", department: "Design", submitted: "2026-09-28", due: "2026-10-07", policy: "Software & infrastructure" },
  { type: "missing", requester: "Jordan Lee", amount: 44.55, merchant: "Delta", subject: "Fuel", category: "Fuel and Gas", department: "Sales", submitted: "2026-09-27", missing: ["memo"], policy: "Travel & lodging" },
  { type: "reimbursement", requester: "Grace Whitfield", amount: 312.4, subject: "Candidate dinner", merchant: "Starbucks", category: "Restaurants", department: "People", submitted: "2026-09-27", memo: "Final-round dinner with two engineering candidates.", policy: "Meals", warning: "Over $75 per-person meal limit" },
  { type: "card", requester: "Ethan Park", amount: 600, subject: "OpenAI API card", category: "SaaS / Software", department: "Engineering", submitted: "2026-09-27", cardType: "Virtual", frequency: "Monthly", memo: "Dedicated card for the eval pipeline's API usage.", policy: "Software & infrastructure" },
  { type: "approval", requester: "Marcus Hale", amount: 12000, merchant: "Google Ads", subject: "Q4 paid search budget", category: "Advertising", department: "Marketing", submitted: "2026-09-26", due: "2026-10-01", memo: "Holiday campaign ramp; same CPA targets as Q3.", policy: "Marketing", warning: "Overdue — approval was due Oct 1" },
  { type: "bill", requester: "Liam Novak", amount: 4620, merchant: "Rippling", subject: "Payroll platform", category: "Professional Services", department: "Operations", submitted: "2026-09-25", due: "2026-09-30", invoice: "RP-88213", policy: "Software & infrastructure", warning: "Past due by 2 days" },
  { type: "missing", requester: "Ava Thompson", amount: 156.32, merchant: "Home Depot", subject: "Office repairs", category: "Hardware", department: "Operations", submitted: "2026-09-25", missing: ["receipt"], policy: "Office" },
  { type: "reimbursement", requester: "Ethan Park", amount: 1899, subject: "Monitor and dock", merchant: "Amazon", category: "General Merchandise", department: "Engineering", submitted: "2026-09-25", memo: "Home office setup — approved by Hannah in Slack.", policy: "Equipment" },
  { type: "missing", requester: "Priya Raman", amount: 24.1, merchant: "Lyft", subject: "Ride to airport", category: "Rideshare", department: "Marketing", submitted: "2026-09-25", missing: ["memo"], policy: "Travel & lodging" },
  { type: "approval", requester: "Liam Novak", amount: 431.07, merchant: "Costco", subject: "Kitchen restock", category: "General Merchandise", department: "Operations", submitted: "2026-09-24", policy: "Office" },
  { type: "missing", requester: "Diego Santos", amount: 512.88, merchant: "Hilton", subject: "Hotel — Chicago", category: "Lodging", department: "Sales", submitted: "2026-09-24", missing: ["receipt"], policy: "Travel & lodging" },
  { type: "card", requester: "Ava Thompson", amount: 1500, subject: "Office operations card", category: "General Merchandise", department: "Operations", submitted: "2026-09-24", cardType: "Physical", frequency: "Monthly", memo: "Replacing the shared card that expired in September.", policy: "Office" },
  { type: "bill", requester: "Mia Chen", amount: 2900, merchant: "Carta", subject: "Equity management", category: "Professional Services", department: "Finance", submitted: "2026-09-23", due: "2026-10-14", invoice: "CA-55102", policy: "Software & infrastructure" },
  { type: "reimbursement", requester: "Sofia Alvarez", amount: 64, subject: "Parking — SFO", category: "Parking", department: "Sales", submitted: "2026-09-23", policy: "Travel & lodging" },
  { type: "missing", requester: "Ava Thompson", amount: 64.2, merchant: "FedEx", subject: "Contract shipping", category: "Shipping", department: "Operations", submitted: "2026-09-23", missing: ["receipt", "memo"], policy: "Office" },
  { type: "approval", requester: "Hannah Okafor", amount: 2310.45, merchant: "Datadog", subject: "Datadog usage overage", category: "SaaS / Software", department: "Engineering", submitted: "2026-09-22", policy: "Software & infrastructure" },
];

export const inboxItems: InboxItem[] = raw.map((item, index) => ({
  ...item,
  id: `inb_${(index + 1).toString().padStart(3, "0")}`,
}));
