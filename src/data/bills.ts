import { TODAY, daysFromToday } from "./vendors";

export type BillStage = "draft" | "approval" | "payment" | "paid";
export type BillMethod = "ACH" | "Check" | "Wire" | "Card";

export type BillApprover = { name: string; state: "approved" | "pending" | "queued" };
export type BillLine = { description: string; quantity: number; rate: number };

export type Bill = {
  id: string;
  vendor: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  stage: BillStage;
  method: BillMethod;
  approvers: BillApprover[];
  submittedBy: string;
  glAccount?: string;
  department: string;
  memo?: string;
  lines: BillLine[];
  /** Payment initiation date for scheduled payments. */
  scheduledFor?: string;
  paidOn?: string;
  /** Draft fields still to fill in before submitting. */
  missing?: string[];
};

type BillSeed = Omit<Bill, "id" | "amount">;

const A = (name: string): BillApprover => ({ name, state: "approved" });
const P = (name: string): BillApprover => ({ name, state: "pending" });
const Q = (name: string): BillApprover => ({ name, state: "queued" });

const seeds: BillSeed[] = [
  // For payment
  { vendor: "Cooley LLP", invoiceNumber: "INV-20931", issueDate: "2026-08-27", dueDate: "2026-09-26", stage: "payment", method: "ACH", approvers: [A("Tina Cruz"), A("Alexander Bass")], submittedBy: "Tina Cruz", glAccount: "6710 Legal & Professional", department: "Finance", memo: "August legal services - Series B diligence", lines: [{ description: "Series B financing - diligence & document review", quantity: 14.5, rate: 925 }, { description: "Board consent and stockholder notices", quantity: 3.2, rate: 925 }, { description: "Filing fees (Delaware)", quantity: 1, rate: 389 }] },
  { vendor: "Summit Staffing Partners", invoiceNumber: "SSP-4471", issueDate: "2026-09-15", dueDate: "2026-09-30", stage: "payment", method: "Check", approvers: [A("Liam Novak")], submittedBy: "Liam Novak", glAccount: "6720 Contractors", department: "Operations", lines: [{ description: "Warehouse associates - week of Sep 7", quantity: 120, rate: 28.5 }, { description: "Warehouse associates - week of Sep 14", quantity: 112, rate: 28.5 }] },
  { vendor: "Verizon", invoiceNumber: "0928-55120", issueDate: "2026-09-20", dueDate: "2026-10-04", stage: "payment", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6600 Utilities", department: "Operations", lines: [{ description: "Business Unlimited - 14 lines", quantity: 14, rate: 45 }, { description: "Fios Business Internet 1 Gig", quantity: 1, rate: 249 }] },
  { vendor: "WeWork", invoiceNumber: "WW-1026-118", issueDate: "2026-09-25", dueDate: "2026-10-05", stage: "payment", method: "ACH", approvers: [A("Liam Novak"), A("Tina Cruz")], submittedBy: "Liam Novak", glAccount: "6500 Rent", department: "Operations", scheduledFor: "2026-10-05", lines: [{ description: "Private office - 18 desks · October", quantity: 1, rate: 4200 }, { description: "Conference room credits overage", quantity: 6, rate: 35 }] },
  { vendor: "Kruze Consulting", invoiceNumber: "KC-2026-09", issueDate: "2026-09-30", dueDate: "2026-10-06", stage: "payment", method: "ACH", approvers: [A("Tina Cruz")], submittedBy: "Mia Chen", glAccount: "6710 Legal & Professional", department: "Finance", lines: [{ description: "Monthly bookkeeping & close - September", quantity: 1, rate: 1250 }, { description: "R&D tax credit study (installment 2 of 3)", quantity: 1, rate: 400 }] },
  { vendor: "Austin Energy", invoiceNumber: "300-118-2290", issueDate: "2026-09-22", dueDate: "2026-10-07", stage: "payment", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6600 Utilities", department: "Operations", scheduledFor: "2026-10-06", lines: [{ description: "Electric service - 600 Congress Ave, Ste 1400", quantity: 1, rate: 1184.37 }, { description: "Green Choice renewable energy", quantity: 1, rate: 96.4 }] },
  { vendor: "Amazon Web Services", invoiceNumber: "2026-09-AWS-118734", issueDate: "2026-10-01", dueDate: "2026-10-08", stage: "payment", method: "ACH", approvers: [A("Hannah Okafor"), A("Tina Cruz")], submittedBy: "Hannah Okafor", glAccount: "6420 Hosting", department: "Engineering", lines: [{ description: "Amazon EC2 - us-east-1", quantity: 1, rate: 6120.44 }, { description: "Amazon RDS for PostgreSQL", quantity: 1, rate: 1840.18 }, { description: "Amazon S3 & data transfer", quantity: 1, rate: 912.6 }, { description: "EDP discount (9%)", quantity: 1, rate: -798.5 }] },
  { vendor: "Datadog", invoiceNumber: "INV-DD-88213", issueDate: "2026-09-30", dueDate: "2026-10-09", stage: "payment", method: "ACH", approvers: [A("Hannah Okafor")], submittedBy: "Ethan Park", glAccount: "6420 Hosting", department: "Engineering", lines: [{ description: "Infrastructure Pro - 84 hosts", quantity: 84, rate: 23 }, { description: "Log ingestion overage (GB)", quantity: 410, rate: 0.1 }] },
  { vendor: "Brightline Cleaning Co.", invoiceNumber: "BCC-0912", issueDate: "2026-09-28", dueDate: "2026-10-12", stage: "payment", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6500 Rent", department: "Operations", scheduledFor: "2026-10-10", lines: [{ description: "Nightly janitorial service - September", quantity: 1, rate: 1650 }, { description: "Window washing (quarterly)", quantity: 1, rate: 340 }] },
  { vendor: "Pacific Office Interiors", invoiceNumber: "POI-7781", issueDate: "2026-09-16", dueDate: "2026-10-16", stage: "payment", method: "Check", approvers: [A("Liam Novak"), A("Alexander Bass")], submittedBy: "Liam Novak", glAccount: "6200 Office Supplies", department: "Operations", lines: [{ description: "Herman Miller Aeron chair", quantity: 6, rate: 1395 }, { description: "Sit-stand desk, 60\" walnut", quantity: 6, rate: 849 }, { description: "Delivery & installation", quantity: 1, rate: 450 }] },
  { vendor: "Comcast", invoiceNumber: "8771-4021-0918", issueDate: "2026-09-21", dueDate: "2026-10-20", stage: "payment", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6600 Utilities", department: "Operations", lines: [{ description: "Business Internet 1.25 Gig - Seattle office", quantity: 1, rate: 349.95 }, { description: "Static IP block", quantity: 1, rate: 29.95 }] },
  { vendor: "Salesforce", invoiceNumber: "INV-SF-1028-2026", issueDate: "2026-09-28", dueDate: "2026-10-27", stage: "payment", method: "ACH", approvers: [A("Sofia Alvarez"), A("Tina Cruz"), A("Alexander Bass")], submittedBy: "Sofia Alvarez", glAccount: "6410 Software", department: "Sales", memo: "Quarterly installment - Sales Cloud Enterprise", lines: [{ description: "Sales Cloud Enterprise - 25 seats · Q4 2026", quantity: 25, rate: 495 }] },

  // For approval
  { vendor: "Rippling", invoiceNumber: "RIP-552190", issueDate: "2026-09-30", dueDate: "2026-10-15", stage: "approval", method: "ACH", approvers: [A("Grace Whitfield"), P("Tina Cruz")], submittedBy: "Grace Whitfield", glAccount: "6410 Software", department: "People", lines: [{ description: "Rippling Unity - 68 employees", quantity: 68, rate: 8 }, { description: "Rippling IT add-on", quantity: 68, rate: 3.75 }] },
  { vendor: "Cooley LLP", invoiceNumber: "INV-21204", issueDate: "2026-09-29", dueDate: "2026-10-29", stage: "approval", method: "Wire", approvers: [P("Tina Cruz"), Q("Alexander Bass")], submittedBy: "Tina Cruz", glAccount: "6710 Legal & Professional", department: "Finance", memo: "September legal services", lines: [{ description: "Commercial contracts - enterprise MSA redlines", quantity: 9.4, rate: 925 }, { description: "Employment matters", quantity: 2.1, rate: 780 }] },
  { vendor: "Greenhouse Software", invoiceNumber: "GH-2026-3381", issueDate: "2026-09-26", dueDate: "2026-10-26", stage: "approval", method: "ACH", approvers: [P("Liam Novak"), Q("Tina Cruz")], submittedBy: "Grace Whitfield", glAccount: "6410 Software", department: "People", lines: [{ description: "Greenhouse Recruiting Core - annual", quantity: 1, rate: 9800 }] },
  { vendor: "Blue Bottle Coffee", invoiceNumber: "BB-WHL-20922", issueDate: "2026-09-24", dueDate: "2026-10-09", stage: "approval", method: "ACH", approvers: [P("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6110 Meals & Entertainment", department: "Operations", lines: [{ description: "Hayes Valley espresso, 5 lb", quantity: 8, rate: 72 }, { description: "Bright blend, 5 lb", quantity: 6, rate: 68 }, { description: "Oat milk, case of 12", quantity: 4, rate: 42 }] },
  { vendor: "Carta", invoiceNumber: "CARTA-77120", issueDate: "2026-09-20", dueDate: "2026-10-20", stage: "approval", method: "ACH", approvers: [A("Tina Cruz"), P("Alexander Bass")], submittedBy: "Tina Cruz", glAccount: "6710 Legal & Professional", department: "Finance", lines: [{ description: "409A valuation", quantity: 1, rate: 3500 }, { description: "ASC 718 expense reporting", quantity: 1, rate: 1200 }] },
  { vendor: "Summit Staffing Partners", invoiceNumber: "SSP-4502", issueDate: "2026-09-29", dueDate: "2026-10-14", stage: "approval", method: "Check", approvers: [P("Liam Novak"), Q("Tina Cruz")], submittedBy: "Liam Novak", glAccount: "6720 Contractors", department: "Operations", lines: [{ description: "Warehouse associates - week of Sep 21", quantity: 126, rate: 28.5 }] },
  { vendor: "Pacific Office Interiors", invoiceNumber: "POI-7804", issueDate: "2026-09-30", dueDate: "2026-10-30", stage: "approval", method: "Check", approvers: [P("Alexander Bass")], submittedBy: "Liam Novak", glAccount: "6200 Office Supplies", department: "Operations", lines: [{ description: "Acoustic phone booth (1-person)", quantity: 2, rate: 4290 }, { description: "Delivery & installation", quantity: 1, rate: 380 }] },
  { vendor: "Brightline Cleaning Co.", invoiceNumber: "BCC-0926", issueDate: "2026-09-30", dueDate: "2026-10-14", stage: "approval", method: "ACH", approvers: [P("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6500 Rent", department: "Operations", lines: [{ description: "Post-event deep clean (Sep 25 offsite)", quantity: 1, rate: 680 }] },

  // Drafts
  { vendor: "Hudson Signage", invoiceNumber: "HS-1187", issueDate: "2026-09-30", dueDate: "2026-10-30", stage: "draft", method: "ACH", approvers: [], submittedBy: "Alexander Bass", department: "Marketing", missing: ["GL account", "Approver"], lines: [{ description: "Illuminated lobby sign, brushed aluminum", quantity: 1, rate: 3840 }, { description: "Installation", quantity: 1, rate: 620 }] },
  { vendor: "Austin Event Rentals", invoiceNumber: "AER-55021", issueDate: "2026-09-28", dueDate: "2026-10-12", stage: "draft", method: "Check", approvers: [], submittedBy: "Marcus Hale", glAccount: "6110 Meals & Entertainment", department: "Marketing", missing: ["Approver"], lines: [{ description: "Customer Summit - tent 40×60", quantity: 1, rate: 2950 }, { description: "Cocktail tables", quantity: 24, rate: 18 }, { description: "Delivery, setup & teardown", quantity: 1, rate: 540 }] },
  { vendor: "Datadog", invoiceNumber: "INV-DD-88290", issueDate: "2026-10-01", dueDate: "2026-10-31", stage: "draft", method: "ACH", approvers: [], submittedBy: "Ethan Park", glAccount: "6420 Hosting", department: "Engineering", missing: ["Approver"], lines: [{ description: "Synthetics API test runs (10k)", quantity: 42, rate: 5 }] },
  { vendor: "FedEx", invoiceNumber: "7-882-31144", issueDate: "2026-09-27", dueDate: "2026-10-12", stage: "draft", method: "ACH", approvers: [], submittedBy: "Ava Thompson", department: "Operations", missing: ["GL account"], lines: [{ description: "FedEx Ground - 38 shipments", quantity: 38, rate: 14.22 }, { description: "Fuel surcharge", quantity: 1, rate: 61.4 }] },
  { vendor: "Northwind Print Co.", invoiceNumber: "NW-3302", issueDate: "2026-09-25", dueDate: "2026-10-25", stage: "draft", method: "Check", approvers: [], submittedBy: "Priya Raman", department: "Marketing", missing: ["GL account", "Due date confirmation"], lines: [{ description: "Customer Summit programs, 24pp saddle-stitch", quantity: 500, rate: 3.8 }, { description: "Event badges with lanyards", quantity: 400, rate: 2.1 }] },
  { vendor: "Kruze Consulting", invoiceNumber: "KC-2026-09B", issueDate: "2026-10-01", dueDate: "2026-10-16", stage: "draft", method: "ACH", approvers: [], submittedBy: "Mia Chen", glAccount: "6710 Legal & Professional", department: "Finance", missing: ["Approver"], lines: [{ description: "Delaware franchise tax filing", quantity: 1, rate: 450 }] },

  // Paid
  { vendor: "WeWork", invoiceNumber: "WW-0926-112", issueDate: "2026-08-25", dueDate: "2026-09-05", stage: "paid", method: "ACH", approvers: [A("Liam Novak"), A("Tina Cruz")], submittedBy: "Liam Novak", glAccount: "6500 Rent", department: "Operations", paidOn: "2026-09-03", lines: [{ description: "Private office - 18 desks · September", quantity: 1, rate: 4200 }] },
  { vendor: "Kruze Consulting", invoiceNumber: "KC-2026-08", issueDate: "2026-08-31", dueDate: "2026-09-15", stage: "paid", method: "ACH", approvers: [A("Tina Cruz")], submittedBy: "Mia Chen", glAccount: "6710 Legal & Professional", department: "Finance", paidOn: "2026-09-12", lines: [{ description: "Monthly bookkeeping & close - August", quantity: 1, rate: 1250 }, { description: "R&D tax credit study (installment 1 of 3)", quantity: 1, rate: 400 }] },
  { vendor: "Amazon Web Services", invoiceNumber: "2026-08-AWS-117902", issueDate: "2026-09-01", dueDate: "2026-09-08", stage: "paid", method: "ACH", approvers: [A("Hannah Okafor"), A("Tina Cruz")], submittedBy: "Hannah Okafor", glAccount: "6420 Hosting", department: "Engineering", paidOn: "2026-09-07", lines: [{ description: "Amazon EC2 - us-east-1", quantity: 1, rate: 5840.1 }, { description: "Amazon RDS for PostgreSQL", quantity: 1, rate: 1790.4 }, { description: "Amazon S3 & data transfer", quantity: 1, rate: 860.22 }] },
  { vendor: "Summit Staffing Partners", invoiceNumber: "SSP-4410", issueDate: "2026-08-31", dueDate: "2026-09-15", stage: "paid", method: "Check", approvers: [A("Liam Novak")], submittedBy: "Liam Novak", glAccount: "6720 Contractors", department: "Operations", paidOn: "2026-09-14", lines: [{ description: "Warehouse associates - weeks of Aug 17 & 24", quantity: 236, rate: 28.5 }] },
  { vendor: "Cooley LLP", invoiceNumber: "INV-20512", issueDate: "2026-07-30", dueDate: "2026-08-29", stage: "paid", method: "Wire", approvers: [A("Tina Cruz"), A("Alexander Bass")], submittedBy: "Tina Cruz", glAccount: "6710 Legal & Professional", department: "Finance", paidOn: "2026-08-28", lines: [{ description: "July legal services - commercial", quantity: 6.8, rate: 925 }] },
  { vendor: "Verizon", invoiceNumber: "0828-54871", issueDate: "2026-08-20", dueDate: "2026-09-04", stage: "paid", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6600 Utilities", department: "Operations", paidOn: "2026-09-02", lines: [{ description: "Business Unlimited - 14 lines", quantity: 14, rate: 45 }, { description: "Fios Business Internet 1 Gig", quantity: 1, rate: 249 }] },
  { vendor: "Datadog", invoiceNumber: "INV-DD-87420", issueDate: "2026-08-31", dueDate: "2026-09-09", stage: "paid", method: "ACH", approvers: [A("Hannah Okafor")], submittedBy: "Ethan Park", glAccount: "6420 Hosting", department: "Engineering", paidOn: "2026-09-08", lines: [{ description: "Infrastructure Pro - 82 hosts", quantity: 82, rate: 23 }] },
  { vendor: "Austin Energy", invoiceNumber: "300-118-2201", issueDate: "2026-08-22", dueDate: "2026-09-07", stage: "paid", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6600 Utilities", department: "Operations", paidOn: "2026-09-04", lines: [{ description: "Electric service - 600 Congress Ave, Ste 1400", quantity: 1, rate: 1352.9 }] },
  { vendor: "Brightline Cleaning Co.", invoiceNumber: "BCC-0815", issueDate: "2026-08-29", dueDate: "2026-09-12", stage: "paid", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6500 Rent", department: "Operations", paidOn: "2026-09-11", lines: [{ description: "Nightly janitorial service - August", quantity: 1, rate: 1650 }] },
  { vendor: "Gusto", invoiceNumber: "GUS-0926-4410", issueDate: "2026-09-01", dueDate: "2026-09-01", stage: "paid", method: "ACH", approvers: [A("Grace Whitfield")], submittedBy: "Grace Whitfield", glAccount: "6410 Software", department: "People", paidOn: "2026-09-01", lines: [{ description: "Gusto Plus - base fee", quantity: 1, rate: 80 }, { description: "Per active employee", quantity: 68, rate: 7.5 }] },
  { vendor: "Comcast", invoiceNumber: "8771-4021-0818", issueDate: "2026-08-21", dueDate: "2026-09-20", stage: "paid", method: "ACH", approvers: [A("Liam Novak")], submittedBy: "Ava Thompson", glAccount: "6600 Utilities", department: "Operations", paidOn: "2026-09-18", lines: [{ description: "Business Internet 1.25 Gig - Seattle office", quantity: 1, rate: 349.95 }, { description: "Static IP block", quantity: 1, rate: 29.95 }] },
  { vendor: "Pacific Office Interiors", invoiceNumber: "POI-7650", issueDate: "2026-08-12", dueDate: "2026-09-11", stage: "paid", method: "Check", approvers: [A("Liam Novak"), A("Alexander Bass")], submittedBy: "Liam Novak", glAccount: "6200 Office Supplies", department: "Operations", paidOn: "2026-09-10", lines: [{ description: "Lounge sofa, 3-seat", quantity: 2, rate: 2480 }, { description: "Delivery", quantity: 1, rate: 220 }] },
  { vendor: "Carta", invoiceNumber: "CARTA-76201", issueDate: "2026-04-01", dueDate: "2026-04-30", stage: "paid", method: "ACH", approvers: [A("Tina Cruz")], submittedBy: "Tina Cruz", glAccount: "6710 Legal & Professional", department: "Finance", paidOn: "2026-04-22", lines: [{ description: "Carta Launch - annual subscription", quantity: 1, rate: 6000 }] },
  { vendor: "HubSpot", invoiceNumber: "HS-INV-334019", issueDate: "2026-09-12", dueDate: "2026-09-22", stage: "paid", method: "ACH", approvers: [A("Marcus Hale"), A("Tina Cruz")], submittedBy: "Marcus Hale", glAccount: "6410 Software", department: "Marketing", paidOn: "2026-09-21", lines: [{ description: "Marketing Hub Professional - monthly", quantity: 1, rate: 1800 }] },
];

const round = (value: number) => Math.round(value * 100) / 100;

export function billTotal(lines: BillLine[]) {
  return round(lines.reduce((sum, line) => sum + line.quantity * line.rate, 0));
}

export const bills: Bill[] = seeds.map((seed, index) => ({
  ...seed,
  id: `bill_${(index + 1001).toString()}`,
  amount: billTotal(seed.lines),
}));

/** Overdue = unpaid, past due date and no payment scheduled. */
export function isOverdue(bill: Bill) {
  return bill.stage !== "paid" && !bill.scheduledFor && daysFromToday(bill.dueDate) < 0;
}

/** Due between today and the end of the next 7 days. */
export function isDueThisWeek(bill: Bill) {
  const days = daysFromToday(bill.dueDate);
  return bill.stage === "payment" && days >= 0 && days <= 7;
}

/** Ramp business account bills are paid from, plus per-vendor remittance details. */
export const payFromAccount = { name: "Operating", last4: "4410", bank: "Ramp Business Account" };

export function remittanceFor(bill: Pick<Bill, "vendor" | "method">) {
  const seed = bill.vendor.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const last4 = String(1000 + (seed * 37) % 9000);
  switch (bill.method) {
    case "ACH":
      return `ACH to ${["Chase", "Wells Fargo", "Bank of America", "SVB"][seed % 4]} ···· ${last4}`;
    case "Wire":
      return `Domestic wire to ${["JPMorgan Chase", "Citibank", "First Republic"][seed % 3]} ···· ${last4}`;
    case "Check":
      return "Mailed check (USPS First-Class)";
    case "Card":
      return "Vendor card ···· 0042";
  }
}

/** Estimated arrival: ACH 3 business days, wire same day, check 5–7 days. */
export function arrivalFor(method: BillMethod) {
  return method === "Wire" ? "Same day" : method === "Check" ? "5–7 business days" : method === "Card" ? "Instant" : "3 business days";
}

export { TODAY };
