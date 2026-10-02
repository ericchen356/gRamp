export type ReferralStatus = "Rewarded" | "Qualified" | "Signed up" | "Invited" | "Expired";

export type Referral = {
  id: string;
  company: string;
  contact: string;
  email: string;
  invited: string;
  status: ReferralStatus;
  /** Reward for the referrer; pending until the company spends $5,000 in 90 days. */
  reward: number;
};

export const referralLink = "ramp.com/r/efficient-app-alexander";

export const referralTerms = {
  reward: 500,
  spendThreshold: 5000,
  windowDays: 90,
};

export const referrals: Referral[] = [
  { id: "r1", company: "Northwind Labs", contact: "Dana Whitaker", email: "dana@northwindlabs.com", invited: "2026-05-12", status: "Rewarded", reward: 500 },
  { id: "r2", company: "Brightline Studio", contact: "Omar Haddad", email: "omar@brightline.studio", invited: "2026-06-03", status: "Rewarded", reward: 500 },
  { id: "r3", company: "Fieldnote Health", contact: "Lena Ortiz", email: "lena@fieldnote.health", invited: "2026-07-21", status: "Rewarded", reward: 500 },
  { id: "r4", company: "Cobalt Robotics", contact: "Sam Patel", email: "sam@cobaltrobotics.io", invited: "2026-08-30", status: "Qualified", reward: 500 },
  { id: "r5", company: "Tidewater Coffee", contact: "Jules Moreau", email: "jules@tidewater.coffee", invited: "2026-09-14", status: "Signed up", reward: 500 },
  { id: "r6", company: "Parallel Freight", contact: "Kenji Watanabe", email: "kenji@parallelfreight.com", invited: "2026-09-26", status: "Invited", reward: 500 },
  { id: "r7", company: "Lumen Analytics", contact: "Rachel Green", email: "rachel@lumen.ai", invited: "2026-02-02", status: "Expired", reward: 0 },
];

export const plusTravel = {
  cashbackRate: 0.05,
  lastQuarterTravel: 18432.6,
  partners: ["Delta", "United Airlines", "Marriott", "Hilton", "Airbnb"],
};
