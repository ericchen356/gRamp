/**
 * Cash & Treasury sample data. Entities and balances mirror the production
 * reference screenshot (Acme Corporation group); people come from `people.ts`.
 */

export type TreasuryAccount = {
  id: string;
  name: string;
  balance: number;
  /** Trailing 12 balance samples for the row sparkline. */
  trend: number[];
  kind: "business" | "investment" | "operations" | "payroll";
  last4: string;
};

export type TreasuryEntity = {
  id: string;
  name: string;
  total: number;
  accounts: TreasuryAccount[];
};

export const treasurySummary = {
  totalBalance: 1000,
  available: 900,
  allTimeEarnings: 145,
};

/** Stacked balance history: `cash` (sage, bottom) + `invested` (plum, top). */
export type BalancePoint = { label: string; cash: number; invested: number };

/** Month-end balances; the last point equals `treasurySummary.totalBalance`. */
export const balanceHistory: BalancePoint[] = [
  { label: "Aug 2025", cash: 429, invested: 171 },
  { label: "Sep 2025", cash: 454, invested: 183 },
  { label: "Oct 2025", cash: 480, invested: 194 },
  { label: "Nov 2025", cash: 503, invested: 209 },
  { label: "Dec 2025", cash: 511, invested: 214 },
  { label: "Jan 2026", cash: 520, invested: 219 },
  { label: "Feb 2026", cash: 529, invested: 223 },
  { label: "Mar 2026", cash: 537, invested: 227 },
  { label: "Apr 2026", cash: 544, invested: 231 },
  { label: "May 2026", cash: 551, invested: 236 },
  { label: "Jun 2026", cash: 589, invested: 280 },
  { label: "Jul 2026", cash: 650, invested: 306 },
  { label: "Aug 2026", cash: 654, invested: 306 },
  { label: "Sep 2026", cash: 660, invested: 309 },
  { label: "Oct 2026", cash: 683, invested: 317 },
];

export const entities: TreasuryEntity[] = [
  {
    id: "ent_acme",
    name: "Acme Corporation",
    total: 32_614_887.89,
    accounts: [
      {
        id: "acct_business",
        name: "Business Account",
        balance: 555_671.9,
        kind: "business",
        last4: "4402",
        trend: [40, 44, 46, 47, 48, 49, 50, 51, 52, 58, 59, 64],
      },
      {
        id: "acct_investment",
        name: "Investment Account",
        balance: 102_684.99,
        kind: "investment",
        last4: "8817",
        trend: [30, 33, 36, 37, 38, 39, 40, 41, 46, 47, 48, 52],
      },
    ],
  },
  {
    id: "ent_acme_india",
    name: "Acme India Corporation Ltd",
    total: 1_617_238.67,
    accounts: [
      {
        id: "acct_operations",
        name: "Operations Account",
        balance: 1_204_330.12,
        kind: "operations",
        last4: "2290",
        trend: [52, 50, 53, 55, 54, 56, 58, 57, 60, 66, 67, 70],
      },
      {
        id: "acct_payroll",
        name: "Payroll Account",
        balance: 412_908.55,
        kind: "payroll",
        last4: "1176",
        trend: [44, 45, 47, 47, 48, 50, 51, 51, 53, 58, 59, 61],
      },
    ],
  },
];

export const allAccounts = entities.flatMap((entity) => entity.accounts);

export type ApprovalRequest =
  | {
      id: string;
      kind: "withdrawal";
      counterparty: string;
      amount: number;
      fromAccount: string;
      expires: string;
    }
  | {
      id: string;
      kind: "automation";
      title: string;
      requestedBy: string;
      fromAccount: string;
      toAccount: string;
    };

export const approvalRequests: ApprovalRequest[] = [
  {
    id: "apr_notion",
    kind: "withdrawal",
    counterparty: "Notion",
    amount: 30_000,
    fromAccount: "Business Account",
    expires: "2026-10-09",
  },
  {
    id: "apr_sweep",
    kind: "automation",
    title: "Sweep excess funds above $200,000",
    requestedBy: "Tina Cruz",
    fromAccount: "Operations",
    toAccount: "Investment Account",
  },
];

export type AutomationKind = "sweep" | "deposit";
export type AutomationFrequency = "Daily" | "Weekly" | "Monthly" | "When threshold is crossed";

