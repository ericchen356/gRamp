export type InsightKind = "pricing" | "increase" | "duplicate";

export type Insight = {
  id: string;
  kind: InsightKind;
  title: string;
  description: string;
  metricLabel: string;
  /** Annual savings in dollars, or a percentage for spend increases. */
  metric: number;
  merchant: string;
  isNew?: boolean;
  /** Toast shown when the recommendation is accepted. */
  acceptMessage: string;
};

export const insights: Insight[] = [
  {
    id: "ins_dropbox",
    kind: "pricing",
    title: "Better pricing available",
    description: "Lower your annual cost for Dropbox by switching to an annual plan.",
    metricLabel: "Potential Savings",
    metric: 2345,
    merchant: "Dropbox",
    isNew: true,
    acceptMessage: "Dropbox switch to annual plan requested",
  },
  {
    id: "ins_zendesk",
    kind: "increase",
    title: "Monthly spend increase",
    description:
      "Your spending on Zendesk, Inc. has gone up significantly. Make sure you’re not overspending.",
    metricLabel: "Monthly Change",
    metric: 29,
    merchant: "Zendesk, Inc.",
    isNew: true,
    acceptMessage: "Zendesk, Inc. added to your watchlist",
  },
  {
    id: "ins_office",
    kind: "duplicate",
    title: "Duplicate subscription",
    description:
      "More than one user is paying for Microsoft Office. Save money by canceling duplicate subscriptions.",
    metricLabel: "Potential Savings",
    metric: 310,
    merchant: "Microsoft Office",
    acceptMessage: "Cardholders notified about duplicate Microsoft Office seats",
  },
];

export const totalSavingsIdentified = 83345;

export type PastInsight = {
  id: string;
  title: string;
  merchant: string;
  detail: string;
  date: string;
  outcome: "accepted" | "dismissed";
  savings?: number;
};

export const previousInsights: PastInsight[] = [
  { id: "pi_1", title: "Better pricing available", merchant: "Slack", detail: "Switched 42 seats to annual billing", date: "2026-09-18", outcome: "accepted", savings: 6720 },
  { id: "pi_2", title: "Unused licenses", merchant: "Figma", detail: "Removed 6 inactive editor seats", date: "2026-09-04", outcome: "accepted", savings: 3240 },
  { id: "pi_3", title: "Duplicate subscription", merchant: "Notion", detail: "Consolidated 3 personal plans into the team workspace", date: "2026-08-27", outcome: "accepted", savings: 1152 },
  { id: "pi_4", title: "Monthly spend increase", merchant: "Amazon Web Services", detail: "Spend up 18% month over month", date: "2026-08-12", outcome: "dismissed" },
  { id: "pi_5", title: "Better pricing available", merchant: "HubSpot", detail: "Negotiated renewal at 22% below list", date: "2026-07-30", outcome: "accepted", savings: 14400 },
  { id: "pi_6", title: "Price increase detected", merchant: "Salesforce", detail: "Renewal quote 9% above benchmark", date: "2026-07-11", outcome: "accepted", savings: 11250 },
  { id: "pi_7", title: "Duplicate subscription", merchant: "Zoom", detail: "Two Business plans across Sales and Marketing", date: "2026-06-23", outcome: "dismissed" },
];

/* ---------------------------------------------------------------- spend --- */

export type DailySpend = {
  day: number;
  /** Spend on this day of the selected month (undefined after today). */
  current?: number;
  /** Spend on the same day of the prior month. */
  previous: number;
};

/** Deterministic pseudo-random sequence so server and client render the same chart. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Daily amounts for `days` days that sum exactly to `total` (cents-accurate). */
function dailySeries(days: number, total: number, seed: number, firstWeekday: number) {
  const random = seeded(seed);
  const weights = Array.from({ length: days }, (_, index) => {
    const weekday = (firstWeekday + index) % 7;
    const weekend = weekday === 0 || weekday === 6;
    const monthStartBump = index < 3 ? 1.6 : 1; // rent + annual renewals land early
    return (weekend ? 0.35 : 1) * monthStartBump * (0.7 + random() * 0.6);
  });
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  const amounts = weights.map((weight) => Math.round((weight / sum) * total * 100) / 100);
  const drift = Math.round((total - amounts.reduce((acc, value) => acc + value, 0)) * 100) / 100;
  amounts[amounts.length - 1] = Math.round((amounts[amounts.length - 1] + drift) * 100) / 100;
  return amounts;
}

export const months = [
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
] as const;
export type Month = (typeof months)[number];

export const thisMonthSpend = 350385.56;
export const thisMonthCashback = 5385.56;

type MonthProfile = { days: number; firstWeekday: number; elapsed: number; total: number; previousTotal: number; cashback: number };

