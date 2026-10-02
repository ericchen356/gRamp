export type RequestStatus = "in_review" | "approved" | "needs_info" | "rejected" | "draft";

export type TimelineEvent = {
  title: string;
  actor: string;
  date: string;
  note?: string;
  state: "done" | "current" | "upcoming" | "rejected";
};

export type PurchaseRequest = {
  id: string;
  title: string;
  requester: string;
  department: string;
  vendor: string;
  amount: number;
  term: string;
  type: "New vendor" | "Renewal" | "Expansion" | "One-time purchase";
  stages: string[];
  /** Zero-based index of the current stage. */
  stage: number;
  status: RequestStatus;
  due: string;
  submitted: string;
  description: string;
  timeline: TimelineEvent[];
};

const standard = ["Manager approval", "Security review", "Legal review", "Finance approval"];
const light = ["Manager approval", "Finance approval"];

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "REQ-2141",
    title: "Datadog APM expansion",
    requester: "Hannah Okafor",
    department: "Engineering",
    vendor: "Datadog",
    amount: 38400,
    term: "12 months",
    type: "Expansion",
    stages: standard,
    stage: 2,
    status: "in_review",
    due: "2026-10-06",
    submitted: "2026-09-22",
    description: "Add 40 APM hosts and 30-day log retention ahead of the Q4 launch traffic.",
    timeline: [
      { title: "Request submitted", actor: "Hannah Okafor", date: "2026-09-22", state: "done" },
      { title: "Manager approval", actor: "Alexander Bass", date: "2026-09-23", state: "done", note: "Approved, keep it under $40k." },
      { title: "Security review", actor: "Ethan Park", date: "2026-09-26", state: "done", note: "SOC 2 Type II on file." },
      { title: "Legal review", actor: "Tina Cruz", date: "2026-10-06", state: "current", note: "Redlining DPA" },
      { title: "Finance approval", actor: "Alexander Bass", date: "2026-10-08", state: "upcoming" },
    ],
  },
  {
    id: "REQ-2140",
    title: "Figma Organization renewal",
    requester: "Noah Kim",
    department: "Design",
    vendor: "Figma",
    amount: 14400,
    term: "12 months",
    type: "Renewal",
    stages: light,
    stage: 1,
    status: "in_review",
    due: "2026-10-04",
    submitted: "2026-09-25",
    description: "Renew 20 editor seats. Price Intelligence suggests a 9% discount is achievable.",
    timeline: [
      { title: "Request submitted", actor: "Noah Kim", date: "2026-09-25", state: "done" },
      { title: "Manager approval", actor: "Hannah Okafor", date: "2026-09-26", state: "done" },
      { title: "Finance approval", actor: "Alexander Bass", date: "2026-10-04", state: "current" },
    ],
  },
  {
    id: "REQ-2139",
    title: "Salesforce Sales Cloud seats",
    requester: "Sofia Alvarez",
    department: "Sales",
    vendor: "Salesforce",
    amount: 27000,
    term: "12 months",
    type: "Expansion",
    stages: standard,
    stage: 0,
    status: "needs_info",
    due: "2026-10-03",
    submitted: "2026-09-29",
    description: "Ten additional Sales Cloud Enterprise seats for new AEs starting in October.",
    timeline: [
      { title: "Request submitted", actor: "Sofia Alvarez", date: "2026-09-29", state: "done" },
      { title: "Manager approval", actor: "Alexander Bass", date: "2026-10-01", state: "current", note: "Can we reuse seats from departed reps first?" },
      { title: "Security review", actor: "Ethan Park", date: "2026-10-05", state: "upcoming" },
      { title: "Legal review", actor: "Tina Cruz", date: "2026-10-07", state: "upcoming" },
      { title: "Finance approval", actor: "Alexander Bass", date: "2026-10-09", state: "upcoming" },
    ],
  },
  {
    id: "REQ-2138",
    title: "Linear Business plan",
    requester: "Ethan Park",
    department: "Engineering",
    vendor: "Linear",
    amount: 6720,
    term: "12 months",
    type: "Renewal",
    stages: light,
    stage: 2,
    status: "approved",
    due: "2026-09-30",
    submitted: "2026-09-18",
    description: "Upgrade from Plus to Business for SLAs and Insights.",
    timeline: [
      { title: "Request submitted", actor: "Ethan Park", date: "2026-09-18", state: "done" },
      { title: "Manager approval", actor: "Hannah Okafor", date: "2026-09-19", state: "done" },
      { title: "Finance approval", actor: "Alexander Bass", date: "2026-09-22", state: "done" },
      { title: "PO-1047 issued", actor: "Ramp", date: "2026-09-22", state: "done" },
    ],
  },
  {
    id: "REQ-2137",
    title: "HubSpot Marketing Hub upgrade",
    requester: "Marcus Hale",
    department: "Marketing",
    vendor: "HubSpot",
    amount: 21600,
    term: "12 months",
    type: "Expansion",
    stages: standard,
    stage: 3,
    status: "in_review",
    due: "2026-10-10",
    submitted: "2026-09-15",
    description: "Move to Enterprise for custom objects and multi-touch attribution.",
    timeline: [
      { title: "Request submitted", actor: "Marcus Hale", date: "2026-09-15", state: "done" },
      { title: "Manager approval", actor: "Alexander Bass", date: "2026-09-16", state: "done" },
      { title: "Security review", actor: "Ethan Park", date: "2026-09-19", state: "done" },
      { title: "Legal review", actor: "Tina Cruz", date: "2026-09-27", state: "done" },
      { title: "Finance approval", actor: "Alexander Bass", date: "2026-10-10", state: "current" },
    ],
  },
  {
    id: "REQ-2136",
    title: "Rippling PEO migration",
    requester: "Grace Whitfield",
    department: "People",
    vendor: "Rippling",
    amount: 52800,
    term: "24 months",
    type: "New vendor",
    stages: standard,
    stage: 1,
    status: "in_review",
    due: "2026-10-14",
    submitted: "2026-09-24",
    description: "Replace Gusto with Rippling PEO for benefits in 4 states.",
    timeline: [
      { title: "Request submitted", actor: "Grace Whitfield", date: "2026-09-24", state: "done" },
      { title: "Manager approval", actor: "Liam Novak", date: "2026-09-25", state: "done" },
      { title: "Security review", actor: "Ethan Park", date: "2026-10-14", state: "current" },
      { title: "Legal review", actor: "Tina Cruz", date: "2026-10-18", state: "upcoming" },
      { title: "Finance approval", actor: "Alexander Bass", date: "2026-10-21", state: "upcoming" },
    ],
  },
  {
    id: "REQ-2135",
    title: "WeWork Austin team space",
    requester: "Liam Novak",
    department: "Operations",
    vendor: "WeWork",
    amount: 64800,
    term: "12 months",
    type: "New vendor",
    stages: standard,
    stage: 2,
    status: "rejected",
    due: "2026-09-28",
    submitted: "2026-09-08",
    description: "12-desk private office on South Congress.",
    timeline: [
      { title: "Request submitted", actor: "Liam Novak", date: "2026-09-08", state: "done" },
      { title: "Manager approval", actor: "Alexander Bass", date: "2026-09-09", state: "done" },
      { title: "Security review", actor: "Ethan Park", date: "2026-09-12", state: "done" },
      { title: "Legal review", actor: "Tina Cruz", date: "2026-09-19", state: "rejected", note: "Termination clause not acceptable. Revisit in Q1." },
    ],
  },
  {
    id: "REQ-2134",
    title: "DocuSign Business Pro",
    requester: "Tina Cruz",
    department: "Finance",
    vendor: "DocuSign",
    amount: 4320,
    term: "12 months",
    type: "Renewal",
    stages: light,
    stage: 0,
    status: "draft",
    due: "2026-10-20",
    submitted: "2026-10-01",
    description: "Renew 8 senders. Considering consolidating onto Ramp e-sign.",
    timeline: [{ title: "Draft created", actor: "Tina Cruz", date: "2026-10-01", state: "current" }],
  },
  {
    id: "REQ-2133",
    title: "Atlassian Jira Service Management",
    requester: "Liam Novak",
    department: "Operations",
    vendor: "Atlassian",
    amount: 9180,
    term: "12 months",
    type: "New vendor",
    stages: standard,
    stage: 4,
    status: "approved",
    due: "2026-09-25",
    submitted: "2026-09-02",
    description: "IT help desk for laptop provisioning and access requests.",
    timeline: [
      { title: "Request submitted", actor: "Liam Novak", date: "2026-09-02", state: "done" },
      { title: "Manager approval", actor: "Alexander Bass", date: "2026-09-03", state: "done" },
      { title: "Security review", actor: "Ethan Park", date: "2026-09-08", state: "done" },
      { title: "Legal review", actor: "Tina Cruz", date: "2026-09-15", state: "done" },
      { title: "Finance approval", actor: "Alexander Bass", date: "2026-09-17", state: "done" },
    ],
  },
];

