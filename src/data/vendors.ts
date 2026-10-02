export type MigrationCandidate = {
  id: string;
  merchant: string;
  category: string;
  detectedSpend: number;
  transactionCount: number;
  /** Pre-assigned cardholder, if any. */
  cardholder?: string;
  suggestedCardholder: string;
  suggestedCard?: string;
};

export const migrationCandidates: MigrationCandidate[] = [
  { id: "m1", merchant: "Google Domains", category: "SaaS / Software", detectedSpend: 6238.04, transactionCount: 23, cardholder: "Alexander Bass", suggestedCardholder: "Alexander Bass", suggestedCard: "Google Domains card" },
  { id: "m2", merchant: "Gelt", category: "SaaS / Software", detectedSpend: 5104.0, transactionCount: 16, suggestedCardholder: "Alexander Bass" },
  { id: "m3", merchant: "Google Ads", category: "Advertising", detectedSpend: 3526.57, transactionCount: 16, suggestedCardholder: "Alexander Bass" },
  { id: "m4", merchant: "Whole Latte Love", category: "General Merchandise", detectedSpend: 3408.34, transactionCount: 2, suggestedCardholder: "Alexander Bass" },
  { id: "m5", merchant: "Samsung", category: "Electronics", detectedSpend: 3355.73, transactionCount: 2, suggestedCardholder: "Alexander Bass" },
  { id: "m6", merchant: "Aos Poland", category: "Electronics", detectedSpend: 3326.53, transactionCount: 2, suggestedCardholder: "Alexander Bass" },
  { id: "m7", merchant: "OpenAlternative", category: "SaaS / Software", detectedSpend: 2740.33, transactionCount: 2, suggestedCardholder: "Alexander Bass" },
  { id: "m8", merchant: "Superhuman", category: "SaaS / Software", detectedSpend: 2550.0, transactionCount: 1, suggestedCardholder: "Alexander Bass" },
  { id: "m9", merchant: "Google Store", category: "SaaS / Software", detectedSpend: 2165.3, transactionCount: 2, suggestedCardholder: "Alexander Bass" },
  { id: "m10", merchant: "West Elm", category: "General Merchandise", detectedSpend: 1861.07, transactionCount: 4, suggestedCardholder: "Alexander Bass" },
  { id: "m11", merchant: "ContainIQ", category: "SaaS / Software", detectedSpend: 1800.0, transactionCount: 9, suggestedCardholder: "Alexander Bass" },
  { id: "m12", merchant: "Telcel", category: "Professional Services", detectedSpend: 1790.0, transactionCount: 2, suggestedCardholder: "Alexander Bass" },
  { id: "m13", merchant: "ActiveCampaign", category: "SaaS / Software", detectedSpend: 1500.0, transactionCount: 1, suggestedCardholder: "Alexander Bass" },
  { id: "m14", merchant: "Calendly", category: "SaaS / Software", detectedSpend: 1440.0, transactionCount: 12, suggestedCardholder: "Tina Cruz" },
  { id: "m15", merchant: "Loom", category: "SaaS / Software", detectedSpend: 1250.0, transactionCount: 10, suggestedCardholder: "Noah Kim" },
  { id: "m16", merchant: "Miro", category: "SaaS / Software", detectedSpend: 1104.0, transactionCount: 12, suggestedCardholder: "Noah Kim" },
  { id: "m17", merchant: "1Password", category: "SaaS / Software", detectedSpend: 958.8, transactionCount: 12, suggestedCardholder: "Ethan Park" },
  { id: "m18", merchant: "Intercom", category: "SaaS / Software", detectedSpend: 948.0, transactionCount: 3, suggestedCardholder: "Marcus Hale" },
  { id: "m19", merchant: "WSJ", category: "Subscriptions", detectedSpend: 467.88, transactionCount: 12, suggestedCardholder: "Alexander Bass" },
  { id: "m20", merchant: "Vercel", category: "SaaS / Software", detectedSpend: 400.0, transactionCount: 4, suggestedCardholder: "Ethan Park" },
];

export const migrationSummary = {
  pending: 70,
  estimatedCashback: 810.78,
  totalIdentifiedSpend: 54052.58,
};

export const paymentCards = [
  { value: "google-domains", label: "Google Domains card", description: "···· 4412" },
  { value: "software", label: "Software subscriptions", description: "···· 0042" },
  { value: "marketing", label: "Marketing tools", description: "···· 4021" },
  { value: "new", label: "Create a new virtual card", description: "" },
];

/* -------------------------------------------------------------------------- */
/* Vendor directory                                                           */
/* -------------------------------------------------------------------------- */

/** Fixed "today" for every vendor / bill date calculation (keeps SSR deterministic). */
export const TODAY = "2026-10-02";

/** The 12 trailing months covered by `Vendor.trend` (Oct 2025 → Sep 2026). */
export const spendMonths = [
  "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03",
  "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09",
];