/** Month-to-date profile per selectable month (2026 calendar). */
const monthProfiles: Record<Month, MonthProfile> = {
  June: { days: 30, firstWeekday: 1, elapsed: 30, total: 702118.4, previousTotal: 688402.13, cashback: 10531.78 },
  July: { days: 31, firstWeekday: 3, elapsed: 31, total: 744903.27, previousTotal: 702118.4, cashback: 11173.55 },
  August: { days: 31, firstWeekday: 6, elapsed: 31, total: 768250.92, previousTotal: 744903.27, cashback: 11523.76 },
  September: { days: 30, firstWeekday: 2, elapsed: 30, total: 791674.05, previousTotal: 768250.92, cashback: 11875.11 },
  October: { days: 31, firstWeekday: 4, elapsed: 31, total: 812406.38, previousTotal: 791674.05, cashback: 12186.1 },
  November: { days: 30, firstWeekday: 0, elapsed: 14, total: thisMonthSpend, previousTotal: 812406.38, cashback: thisMonthCashback },
};

export function monthSummary(month: Month) {
  const profile = monthProfiles[month];
  return { spend: profile.total, cashback: profile.cashback, partial: profile.elapsed < profile.days };
}

export function spendSeries(month: Month): DailySpend[] {
  const profile = monthProfiles[month];
  const index = months.indexOf(month);
  const current = dailySeries(profile.elapsed, profile.total, 11 + index * 7, profile.firstWeekday);
  const previous = dailySeries(profile.days, profile.previousTotal, 5 + index * 13, (profile.firstWeekday + 5) % 7);
  return Array.from({ length: profile.days }, (_, day) => ({
    day: day + 1,
    current: current[day],
    previous: previous[day],
  }));
}

/* ------------------------------------------------------------ breakdown --- */

export type MerchantSpend = {
  merchant: string;
  category: string;
  transactions: number;
  amount: number;
  /** Month-over-month change in percent. */
  change: number;
  owner: string;
};

export const topMerchants: MerchantSpend[] = [
  { merchant: "Amazon Web Services", category: "Cloud Infrastructure", transactions: 4, amount: 68420.66, change: 12, owner: "Hannah Okafor" },
  { merchant: "WeWork", category: "Rent", transactions: 2, amount: 42000, change: 0, owner: "Liam Novak" },
  { merchant: "Salesforce", category: "SaaS / Software", transactions: 1, amount: 37500, change: 9, owner: "Sofia Alvarez" },
  { merchant: "United Airlines", category: "Airlines", transactions: 18, amount: 24318.9, change: 41, owner: "Diego Santos" },
  { merchant: "Google Ads", category: "Advertising", transactions: 6, amount: 21650, change: -8, owner: "Marcus Hale" },
  { merchant: "Datadog", category: "SaaS / Software", transactions: 1, amount: 18310.45, change: 4, owner: "Hannah Okafor" },
  { merchant: "Zendesk, Inc.", category: "SaaS / Software", transactions: 3, amount: 14820, change: 29, owner: "Jordan Lee" },
  { merchant: "Marriott", category: "Lodging", transactions: 11, amount: 12904.32, change: 17, owner: "Jordan Lee" },
  { merchant: "HubSpot", category: "SaaS / Software", transactions: 1, amount: 9800, change: 0, owner: "Marcus Hale" },
  { merchant: "Slack", category: "SaaS / Software", transactions: 1, amount: 8750, change: -3, owner: "Alexander Bass" },
  { merchant: "Dropbox", category: "SaaS / Software", transactions: 2, amount: 6120, change: 0, owner: "Liam Novak" },
  { merchant: "Microsoft Office", category: "SaaS / Software", transactions: 5, amount: 3960, change: 22, owner: "Ava Thompson" },
];

export type CategorySpend = {
  category: string;
  merchants: number;
  transactions: number;
  amount: number;
  change: number;
  budget: number;
};

export const topCategories: CategorySpend[] = [
  { category: "SaaS / Software", merchants: 38, transactions: 112, amount: 118402.77, change: 6, budget: 140000 },
  { category: "Cloud Infrastructure", merchants: 4, transactions: 9, amount: 74210.18, change: 12, budget: 80000 },
  { category: "Rent", merchants: 2, transactions: 3, amount: 46200, change: 0, budget: 46200 },
  { category: "Travel", merchants: 17, transactions: 96, amount: 41877.12, change: 33, budget: 35000 },
  { category: "Advertising", merchants: 5, transactions: 14, amount: 29864.4, change: -8, budget: 40000 },
  { category: "Meals & Entertainment", merchants: 46, transactions: 188, amount: 14920.36, change: 4, budget: 18000 },
  { category: "Office Supplies", merchants: 12, transactions: 41, amount: 8611.43, change: -15, budget: 12000 },
  { category: "Professional Services", merchants: 3, transactions: 4, amount: 16299.3, change: 21, budget: 20000 },
];
