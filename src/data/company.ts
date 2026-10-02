import { people, type Person } from "./people";

export type MemberStatus = "Active" | "Invited";

export type Member = Person & {
  status: MemberStatus;
  /** Active Ramp cards held by the person. */
  cards: number;
  spendThisMonth: number;
  /** ISO date the invite was sent (invited people) or the person joined. */
  since: string;
};

const activity: Record<string, { cards: number; spend: number; since: string }> = {
  p_alexander: { cards: 4, spend: 12840.22, since: "2023-03-14" },
  p_tina: { cards: 2, spend: 1460.5, since: "2023-03-20" },
  p_marcus: { cards: 3, spend: 6380.14, since: "2023-06-02" },
  p_priya: { cards: 2, spend: 1288.9, since: "2024-01-08" },
  p_jordan: { cards: 2, spend: 2410.66, since: "2024-04-15" },
  p_sofia: { cards: 3, spend: 5120.0, since: "2023-08-21" },
  p_ethan: { cards: 2, spend: 1920.0, since: "2024-02-12" },
  p_hannah: { cards: 3, spend: 14280.4, since: "2023-05-30" },
  p_liam: { cards: 3, spend: 5236.71, since: "2023-07-11" },
  p_ava: { cards: 1, spend: 683.79, since: "2024-09-03" },
  p_noah: { cards: 1, spend: 899.88, since: "2025-01-21" },
  p_mia: { cards: 0, spend: 0, since: "2025-03-17" },
  p_diego: { cards: 2, spend: 1155.18, since: "2025-05-06" },
  p_grace: { cards: 1, spend: 18.45, since: "2025-08-25" },
};

export const members: Member[] = [
  ...people.map((person) => ({
    ...person,
    status: "Active" as const,
    cards: activity[person.id]?.cards ?? 0,
    spendThisMonth: activity[person.id]?.spend ?? 0,
    since: activity[person.id]?.since ?? "2025-01-01",
  })),
  {
    id: "p_riley",
    name: "Riley Brooks",
    email: "riley@efficient.app",
    title: "Data Analyst",
    department: "Finance",
    location: "Austin, TX",
    role: "Employee",
    manager: "Tina Cruz",
    status: "Invited",
    cards: 0,
    spendThisMonth: 0,
    since: "2026-09-28",
  },
];

export const roles: Person["role"][] = ["Admin", "Business owner", "Bookkeeper", "Manager", "Employee"];

export const roleDescriptions: Record<Person["role"], string> = {
  Admin: "Full access to spend, people and settings",
  "Business owner": "Admin access plus billing and ownership",
  Bookkeeper: "Review and sync transactions to accounting",
  Manager: "Approve spend for direct reports",
  Employee: "Request funds and submit receipts",
};

export type Department = {
  name: string;
  owner: string;
  glCode: string;
  monthlyBudget: number;
  spendThisMonth: number;
  spendLastMonth: number;
};

export const departmentRecords: Department[] = [
  { name: "Engineering", owner: "Hannah Okafor", glCode: "200", monthlyBudget: 40000, spendThisMonth: 31412.51, spendLastMonth: 28994.1 },
  { name: "Sales", owner: "Sofia Alvarez", glCode: "300", monthlyBudget: 15000, spendThisMonth: 9876.84, spendLastMonth: 11240.37 },
  { name: "Marketing", owner: "Marcus Hale", glCode: "400", monthlyBudget: 12000, spendThisMonth: 9417.25, spendLastMonth: 7310.02 },
  { name: "Operations", owner: "Liam Novak", glCode: "500", monthlyBudget: 10000, spendThisMonth: 6920.5, spendLastMonth: 6655.8 },
  { name: "Finance", owner: "Alexander Bass", glCode: "100", monthlyBudget: 6000, spendThisMonth: 3812.4, spendLastMonth: 4102.66 },
  { name: "Design", owner: "Noah Kim", glCode: "210", monthlyBudget: 3000, spendThisMonth: 1259.76, spendLastMonth: 1102.0 },
  { name: "People", owner: "Grace Whitfield", glCode: "600", monthlyBudget: 2500, spendThisMonth: 418.45, spendLastMonth: 860.2 },
];

export type OfficeLocation = {
  name: string;
  address: string;
  owner: string;
  timezone: string;
  spendThisMonth: number;
  headquarters?: boolean;
};