export type PaymentMethod = "Card" | "ACH" | "Check" | "Wire";
export type ContractStatus = "active" | "renewing" | "negotiating" | "expired" | "none";

export type VendorContract = {
  status: ContractStatus;
  plan?: string;
  billing: "Annual" | "Quarterly" | "Monthly" | "Usage-based";
  start?: string;
  end?: string;
  /** Annual contract value. */
  value?: number;
  autoRenew?: boolean;
  seats?: number;
  noticeDays?: number;
};

export type Vendor = {
  id: string;
  name: string;
  legalName: string;
  category: string;
  owner: string;
  department: string;
  website: string;
  contactEmail: string;
  address: string;
  spend12mo: number;
  spendYtd: number;
  /** Monthly spend for `spendMonths`. */
  trend: number[];
  /** Payments in the last 12 months (one per non-zero month in `trend`). */
  transactionCount: number;
  paymentMethods: PaymentMethod[];
  contract: VendorContract;
  nextRenewal?: string;
  glAccount: string;
  paymentTerms: "Due on receipt" | "Net 15" | "Net 30" | "Net 45";
  w9: boolean;
  is1099: boolean;
};

type VendorSeed = Omit<Vendor, "spendYtd" | "trend" | "legalName" | "website" | "contactEmail" | "nextRenewal" | "transactionCount"> & {
  legalName?: string;
  website?: string;
  /** Spend growth across the year (-0.3 = 30% decline, 0.4 = 40% growth). */
  growth?: number;
};

/** Deterministic monthly series that sums to `total`. */
function monthlySeries(total: number, growth: number, seed: number) {
  const raw = spendMonths.map((_, i) => (1 + growth * (i / 11 - 0.5)) * (1 + 0.09 * Math.sin(seed * 1.7 + i * 1.3)));
  const sum = raw.reduce((a, b) => a + b, 0);
  const values = raw.map((r) => Math.round((r / sum) * total * 100) / 100);
  const drift = Math.round((total - values.reduce((a, b) => a + b, 0)) * 100) / 100;
  values[values.length - 1] = Math.round((values[values.length - 1] + drift) * 100) / 100;
  return values;
}