export const requestStatusLabels: Record<RequestStatus, string> = {
  in_review: "In review",
  approved: "Approved",
  needs_info: "Needs info",
  rejected: "Rejected",
  draft: "Draft",
};

export type PurchaseOrderStatus = "open" | "partially_received" | "closed" | "draft" | "cancelled";

export type PurchaseOrder = {
  id: string;
  vendor: string;
  description: string;
  owner: string;
  amount: number;
  received: number;
  billed: number;
  issued: string;
  status: PurchaseOrderStatus;
  request?: string;
  lines: number;
};

export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-1048", vendor: "Datadog", description: "APM + log retention expansion", owner: "Hannah Okafor", amount: 38400, received: 0, billed: 0, issued: "2026-10-01", status: "draft", request: "REQ-2141", lines: 3 },
  { id: "PO-1047", vendor: "Linear", description: "Linear Business · 28 seats", owner: "Ethan Park", amount: 6720, received: 6720, billed: 3360, issued: "2026-09-22", status: "open", request: "REQ-2138", lines: 1 },
  { id: "PO-1046", vendor: "Atlassian", description: "Jira Service Management · 15 agents", owner: "Liam Novak", amount: 9180, received: 9180, billed: 9180, issued: "2026-09-17", status: "closed", request: "REQ-2133", lines: 2 },
  { id: "PO-1045", vendor: "Amazon", description: "Monitors and docks for Q4 hires", owner: "Ava Thompson", amount: 12460.8, received: 7476.48, billed: 7476.48, issued: "2026-09-10", status: "partially_received", lines: 6 },
  { id: "PO-1044", vendor: "Salesforce", description: "Sales Cloud Enterprise · annual", owner: "Sofia Alvarez", amount: 81000, received: 81000, billed: 40500, issued: "2026-08-28", status: "open", lines: 2 },
  { id: "PO-1043", vendor: "WeWork", description: "NYC hot desks · Q4", owner: "Liam Novak", amount: 12600, received: 8400, billed: 8400, issued: "2026-08-20", status: "partially_received", lines: 3 },
  { id: "PO-1042", vendor: "Marriott", description: "Engineering offsite room block", owner: "Hannah Okafor", amount: 9450, received: 0, billed: 2835, issued: "2026-08-12", status: "open", lines: 1 },
  { id: "PO-1041", vendor: "Adobe", description: "Creative Cloud for teams · 6 seats", owner: "Noah Kim", amount: 5399.28, received: 5399.28, billed: 5399.28, issued: "2026-07-30", status: "closed", lines: 1 },
  { id: "PO-1040", vendor: "Gusto", description: "Payroll Q3 (pre-migration)", owner: "Grace Whitfield", amount: 3600, received: 3600, billed: 3600, issued: "2026-07-01", status: "closed", lines: 1 },
  { id: "PO-1039", vendor: "Home Depot", description: "Austin office buildout materials", owner: "Ava Thompson", amount: 4210.45, received: 0, billed: 0, issued: "2026-06-24", status: "cancelled", lines: 9 },
];

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  open: "Open",
  partially_received: "Partially received",
  closed: "Closed",
  draft: "Draft",
  cancelled: "Cancelled",
};