export const locationRecords: OfficeLocation[] = [
  { name: "Austin, TX", address: "500 W 2nd St, Suite 1900, Austin, TX 78701", owner: "Alexander Bass", timezone: "Central (CT)", spendThisMonth: 15002.86, headquarters: true },
  { name: "New York", address: "28 W 23rd St, Floor 4, New York, NY 10010", owner: "Liam Novak", timezone: "Eastern (ET)", spendThisMonth: 21437.11 },
  { name: "San Francisco", address: "201 Spear St, Suite 1100, San Francisco, CA 94105", owner: "Sofia Alvarez", timezone: "Pacific (PT)", spendThisMonth: 8685.84 },
  { name: "Seattle", address: "1201 2nd Ave, Floor 9, Seattle, WA 98101", owner: "Marcus Hale", timezone: "Pacific (PT)", spendThisMonth: 7280.02 },
  { name: "Remote", address: "Distributed team", owner: "Grace Whitfield", timezone: "Various", spendThisMonth: 18.45 },
];

export type BankAccount = { bank: string; nickname: string; last4: string; currency: string; primary?: boolean };

export type Entity = {
  id: string;
  legalName: string;
  shortName: string;
  country: string;
  flag: string;
  currency: string;
  currencyName: string;
  taxIdLabel: string;
  taxId: string;
  incorporated: string;
  address: string;
  balance: number;
  cards: number;
  primary?: boolean;
  bankAccounts: BankAccount[];
};

export const entities: Entity[] = [
  {
    id: "us",
    legalName: "Efficient App, Inc.",
    shortName: "United States",
    country: "Delaware C-Corp",
    flag: "US",
    currency: "USD",
    currencyName: "US Dollar",
    taxIdLabel: "EIN",
    taxId: "86-2194821",
    incorporated: "2021-02-09",
    address: "500 W 2nd St, Suite 1900, Austin, TX 78701",
    balance: 1284562.18,
    cards: 29,
    primary: true,
    bankAccounts: [
      { bank: "Chase", nickname: "Operating", last4: "4021", currency: "USD", primary: true },
      { bank: "Silicon Valley Bank", nickname: "Payroll", last4: "7783", currency: "USD" },
      { bank: "Ramp Treasury", nickname: "Business Account", last4: "0918", currency: "USD" },
    ],
  },
  {
    id: "uk",
    legalName: "Efficient App Ltd",
    shortName: "United Kingdom",
    country: "Private limited company",
    flag: "GB",
    currency: "GBP",
    currencyName: "British Pound",
    taxIdLabel: "Company no.",
    taxId: "1440 3394",
    incorporated: "2024-05-17",
    address: "1 Finsbury Avenue, London EC2M 2PF",
    balance: 214880.4,
    cards: 6,
    bankAccounts: [
      { bank: "Barclays", nickname: "Operating", last4: "5520", currency: "GBP", primary: true },
      { bank: "Wise", nickname: "Payables", last4: "3317", currency: "GBP" },
    ],
  },
  {
    id: "in",
    legalName: "Efficient App India Pvt Ltd",
    shortName: "India",
    country: "Private limited company",
    flag: "IN",
    currency: "INR",
    currencyName: "Indian Rupee",
    taxIdLabel: "PAN",
    taxId: "AAHCE6402K",
    incorporated: "2025-01-06",
    address: "WeWork Galaxy, 43 Residency Rd, Bengaluru 560025",
    balance: 9870450,
    cards: 4,
    bankAccounts: [{ bank: "HDFC Bank", nickname: "Operating", last4: "9930", currency: "INR", primary: true }],
  },
];

export type ApprovalStep = {
  id: string;
  approver: string;
  description: string;
  /** Condition shown on the connector into this step. */
  condition?: string;
  kind: "manager" | "department" | "finance" | "person";
};

export type ApprovalChain = {
  id: string;
  name: string;
  appliesTo: string;
  requests: number;
  steps: ApprovalStep[];
};

export const approvalChains: ApprovalChain[] = [
  {
    id: "spend",
    name: "Spend requests",
    appliesTo: "Funds, card requests and limit increases",
    requests: 42,
    steps: [
      { id: "s1", approver: "Manager", description: "Requester's direct manager", kind: "manager" },
      { id: "s2", approver: "Department head", description: "Owner of the requester's department", kind: "department" },
      { id: "s3", approver: "Finance", description: "Tina Cruz or Alexander Bass", condition: "If amount > $5,000", kind: "finance" },
    ],
  },
  {
    id: "bills",
    name: "Bill payments",
    appliesTo: "Bills from vendors over $0",
    requests: 18,
    steps: [
      { id: "b1", approver: "Department head", description: "Owner of the bill's department", kind: "department" },
      { id: "b2", approver: "Finance", description: "Tina Cruz", condition: "If amount > $10,000", kind: "finance" },
      { id: "b3", approver: "Alexander Bass", description: "Head of Finance", condition: "If vendor is new", kind: "person" },
    ],
  },
  {
    id: "reimbursements",
    name: "Reimbursements",
    appliesTo: "Out-of-pocket and mileage",
    requests: 36,
    steps: [{ id: "r1", approver: "Manager", description: "Requester's direct manager", kind: "manager" }],
  },
];
