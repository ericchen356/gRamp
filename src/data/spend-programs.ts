export type ProgramIcon = "software" | "travel" | "meals" | "office" | "events" | "learning" | "hardware" | "wellness";
export type RequestBehavior = "approval" | "auto" | "admin";

export type ProgramMember = {
  name: string;
  cardLast4?: string;
  limit: number;
  spent: number;
  joined: string;
  /** Requested but not yet issued. */
  pending?: boolean;
};

export type SpendProgram = {
  id: string;
  name: string;
  icon: ProgramIcon;
  description: string;
  owner: string;
  request: RequestBehavior;
  cardType: "Virtual" | "Physical" | "Virtual or physical";
  /** Default per-member limit. */
  memberLimit: number;
  frequency: "Monthly" | "Quarterly" | "Yearly" | "One-time";
  /** Program-wide monthly limit across all members. */
  monthlyLimit: number;
  spentThisMonth: number;
  categories: string[];
  approvers: string[];
  receiptThreshold: number;
  autoLockDays?: number;
  members: ProgramMember[];
  status: "active" | "draft";
  updated: string;
};

export const requestBehaviorLabels: Record<RequestBehavior, string> = {
  approval: "Employees request · manager approves",
  auto: "Employees request · auto-approved",
  admin: "Admins issue only",
};

/** Compact label for program cards. */
export const requestBehaviorShort: Record<RequestBehavior, string> = {
  approval: "Request · manager approval",
  auto: "Request · auto-approved",
  admin: "Admins issue only",
};