export type IntakeField = {
  label: string;
  kind: "text" | "textarea" | "select" | "amount" | "date" | "file" | "vendor" | "person";
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type IntakeForm = {
  id: string;
  name: string;
  description: string;
  owner: string;
  submissions: number;
  updated: string;
  active: boolean;
  workflow: string[];
  fields: IntakeField[];
};

export const intakeForms: IntakeForm[] = [
  {
    id: "software",
    name: "Software purchase",
    description: "New SaaS tools, seat expansions and plan upgrades.",
    owner: "Alexander Bass",
    submissions: 64,
    updated: "2026-09-18",
    active: true,
    workflow: ["Manager", "Security", "Legal", "Finance"],
    fields: [
      { label: "Vendor", kind: "vendor", required: true, placeholder: "Search or add a vendor" },
      { label: "What will this be used for?", kind: "textarea", required: true, placeholder: "Describe the business need and who will use it" },
      { label: "Estimated annual cost", kind: "amount", required: true },
      { label: "Contract term", kind: "select", options: ["Monthly", "12 months", "24 months", "36 months"], required: true },
      { label: "Will this tool access customer data?", kind: "select", options: ["Yes", "No", "Not sure"], required: true },
      { label: "Quote or order form", kind: "file" },
    ],
  },
  {
    id: "vendor",
    name: "New vendor onboarding",
    description: "Collect W-9, banking details and risk information for new suppliers.",
    owner: "Tina Cruz",
    submissions: 31,
    updated: "2026-08-02",
    active: true,
    workflow: ["Finance", "Legal"],
    fields: [
      { label: "Vendor legal name", kind: "text", required: true, placeholder: "e.g. Acme Corporation" },
      { label: "Vendor contact email", kind: "text", required: true, placeholder: "billing@vendor.com" },
      { label: "Category", kind: "select", options: ["Software", "Professional services", "Facilities", "Marketing"], required: true },
      { label: "W-9", kind: "file", required: true },
      { label: "Business owner", kind: "person", required: true },
    ],
  },
  {
    id: "renewal",
    name: "Contract renewal",
    description: "Review usage and negotiate before an existing contract auto-renews.",
    owner: "Alexander Bass",
    submissions: 22,
    updated: "2026-09-05",
    active: true,
    workflow: ["Manager", "Finance"],
    fields: [
      { label: "Vendor", kind: "vendor", required: true, placeholder: "Search vendors" },
      { label: "Renewal date", kind: "date", required: true },
      { label: "Proposed amount", kind: "amount", required: true },
      { label: "Change in seats or usage", kind: "textarea", placeholder: "Anything changing from last term?" },
    ],
  },
  {
    id: "hardware",
    name: "Hardware request",
    description: "Laptops, monitors and peripherals for employees.",
    owner: "Liam Novak",
    submissions: 48,
    updated: "2026-07-14",
    active: true,
    workflow: ["Manager", "IT"],
    fields: [
      { label: "Requested for", kind: "person", required: true },
      { label: "Item", kind: "select", options: ["MacBook Pro 14\"", "MacBook Air 13\"", "Studio Display", "Dell U2723QE", "Other"], required: true },
      { label: "Needed by", kind: "date", required: true },
      { label: "Notes", kind: "textarea", placeholder: "Shipping address, accessories..." },
    ],
  },
  {
    id: "services",
    name: "Marketing services",
    description: "Agencies, freelancers and event vendors.",
    owner: "Marcus Hale",
    submissions: 9,
    updated: "2026-06-11",
    active: false,
    workflow: ["Manager", "Legal", "Finance"],
    fields: [
      { label: "Vendor", kind: "vendor", required: true, placeholder: "Search or add a vendor" },
      { label: "Scope of work", kind: "textarea", required: true, placeholder: "Deliverables, timeline and success criteria" },
      { label: "Total cost", kind: "amount", required: true },
      { label: "Statement of work", kind: "file", required: true },
    ],
  },
];