export type Automation = {
  id: string;
  kind: AutomationKind;
  name: string;
  from: string;
  to: string;
  /** Balance threshold that triggers the transfer (sweeps) or fixed amount (deposits). */
  amount: number;
  frequency: AutomationFrequency;
  lastRun: string | null;
  nextRun: string;
  createdBy: string;
  enabled: boolean;
};

export const automations: Automation[] = [
  {
    id: "auto_1",
    kind: "sweep",
    name: "Sweep excess operating cash",
    from: "Business Account",
    to: "Investment Account",
    amount: 500_000,
    frequency: "Daily",
    lastRun: "2026-10-01",
    nextRun: "2026-10-03",
    createdBy: "Tina Cruz",
    enabled: true,
  },
  {
    id: "auto_2",
    kind: "deposit",
    name: "Fund payroll before run",
    from: "Business Account",
    to: "Payroll Account",
    amount: 180_000,
    frequency: "Weekly",
    lastRun: "2026-09-26",
    nextRun: "2026-10-03",
    createdBy: "Alexander Bass",
    enabled: true,
  },
  {
    id: "auto_3",
    kind: "deposit",
    name: "Top up India operations",
    from: "Business Account",
    to: "Operations Account",
    amount: 75_000,
    frequency: "Monthly",
    lastRun: "2026-09-01",
    nextRun: "2026-11-01",
    createdBy: "Mia Chen",
    enabled: true,
  },
  {
    id: "auto_4",
    kind: "sweep",
    name: "Return idle investment cash",
    from: "Investment Account",
    to: "Business Account",
    amount: 50_000,
    frequency: "When threshold is crossed",
    lastRun: "2026-08-14",
    nextRun: "2026-10-02",
    createdBy: "Tina Cruz",
    enabled: false,
  },
  {
    id: "auto_5",
    kind: "sweep",
    name: "Sweep India surplus",
    from: "Operations Account",
    to: "Investment Account",
    amount: 1_000_000,
    frequency: "Weekly",
    lastRun: null,
    nextRun: "2026-10-05",
    createdBy: "Alexander Bass",
    enabled: false,
  },
];

export type ForecastScenario = "base" | "conservative" | "optimistic";

export type ForecastWeek = {
  week: string;
  inflows: number;
  outflows: number;
  balance: number;
};

const weekStarts = [
  "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9", "Nov 16",
  "Nov 23", "Nov 30", "Dec 7", "Dec 14", "Dec 21", "Dec 28",
];

/** Base weekly inflow/outflow profile (USD); payroll weeks spike outflows. */
const baseInflows = [612, 548, 590, 702, 655, 580, 610, 498, 720, 664, 640, 512, 760].map((v) => v * 1000);
const baseOutflows = [410, 690, 395, 470, 705, 420, 455, 680, 430, 712, 440, 610, 690].map((v) => v * 1000);

const scenarioFactors: Record<ForecastScenario, { inflow: number; outflow: number }> = {
  base: { inflow: 1, outflow: 1 },
  conservative: { inflow: 0.86, outflow: 1.06 },
  optimistic: { inflow: 1.12, outflow: 0.97 },
};

export const forecastOpeningBalance = 4_218_540.32;

export function scenarioFactor(scenario: ForecastScenario, direction: "inflow" | "outflow") {
  return scenarioFactors[scenario][direction];
}

/**
 * Projects 13 weeks of cash. `excluded` removes the weekly amount of
 * assumptions the user has switched off from every week.
 */
export function buildForecast(scenario: ForecastScenario, excluded: ForecastAssumption[] = []): ForecastWeek[] {
  const { inflow, outflow } = scenarioFactors[scenario];
  const removed = (direction: ForecastAssumption["direction"]) =>
    excluded.filter((a) => a.direction === direction).reduce((sum, a) => sum + a.weekly, 0);
  const removedIn = removed("inflow");
  const removedOut = removed("outflow");
  let balance = forecastOpeningBalance;
  return weekStarts.map((week, index) => {
    const inflows = Math.max(0, Math.round((baseInflows[index] - removedIn) * inflow));
    const outflows = Math.max(0, Math.round((baseOutflows[index] - removedOut) * outflow));
    balance += inflows - outflows;
    return { week, inflows, outflows, balance };
  });
}