function slug(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const seeds: VendorSeed[] = [
  { id: "", name: "Amazon Web Services", legalName: "Amazon Web Services, Inc.", website: "aws.amazon.com", category: "Cloud infrastructure", owner: "Hannah Okafor", department: "Engineering", address: "410 Terry Ave N, Seattle, WA 98109", spend12mo: 98420.66, growth: 0.45, paymentMethods: ["Card", "ACH"], contract: { status: "active", plan: "Enterprise Discount Program", billing: "Usage-based", start: "2025-03-01", end: "2027-02-28", value: 96000, autoRenew: false, noticeDays: 60 }, glAccount: "6420 Hosting", paymentTerms: "Net 30", w9: true, is1099: false },
  { id: "", name: "WeWork", legalName: "WeWork Companies LLC", website: "wework.com", category: "Rent & facilities", owner: "Liam Novak", department: "Operations", address: "75 Rockefeller Plaza, New York, NY 10019", spend12mo: 50400, growth: 0, paymentMethods: ["ACH"], contract: { status: "active", plan: "Private office · 18 desks", billing: "Monthly", start: "2025-06-01", end: "2027-05-31", value: 50400, autoRenew: true, noticeDays: 90 }, glAccount: "6500 Rent", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Salesforce", legalName: "Salesforce, Inc.", website: "salesforce.com", category: "CRM", owner: "Sofia Alvarez", department: "Sales", address: "415 Mission St, San Francisco, CA 94105", spend12mo: 49500, growth: 0.1, paymentMethods: ["ACH"], contract: { status: "renewing", plan: "Sales Cloud Enterprise", billing: "Quarterly", start: "2025-10-28", end: "2026-10-27", value: 49500, autoRenew: true, seats: 25, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Net 30", w9: true, is1099: false },
  { id: "", name: "Datadog", legalName: "Datadog, Inc.", website: "datadoghq.com", category: "Monitoring", owner: "Hannah Okafor", department: "Engineering", address: "620 8th Ave, New York, NY 10018", spend12mo: 27720.45, growth: 0.3, paymentMethods: ["Card", "ACH"], contract: { status: "renewing", plan: "Pro · 84 hosts", billing: "Monthly", start: "2025-12-01", end: "2026-11-30", value: 27600, autoRenew: true, seats: 84, noticeDays: 30 }, glAccount: "6420 Hosting", paymentTerms: "Net 30", w9: true, is1099: false },
  { id: "", name: "HubSpot", legalName: "HubSpot, Inc.", website: "hubspot.com", category: "Marketing automation", owner: "Marcus Hale", department: "Marketing", address: "2 Canal Park, Cambridge, MA 02141", spend12mo: 21600, growth: 0, paymentMethods: ["Card"], contract: { status: "negotiating", plan: "Marketing Hub Professional", billing: "Monthly", start: "2025-10-12", end: "2026-10-11", value: 21600, autoRenew: true, seats: 6, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Slack", legalName: "Slack Technologies, LLC", website: "slack.com", category: "Communication", owner: "Alexander Bass", department: "Operations", address: "500 Howard St, San Francisco, CA 94105", spend12mo: 12960, growth: 0.15, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Business+", billing: "Annual", start: "2025-11-14", end: "2026-11-13", value: 12960, autoRenew: true, seats: 72, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Intercom", legalName: "Intercom, Inc.", website: "intercom.com", category: "Customer support", owner: "Marcus Hale", department: "Marketing", address: "55 2nd St, San Francisco, CA 94105", spend12mo: 11376, growth: 0.2, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Advanced · 8 seats", billing: "Annual", start: "2025-12-28", end: "2026-12-27", value: 11376, autoRenew: false, seats: 8, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Anthropic", legalName: "Anthropic, PBC", website: "anthropic.com", category: "AI & machine learning", owner: "Ethan Park", department: "Engineering", address: "548 Market St, San Francisco, CA 94104", spend12mo: 10800, growth: 0.9, paymentMethods: ["Card"], contract: { status: "none", billing: "Usage-based" }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "GitHub", legalName: "GitHub, Inc.", website: "github.com", category: "Developer tools", owner: "Ethan Park", department: "Engineering", address: "88 Colin P Kelly Jr St, San Francisco, CA 94107", spend12mo: 11340, growth: 0.12, paymentMethods: ["Card"], contract: { status: "active", plan: "Enterprise", billing: "Annual", start: "2026-01-15", end: "2027-01-14", value: 11340, autoRenew: true, seats: 45, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Rippling", legalName: "People Center, Inc.", website: "rippling.com", category: "HR & payroll", owner: "Grace Whitfield", department: "People", address: "55 Stockton St, San Francisco, CA 94108", spend12mo: 9600, growth: 0.08, paymentMethods: ["ACH"], contract: { status: "active", plan: "Unity + IT", billing: "Monthly", start: "2025-04-01", end: "2027-03-31", value: 9600, autoRenew: true, seats: 68, noticeDays: 60 }, glAccount: "6410 Software", paymentTerms: "Net 15", w9: true, is1099: false },
  { id: "", name: "Google Workspace", legalName: "Google LLC", website: "workspace.google.com", category: "Productivity", owner: "Alexander Bass", department: "Operations", address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043", spend12mo: 8064, growth: 0.1, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Business Standard", billing: "Monthly", start: "2025-11-09", end: "2026-11-08", value: 8064, autoRenew: true, seats: 68, noticeDays: 0 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Atlassian", legalName: "Atlassian US, Inc.", website: "atlassian.com", category: "Developer tools", owner: "Ethan Park", department: "Engineering", address: "350 Bush St, San Francisco, CA 94104", spend12mo: 8400, growth: 0.05, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Jira Software Standard", billing: "Monthly", start: "2025-12-20", end: "2026-12-19", value: 8400, autoRenew: true, seats: 50, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "OpenAI", legalName: "OpenAI, L.L.C.", website: "openai.com", category: "AI & machine learning", owner: "Ethan Park", department: "Engineering", address: "1455 3rd St, San Francisco, CA 94158", spend12mo: 7200, growth: 0.6, paymentMethods: ["Card"], contract: { status: "none", billing: "Usage-based" }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Gusto", legalName: "Gusto, Inc.", website: "gusto.com", category: "HR & payroll", owner: "Grace Whitfield", department: "People", address: "525 20th St, San Francisco, CA 94107", spend12mo: 7140, growth: -0.2, paymentMethods: ["ACH"], contract: { status: "none", billing: "Monthly" }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Figma", legalName: "Figma, Inc.", website: "figma.com", category: "Design", owner: "Noah Kim", department: "Design", address: "760 Market St, San Francisco, CA 94102", spend12mo: 12960, growth: 0.18, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Organization", billing: "Annual", start: "2025-10-19", end: "2026-10-18", value: 12960, autoRenew: true, seats: 24, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Carta", legalName: "eShares, Inc.", website: "carta.com", category: "Legal & equity", owner: "Tina Cruz", department: "Finance", address: "333 Bush St, San Francisco, CA 94104", spend12mo: 6000, growth: 0, paymentMethods: ["ACH"], contract: { status: "active", plan: "Launch", billing: "Annual", start: "2026-04-01", end: "2027-03-31", value: 6000, autoRenew: true, noticeDays: 30 }, glAccount: "6710 Legal & Professional", paymentTerms: "Net 30", w9: true, is1099: false },
  { id: "", name: "Adobe", legalName: "Adobe Inc.", website: "adobe.com", category: "Design", owner: "Noah Kim", department: "Design", address: "345 Park Ave, San Jose, CA 95110", spend12mo: 7918.56, growth: 0.05, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Creative Cloud for teams", billing: "Monthly", start: "2025-11-21", end: "2026-11-20", value: 7918.56, autoRenew: true, seats: 12, noticeDays: 14 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Vercel", legalName: "Vercel Inc.", website: "vercel.com", category: "Developer tools", owner: "Ethan Park", department: "Engineering", address: "440 N Barranca Ave, Covina, CA 91723", spend12mo: 4800, growth: 0.35, paymentMethods: ["Card"], contract: { status: "active", plan: "Pro · 20 seats", billing: "Monthly", start: "2025-02-01", end: "2027-01-31", value: 4800, autoRenew: true, seats: 20, noticeDays: 0 }, glAccount: "6420 Hosting", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "DocuSign", legalName: "DocuSign, Inc.", website: "docusign.com", category: "Legal & equity", owner: "Tina Cruz", department: "Finance", address: "221 Main St, San Francisco, CA 94105", spend12mo: 4800, growth: 0, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Business Pro", billing: "Annual", start: "2025-11-05", end: "2026-11-04", value: 4800, autoRenew: true, seats: 10, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Linear", legalName: "Linear Orbit, Inc.", website: "linear.app", category: "Developer tools", owner: "Ethan Park", department: "Engineering", address: "2261 Market St, San Francisco, CA 94114", spend12mo: 4320, growth: 0.25, paymentMethods: ["Card"], contract: { status: "active", plan: "Business", billing: "Annual", start: "2026-02-01", end: "2027-01-31", value: 4320, autoRenew: true, seats: 45, noticeDays: 0 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Notion", legalName: "Notion Labs, Inc.", website: "notion.so", category: "Productivity", owner: "Alexander Bass", department: "Operations", address: "2300 Harrison St, San Francisco, CA 94110", spend12mo: 7680, growth: 0.1, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Business", billing: "Annual", start: "2025-12-03", end: "2026-12-02", value: 7680, autoRenew: true, seats: 64, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Zoom", legalName: "Zoom Communications, Inc.", website: "zoom.com", category: "Communication", owner: "Liam Novak", department: "Operations", address: "55 Almaden Blvd, San Jose, CA 95113", spend12mo: 8000, growth: -0.1, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Business · 40 licenses", billing: "Monthly", start: "2025-10-25", end: "2026-10-24", value: 8000, autoRenew: true, seats: 40, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Dropbox", legalName: "Dropbox, Inc.", website: "dropbox.com", category: "Storage", owner: "Ava Thompson", department: "Operations", address: "1800 Owens St, San Francisco, CA 94158", spend12mo: 2160, growth: -0.15, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Business · 15 users", billing: "Annual", start: "2025-12-15", end: "2026-12-14", value: 2160, autoRenew: false, seats: 15, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Loom", legalName: "Loom, Inc.", website: "loom.com", category: "Communication", owner: "Noah Kim", department: "Design", address: "140 2nd St, San Francisco, CA 94105", spend12mo: 4500, growth: 0, paymentMethods: ["Card"], contract: { status: "active", plan: "Business", billing: "Annual", start: "2026-03-10", end: "2027-03-09", value: 4500, autoRenew: true, seats: 30, noticeDays: 30 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Miro", legalName: "RealtimeBoard, Inc.", website: "miro.com", category: "Productivity", owner: "Noah Kim", department: "Design", address: "201 Spear St, San Francisco, CA 94105", spend12mo: 3840, growth: 0.05, paymentMethods: ["Card"], contract: { status: "active", plan: "Business", billing: "Monthly", start: "2025-08-01", end: "2027-07-31", value: 3840, autoRenew: true, seats: 20, noticeDays: 0 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "1Password", legalName: "AgileBits Inc.", website: "1password.com", category: "Security", owner: "Ethan Park", department: "Engineering", address: "4711 Yonge St, Toronto, ON M2N 6K8", spend12mo: 6528, growth: 0.06, paymentMethods: ["Card"], contract: { status: "renewing", plan: "Business", billing: "Monthly", start: "2025-10-30", end: "2026-10-29", value: 6528, autoRenew: true, seats: 68, noticeDays: 0 }, glAccount: "6410 Software", paymentTerms: "Due on receipt", w9: true, is1099: false },
  { id: "", name: "Cooley LLP", legalName: "Cooley LLP", website: "cooley.com", category: "Legal services", owner: "Tina Cruz", department: "Finance", address: "3 Embarcadero Center, San Francisco, CA 94111", spend12mo: 38250, growth: -0.1, paymentMethods: ["ACH", "Wire"], contract: { status: "active", plan: "Engagement letter", billing: "Usage-based", start: "2024-01-15", end: "2026-12-31", autoRenew: false, noticeDays: 30, value: 40000 }, glAccount: "6710 Legal & Professional", paymentTerms: "Net 30", w9: true, is1099: true },
  { id: "", name: "Kruze Consulting", legalName: "Kruze Consulting, Inc.", website: "kruzeconsulting.com", category: "Accounting services", owner: "Tina Cruz", department: "Finance", address: "1 Sansome St, San Francisco, CA 94104", spend12mo: 19800, growth: 0, paymentMethods: ["ACH"], contract: { status: "active", plan: "Monthly close + tax", billing: "Monthly", start: "2025-01-01", end: "2026-12-31", value: 19800, autoRenew: true, noticeDays: 30 }, glAccount: "6710 Legal & Professional", paymentTerms: "Net 15", w9: true, is1099: true },
  { id: "", name: "Summit Staffing Partners", legalName: "Summit Staffing Partners LLC", website: "summitstaffing.co", category: "Contract labor", owner: "Liam Novak", department: "Operations", address: "1100 S Congress Ave, Austin, TX 78704", spend12mo: 24360, growth: 0.4, paymentMethods: ["ACH", "Check"], contract: { status: "expired", plan: "Master services agreement", billing: "Usage-based", start: "2025-01-01", end: "2026-06-30", autoRenew: false, noticeDays: 30 }, glAccount: "6720 Contractors", paymentTerms: "Net 30", w9: false, is1099: true },
  { id: "", name: "Pacific Office Interiors", legalName: "Pacific Office Interiors, Inc.", website: "pacificofficeinteriors.com", category: "Furniture & equipment", owner: "Liam Novak", department: "Operations", address: "2201 E 6th St, Austin, TX 78702", spend12mo: 22670, growth: 0.5, paymentMethods: ["Check"], contract: { status: "none", billing: "Usage-based" }, glAccount: "6200 Office Supplies", paymentTerms: "Net 30", w9: true, is1099: true },
  { id: "", name: "Greenhouse Software", legalName: "Greenhouse Software, Inc.", website: "greenhouse.io", category: "Recruiting", owner: "Grace Whitfield", department: "People", address: "228 Park Ave S, New York, NY 10003", spend12mo: 9800, growth: 0, paymentMethods: ["ACH"], contract: { status: "renewing", plan: "Recruiting Core", billing: "Annual", start: "2025-10-26", end: "2026-10-25", value: 9800, autoRenew: true, seats: 12, noticeDays: 60 }, glAccount: "6410 Software", paymentTerms: "Net 30", w9: true, is1099: false },
  { id: "", name: "Brightline Cleaning Co.", legalName: "Brightline Cleaning Company LLC", website: "brightlineclean.com", category: "Facilities services", owner: "Ava Thompson", department: "Operations", address: "4801 Burnet Rd, Austin, TX 78756", spend12mo: 21480, growth: 0.05, paymentMethods: ["ACH"], contract: { status: "active", plan: "Janitorial services agreement", billing: "Monthly", start: "2025-07-01", end: "2027-06-30", value: 19800, autoRenew: true, noticeDays: 30 }, glAccount: "6500 Rent", paymentTerms: "Net 15", w9: true, is1099: true },
  { id: "", name: "Austin Energy", legalName: "City of Austin, Austin Energy", website: "austinenergy.com", category: "Utilities", owner: "Ava Thompson", department: "Operations", address: "4815 Mueller Blvd, Austin, TX 78723", spend12mo: 15240.6, growth: 0.1, paymentMethods: ["ACH"], contract: { status: "none", billing: "Monthly" }, glAccount: "6600 Utilities", paymentTerms: "Net 15", w9: true, is1099: false },
  { id: "", name: "Verizon", legalName: "Cellco Partnership d/b/a Verizon Wireless", website: "verizon.com", category: "Telecommunications", owner: "Liam Novak", department: "Operations", address: "1095 Avenue of the Americas, New York, NY 10036", spend12mo: 10548, growth: 0.04, paymentMethods: ["ACH"], contract: { status: "active", plan: "Business Unlimited", billing: "Monthly", start: "2025-03-01", end: "2027-02-28", value: 10548, autoRenew: true, noticeDays: 30 }, glAccount: "6600 Utilities", paymentTerms: "Net 15", w9: true, is1099: false },
  { id: "", name: "Comcast", legalName: "Comcast Business Communications, LLC", website: "business.comcast.com", category: "Telecommunications", owner: "Liam Novak", department: "Operations", address: "1701 JFK Blvd, Philadelphia, PA 19103", spend12mo: 4558.8, growth: 0, paymentMethods: ["ACH"], contract: { status: "active", plan: "Business Internet 1.25 Gig", billing: "Monthly", start: "2025-09-21", end: "2027-09-20", value: 4558.8, autoRenew: true, noticeDays: 30 }, glAccount: "6600 Utilities", paymentTerms: "Net 30", w9: true, is1099: false },
  { id: "", name: "Blue Bottle Coffee", legalName: "Blue Bottle Coffee, LLC", website: "bluebottlecoffee.com", category: "Office pantry", owner: "Ava Thompson", department: "Operations", address: "476 9th St, Oakland, CA 94607", spend12mo: 9216, growth: 0.15, paymentMethods: ["ACH", "Card"], contract: { status: "none", billing: "Monthly" }, glAccount: "6110 Meals & Entertainment", paymentTerms: "Net 15", w9: true, is1099: false },
  { id: "", name: "FedEx", legalName: "FedEx Corporation", website: "fedex.com", category: "Shipping", owner: "Ava Thompson", department: "Operations", address: "942 S Shady Grove Rd, Memphis, TN 38120", spend12mo: 2814.6, growth: 0.2, paymentMethods: ["Card"], contract: { status: "none", billing: "Usage-based" }, glAccount: "6230 Postage & Shipping", paymentTerms: "Due on receipt", w9: true, is1099: false },
];

/** Next renewal is the contract end date + 1 day for contracts that renew. */
function renewalDate(contract: VendorContract) {
  if (!contract.end || contract.status === "none" || contract.status === "expired") return undefined;
  const date = new Date(`${contract.end}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export const vendors: Vendor[] = seeds
  .map(({ growth = 0, ...seed }, index) => {
    // Annual / quarterly contracts are paid in lump sums from the contract's start month.
    const every = { Annual: 12, Quarterly: 3, Monthly: 0, "Usage-based": 0 }[seed.contract.billing];
    const startMonth = Number(seed.contract.start?.slice(5, 7) ?? 0);
    const lumpSum = every > 0 && startMonth > 0;
    const trend = lumpSum
      ? spendMonths.map((month) =>
          (Number(month.slice(5)) - startMonth + 12) % every === 0 ? Math.round((seed.spend12mo * every) / 12 * 100) / 100 : 0,
        )
      : monthlySeries(seed.spend12mo, growth, index + 1);
    const website = seed.website ?? `${slug(seed.name)}.com`;
    return {
      ...seed,
      id: slug(seed.name),
      legalName: seed.legalName ?? seed.name,
      website,
      contactEmail: `billing@${website.split(".").slice(-2).join(".")}`,
      trend,
      transactionCount: trend.filter(Boolean).length,
      spendYtd: Math.round(trend.slice(3).reduce((a, b) => a + b, 0) * 100) / 100,
      nextRenewal: renewalDate(seed.contract),
    };
  })
  .sort((a, b) => b.spend12mo - a.spend12mo);

export function getVendor(id: string) {
  return vendors.find((vendor) => vendor.id === id);
}

export function findVendorByName(name: string) {
  return vendors.find((vendor) => vendor.name.toLowerCase() === name.toLowerCase());
}

/** Whole days from TODAY to `iso` (negative when in the past). */
export function daysFromToday(iso: string) {
  const ms = new Date(`${iso}T12:00:00`).getTime() - new Date(`${TODAY}T12:00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

export const vendorCategories = [...new Set(vendors.map((vendor) => vendor.category))].sort();

/** Company-wide vendor spend per month, split by rail (charts on the overview). */
export const vendorMonthlySpend = spendMonths.map((month, i) => {
  let card = 0;
  let bills = 0;
  for (const vendor of vendors) {
    if (vendor.paymentMethods[0] === "Card") card += vendor.trend[i];
    else bills += vendor.trend[i];
  }
  return { month, card: Math.round(card), bills: Math.round(bills) };
});

export type VendorTransaction = {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  user: string;
  memo: string;
  reference: string;
};

/** One charge per month (most recent first), derived from the vendor's trend. */
export function vendorTransactions(vendor: Vendor): VendorTransaction[] {
  const day = 3 + (vendor.name.length * 7) % 24;
  const source = vendor.trend.map((amount, i) => ({ amount, month: spendMonths[i], i })).filter((row) => row.amount > 0);
  return source
    .map(({ amount, month, i }) => {
      const method = vendor.paymentMethods[i % vendor.paymentMethods.length];
      return {
        id: `${vendor.id}-${month}`,
        date: `${month}-${String(day).padStart(2, "0")}`,
        amount,
        method,
        user: vendor.owner,
        memo: `${vendor.contract.plan ?? vendor.category} · ${new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(`${month}-15T12:00:00`))}${vendor.contract.billing === "Annual" ? " · annual" : ""}`,
        reference: method === "Card" ? "Ramp card ···· 0042" : `${method} ···· 4410`,
      };
    })
    .reverse();
}

/* -------------------------------------------------------------------------- */
/* Price Intelligence                                                         */
/* -------------------------------------------------------------------------- */

export type PriceBenchmark = {
  vendor: string;
  product: string;
  /** "seat / yr", "host / yr", "platform / yr". */
  unit: string;
  /** Null when you don't buy this product yet (catalog search results). */
  yourPrice: number | null;
  quantity: number;
  p25: number;
  median: number;
  p75: number;
  /** Companies in the benchmark sample. */
  sample: number;
  category: string;
};

export const priceBenchmarks: PriceBenchmark[] = [
  { vendor: "Salesforce", product: "Sales Cloud Enterprise", unit: "seat / yr", yourPrice: 1980, quantity: 25, p25: 1440, median: 1620, p75: 1860, sample: 1284, category: "CRM" },
  { vendor: "HubSpot", product: "Marketing Hub Professional", unit: "platform / yr", yourPrice: 21600, quantity: 1, p25: 14400, median: 17280, p75: 20400, sample: 932, category: "Marketing automation" },
  { vendor: "Datadog", product: "Infrastructure Pro", unit: "host / yr", yourPrice: 328.57, quantity: 84, p25: 228, median: 262, p75: 300, sample: 716, category: "Monitoring" },
  { vendor: "Slack", product: "Business+", unit: "seat / yr", yourPrice: 180, quantity: 72, p25: 138, median: 150, p75: 171, sample: 4210, category: "Communication" },
  { vendor: "Figma", product: "Organization", unit: "seat / yr", yourPrice: 540, quantity: 24, p25: 432, median: 486, p75: 528, sample: 2048, category: "Design" },
  { vendor: "Zoom", product: "Business", unit: "license / yr", yourPrice: 200, quantity: 40, p25: 144, median: 165, p75: 192, sample: 3120, category: "Communication" },
  { vendor: "Adobe", product: "Creative Cloud for teams", unit: "seat / yr", yourPrice: 659.88, quantity: 12, p25: 540, median: 599.88, p75: 659.88, sample: 1876, category: "Design" },
  { vendor: "DocuSign", product: "Business Pro", unit: "seat / yr", yourPrice: 480, quantity: 10, p25: 360, median: 420, p75: 480, sample: 1430, category: "Legal & equity" },
  { vendor: "Notion", product: "Business", unit: "seat / yr", yourPrice: 120, quantity: 64, p25: 96, median: 108, p75: 120, sample: 2765, category: "Productivity" },
  { vendor: "GitHub", product: "Enterprise", unit: "seat / yr", yourPrice: 252, quantity: 45, p25: 210, median: 231, p75: 252, sample: 1962, category: "Developer tools" },
  { vendor: "Atlassian", product: "Jira Software Standard", unit: "seat / yr", yourPrice: 168, quantity: 50, p25: 150, median: 168, p75: 186, sample: 2290, category: "Developer tools" },
  { vendor: "Google Workspace", product: "Business Standard", unit: "seat / yr", yourPrice: 118.59, quantity: 68, p25: 115.2, median: 144, p75: 144, sample: 6100, category: "Productivity" },
  { vendor: "1Password", product: "Business", unit: "seat / yr", yourPrice: 96, quantity: 68, p25: 86.4, median: 96, p75: 96, sample: 1650, category: "Security" },
  { vendor: "Intercom", product: "Advanced", unit: "seat / yr", yourPrice: 1422, quantity: 8, p25: 1020, median: 1188, p75: 1380, sample: 640, category: "Customer support" },
  { vendor: "Loom", product: "Business", unit: "seat / yr", yourPrice: 150, quantity: 30, p25: 144, median: 150, p75: 180, sample: 1190, category: "Communication" },
  { vendor: "Linear", product: "Business", unit: "seat / yr", yourPrice: 96, quantity: 45, p25: 84, median: 96, p75: 96, sample: 860, category: "Developer tools" },
  // Catalog-only results (not in your stack) surface when searching.
  { vendor: "Gong", product: "Revenue Intelligence", unit: "seat / yr", yourPrice: null, quantity: 0, p25: 1200, median: 1440, p75: 1680, sample: 540, category: "Sales intelligence" },
  { vendor: "Okta", product: "Workforce Identity", unit: "user / yr", yourPrice: null, quantity: 0, p25: 48, median: 72, p75: 96, sample: 1210, category: "Security" },
  { vendor: "Airtable", product: "Business", unit: "seat / yr", yourPrice: null, quantity: 0, p25: 396, median: 432, p75: 540, sample: 980, category: "Productivity" },
  { vendor: "Asana", product: "Business", unit: "seat / yr", yourPrice: null, quantity: 0, p25: 216, median: 270, p75: 300, sample: 1870, category: "Productivity" },
  { vendor: "Retool", product: "Business", unit: "builder / yr", yourPrice: null, quantity: 0, p25: 480, median: 600, p75: 780, sample: 410, category: "Developer tools" },
  { vendor: "Calendly", product: "Teams", unit: "seat / yr", yourPrice: null, quantity: 0, p25: 120, median: 144, p75: 192, sample: 2230, category: "Productivity" },
];

/** Annual savings if you paid the median price. */
export function benchmarkSavings(benchmark: PriceBenchmark) {
  if (benchmark.yourPrice === null) return 0;
  return Math.max(0, Math.round((benchmark.yourPrice - benchmark.median) * benchmark.quantity));
}

/** Where your unit price falls in the market distribution (0–100). */
export function benchmarkPercentile(benchmark: PriceBenchmark) {
  const { yourPrice: price, p25, median, p75 } = benchmark;
  if (price === null) return null;
  const lerp = (lo: number, hi: number, a: number, b: number) => a + ((price - lo) / (hi - lo || 1)) * (b - a);
  let pct: number;
  if (price <= p25) pct = lerp(p25 * 0.7, p25, 5, 25);
  else if (price <= median) pct = lerp(p25, median, 25, 50);
  else if (price <= p75) pct = lerp(median, p75, 50, 75);
  else pct = lerp(p75, p75 * 1.3, 75, 95);
  return Math.round(Math.max(1, Math.min(99, pct)));
}

/* -------------------------------------------------------------------------- */
/* Seat Intelligence                                                          */
/* -------------------------------------------------------------------------- */

export type InactiveSeat = { name: string; email: string; lastActive: string };

export type SeatApp = {
  vendor: string;
  plan: string;
  purchased: number;
  active: number;
  costPerSeat: number;
  source: "Okta" | "Google Workspace" | "Rippling";
  inactive: InactiveSeat[];
};

const seatPool = [
  "Chris Morgan", "Lena Fischer", "Owen Price", "Ruby Castillo", "Theo Grant", "Isla Murphy", "Mateo Rossi",
  "Zara Ahmed", "Felix Wagner", "Nina Petrova", "Caleb Brooks", "Maya Patel", "Ivan Sokolov", "Elena Ruiz",
  "Jonah Webb", "Priya Raman", "Diego Santos", "Grace Whitfield", "Mia Chen", "Jordan Lee", "Ava Thompson",
];

function inactiveSeats(count: number, offset: number): InactiveSeat[] {
  return Array.from({ length: count }, (_, i) => {
    const name = seatPool[(offset + i * 4) % seatPool.length];
    const daysAgo = 34 + ((offset * 11 + i * 17) % 140);
    const date = new Date(`${TODAY}T12:00:00`);
    date.setDate(date.getDate() - daysAgo);
    return {
      name,
      email: `${name.split(" ")[0].toLowerCase()}@efficient.app`,
      lastActive: date.toISOString().slice(0, 10),
    };
  });
}

const seatSeeds: Omit<SeatApp, "inactive">[] = [
  { vendor: "Slack", plan: "Business+", purchased: 72, active: 61, costPerSeat: 180, source: "Okta" },
  { vendor: "Zoom", plan: "Business", purchased: 40, active: 23, costPerSeat: 200, source: "Okta" },
  { vendor: "Salesforce", plan: "Sales Cloud Enterprise", purchased: 25, active: 19, costPerSeat: 1980, source: "Okta" },
  { vendor: "Figma", plan: "Organization", purchased: 24, active: 16, costPerSeat: 540, source: "Google Workspace" },
  { vendor: "Atlassian", plan: "Jira Software Standard", purchased: 50, active: 39, costPerSeat: 168, source: "Okta" },
  { vendor: "Loom", plan: "Business", purchased: 30, active: 14, costPerSeat: 150, source: "Google Workspace" },
  { vendor: "Adobe", plan: "Creative Cloud for teams", purchased: 12, active: 7, costPerSeat: 659.88, source: "Okta" },
  { vendor: "Notion", plan: "Business", purchased: 64, active: 58, costPerSeat: 120, source: "Google Workspace" },
  { vendor: "Miro", plan: "Business", purchased: 20, active: 9, costPerSeat: 192, source: "Google Workspace" },
  { vendor: "DocuSign", plan: "Business Pro", purchased: 10, active: 6, costPerSeat: 480, source: "Okta" },
  { vendor: "GitHub", plan: "Enterprise", purchased: 45, active: 42, costPerSeat: 252, source: "Okta" },
  { vendor: "1Password", plan: "Business", purchased: 68, active: 66, costPerSeat: 96, source: "Rippling" },
  { vendor: "Google Workspace", plan: "Business Standard", purchased: 68, active: 67, costPerSeat: 118.59, source: "Rippling" },
];

export const seatApps: SeatApp[] = seatSeeds.map((app, index) => ({
  ...app,
  inactive: inactiveSeats(app.purchased - app.active, index * 5),
}));