export const spendPrograms: SpendProgram[] = [
  {
    id: "software",
    name: "Software subscriptions",
    icon: "software",
    description: "Virtual cards for SaaS tools, each locked to a single vendor.",
    owner: "Alexander Bass",
    request: "approval",
    cardType: "Virtual",
    memberLimit: 2500,
    frequency: "Monthly",
    monthlyLimit: 50000,
    spentThisMonth: 31504.46,
    categories: ["SaaS / Software", "Cloud Infrastructure"],
    approvers: ["Manager", "Alexander Bass"],
    receiptThreshold: 0,
    autoLockDays: 60,
    status: "active",
    updated: "2026-09-21",
    members: [
      { name: "Alexander Bass", cardLast4: "0042", limit: 15000, spent: 9842.18, joined: "2025-08-14" },
      { name: "Hannah Okafor", cardLast4: "9930", limit: 25000, spent: 18942.4, joined: "2025-11-20" },
      { name: "Noah Kim", cardLast4: "2208", limit: 1500, spent: 899.88, joined: "2025-10-01" },
      { name: "Ethan Park", cardLast4: "6121", limit: 2500, spent: 1820.0, joined: "2026-05-11" },
      { name: "Mia Chen", cardLast4: "5571", limit: 800, spent: 0, joined: "2026-09-29" },
      { name: "Priya Raman", limit: 1000, spent: 0, joined: "2026-10-01", pending: true },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    icon: "travel",
    description: "Flights, lodging and ground transport for business trips.",
    owner: "Sofia Alvarez",
    request: "approval",
    cardType: "Physical",
    memberLimit: 4000,
    frequency: "Monthly",
    monthlyLimit: 20000,
    spentThisMonth: 9757.59,
    categories: ["Airlines", "Lodging", "Rideshare", "Fuel and Gas", "Restaurants"],
    approvers: ["Manager"],
    receiptThreshold: 75,
    status: "active",
    updated: "2026-09-12",
    members: [
      { name: "Sofia Alvarez", cardLast4: "6604", limit: 8000, spent: 4768.72, joined: "2025-01-12" },
      { name: "Jordan Lee", cardLast4: "3317", limit: 4000, spent: 3833.69, joined: "2025-09-08" },
      { name: "Diego Santos", cardLast4: "8812", limit: 4000, spent: 1155.18, joined: "2026-04-18" },
    ],
  },
  {
    id: "meals",
    name: "Meals",
    icon: "meals",
    description: "Team lunches, client dinners and working meals.",
    owner: "Liam Novak",
    request: "auto",
    cardType: "Virtual or physical",
    memberLimit: 500,
    frequency: "Monthly",
    monthlyLimit: 4000,
    spentThisMonth: 660.6,
    categories: ["Restaurants"],
    approvers: [],
    receiptThreshold: 75,
    autoLockDays: 30,
    status: "active",
    updated: "2026-08-30",
    members: [
      { name: "Ava Thompson", cardLast4: "7350", limit: 1500, spent: 642.15, joined: "2025-06-09" },
      { name: "Grace Whitfield", cardLast4: "1450", limit: 1000, spent: 18.45, joined: "2025-03-16" },
    ],
  },
  {
    id: "office",
    name: "Office supplies",
    icon: "office",
    description: "Furniture, kitchen restocks and everyday supplies for each office.",
    owner: "Liam Novak",
    request: "approval",
    cardType: "Physical",
    memberLimit: 2500,
    frequency: "Monthly",
    monthlyLimit: 15000,
    spentThisMonth: 5461.11,
    categories: ["General Merchandise", "Hardware", "Shipping"],
    approvers: ["Liam Novak"],
    receiptThreshold: 75,
    status: "active",
    updated: "2026-07-02",
    members: [
      { name: "Liam Novak", cardLast4: "7783", limit: 10000, spent: 5207.6, joined: "2025-06-03" },
      { name: "Ava Thompson", cardLast4: "1190", limit: 2500, spent: 253.51, joined: "2025-07-21" },
    ],
  },
  {
    id: "events",
    name: "Marketing events",
    icon: "events",
    description: "Sponsorships, booths, swag and event travel for field marketing.",
    owner: "Marcus Hale",
    request: "approval",
    cardType: "Virtual",
    memberLimit: 5000,
    frequency: "One-time",
    monthlyLimit: 25000,
    spentThisMonth: 9362.71,
    categories: ["Advertising", "Restaurants", "Lodging", "General Merchandise"],
    approvers: ["Marcus Hale", "Alexander Bass"],
    receiptThreshold: 50,
    autoLockDays: 14,
    status: "active",
    updated: "2026-09-28",
    members: [
      { name: "Marcus Hale", cardLast4: "4021", limit: 5000, spent: 1848.21, joined: "2025-02-27" },
      { name: "Marcus Hale", cardLast4: "2290", limit: 12000, spent: 7340.5, joined: "2026-07-15" },
      { name: "Priya Raman", cardLast4: "5520", limit: 3000, spent: 174.0, joined: "2025-12-04" },
    ],
  },
  {
    id: "learning",
    name: "Learning & development",
    icon: "learning",
    description: "Books, courses and conference tickets, up to $1,500 per year.",
    owner: "Grace Whitfield",
    request: "auto",
    cardType: "Virtual",
    memberLimit: 1500,
    frequency: "Yearly",
    monthlyLimit: 5000,
    spentThisMonth: 748.0,
    categories: ["Education", "SaaS / Software"],
    approvers: [],
    receiptThreshold: 0,
    status: "active",
    updated: "2026-06-18",
    members: [],
  },
  {
    id: "hardware",
    name: "Equipment",
    icon: "hardware",
    description: "Laptops, monitors and peripherals for new hires.",
    owner: "Hannah Okafor",
    request: "admin",
    cardType: "Virtual",
    memberLimit: 3500,
    frequency: "One-time",
    monthlyLimit: 20000,
    spentThisMonth: 0,
    categories: ["Electronics", "General Merchandise"],
    approvers: ["Hannah Okafor"],
    receiptThreshold: 0,
    autoLockDays: 7,
    status: "draft",
    updated: "2026-09-30",
    members: [],
  },
  {
    id: "wellness",
    name: "Wellness stipend",
    icon: "wellness",
    description: "Gym memberships, fitness classes and mental health apps.",
    owner: "Grace Whitfield",
    request: "auto",
    cardType: "Virtual",
    memberLimit: 100,
    frequency: "Monthly",
    monthlyLimit: 1400,
    spentThisMonth: 812.4,
    categories: ["Health & Fitness"],
    approvers: [],
    receiptThreshold: 0,
    status: "active",
    updated: "2026-05-04",
    members: [],
  },
];

/** Members whose names aren't listed individually (stipend programs). */
export const programHeadcount: Record<string, number> = {
  learning: 9,
  wellness: 14,
};

export function memberCount(program: SpendProgram) {
  return programHeadcount[program.id] ?? new Set(program.members.map((m) => m.name)).size;
}

export function cardCount(program: SpendProgram) {
  return program.members.filter((m) => m.cardLast4).length + (programHeadcount[program.id] ?? 0);
}