export type ForecastAssumption = {
  id: string;
  category: string;
  direction: "inflow" | "outflow";
  driver: string;
  weekly: number;
  growth: number;
  source: string;
};

export const forecastAssumptions: ForecastAssumption[] = [
  { id: "fa_1", category: "Customer receipts", direction: "inflow", driver: "Trailing 90-day collections", weekly: 512_400, growth: 0.04, source: "Stripe" },
  { id: "fa_2", category: "Interest income", direction: "inflow", driver: "4.12% yield on invested balance", weekly: 4_210, growth: 0, source: "Ramp Treasury" },
  { id: "fa_3", category: "Other receipts", direction: "inflow", driver: "Manual estimate", weekly: 98_000, growth: 0.01, source: "Manual" },
  { id: "fa_4", category: "Payroll", direction: "outflow", driver: "Bi-weekly run, 64 employees", weekly: 244_800, growth: 0.02, source: "Gusto" },
  { id: "fa_5", category: "Bill payments", direction: "outflow", driver: "Scheduled bills + 6-week average", weekly: 136_250, growth: 0.03, source: "Ramp Bill Pay" },
  { id: "fa_6", category: "Card spend", direction: "outflow", driver: "Card limits utilization (78%)", weekly: 61_320, growth: 0.05, source: "Ramp Card" },
  { id: "fa_7", category: "Rent", direction: "outflow", driver: "Lease schedule, Austin and New York", weekly: 21_400, growth: 0, source: "Manual" },
  { id: "fa_8", category: "Taxes", direction: "outflow", driver: "Quarterly estimate due Dec 15", weekly: 18_900, growth: 0, source: "Manual" },
];

export type TreasuryDocumentType = "Monthly statement" | "Interest summary" | "1099-INT" | "Trade confirmation";

export type TreasuryDocument = {
  id: string;
  title: string;
  period: string;
  year: number;
  account: string;
  type: TreasuryDocumentType;
  issued: string;
  size: string;
};

const statementAccounts = ["Business Account", "Investment Account", "Operations Account", "Payroll Account"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function statementDocs(): TreasuryDocument[] {
  const docs: TreasuryDocument[] = [];
  // Statements are issued on the 1st for the previous month; most recent first.
  for (const year of [2026, 2025]) {
    const lastMonth = year === 2026 ? 8 : 11;
    for (let month = lastMonth; month >= 0; month -= 1) {
      const issuedMonth = month === 11 ? 1 : month + 2;
      const issuedYear = month === 11 ? year + 1 : year;
      const issued = `${issuedYear}-${String(issuedMonth).padStart(2, "0")}-01`;
      statementAccounts.forEach((account, index) => {
        if (year === 2025 && month < 6 && index > 1) return;
        docs.push({
          id: `doc_${year}_${month}_${index}`,
          title: `${months[month]} ${year} statement`,
          period: `${months[month].slice(0, 3)} ${year}`,
          year,
          account,
          type: "Monthly statement",
          issued,
          size: `${(120 + ((month * 7 + index * 13) % 90)).toString()} KB`,
        });
      });
      if (month % 3 === 2) {
        docs.push({
          id: `doc_${year}_${month}_int`,
          title: `Q${(month + 1) / 3} ${year} interest summary`,
          period: `Q${(month + 1) / 3} ${year}`,
          year,
          account: "Investment Account",
          type: "Interest summary",
          issued,
          size: "64 KB",
        });
      }
    }
  }
  docs.push({
    id: "doc_2025_1099",
    title: "Form 1099-INT (2025)",
    period: "Tax year 2025",
    year: 2025,
    account: "Investment Account",
    type: "1099-INT",
    issued: "2026-01-31",
    size: "88 KB",
  });
  docs.push({
    id: "doc_2026_trade",
    title: "Treasury bill purchase confirmation",
    period: "Sep 2026",
    year: 2026,
    account: "Investment Account",
    type: "Trade confirmation",
    issued: "2026-09-18",
    size: "42 KB",
  });
  return docs.sort((a, b) => b.issued.localeCompare(a.issued));
}

export const treasuryDocuments: TreasuryDocument[] = statementDocs();
