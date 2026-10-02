export type CardType = "physical" | "virtual";
export type CardStatus = "active" | "locked" | "not_activated" | "terminated";
export type CardFrequency = "Monthly" | "Quarterly" | "Yearly" | "One-time";

export type RampCard = {
  id: string;
  name: string;
  last4: string;
  cardholder: string;
  type: CardType;
  limit: number;
  spent: number;
  frequency: CardFrequency;
  status: CardStatus;
  /** Spend program the card was issued from. */
  program?: string;
  expires: string;
  issued: string;
  /** Merchant categories the card can be used at; omitted = all. */
  allowedCategories?: string[];
};

export const cards: RampCard[] = [
  { id: "card_0042", name: "Software subscriptions", last4: "0042", cardholder: "Alexander Bass", type: "virtual", limit: 15000, spent: 9842.18, frequency: "Monthly", status: "active", program: "Software subscriptions", expires: "08/29", issued: "2025-08-14", allowedCategories: ["SaaS / Software", "Cloud Infrastructure"] },
  { id: "card_4412", name: "Google Domains card", last4: "4412", cardholder: "Alexander Bass", type: "virtual", limit: 1000, spent: 412.0, frequency: "Monthly", status: "active", program: "Software subscriptions", expires: "03/29", issued: "2026-03-02", allowedCategories: ["SaaS / Software"] },
  { id: "card_9930", name: "Engineering infrastructure", last4: "9930", cardholder: "Hannah Okafor", type: "virtual", limit: 25000, spent: 18942.4, frequency: "Monthly", status: "active", program: "Software subscriptions", expires: "11/28", issued: "2025-11-20", allowedCategories: ["Cloud Infrastructure", "SaaS / Software"] },
  { id: "card_7783", name: "Operations", last4: "7783", cardholder: "Liam Novak", type: "physical", limit: 10000, spent: 5207.6, frequency: "Monthly", status: "active", program: "Office supplies", expires: "06/29", issued: "2025-06-03" },
  { id: "card_6604", name: "Sales travel", last4: "6604", cardholder: "Sofia Alvarez", type: "physical", limit: 8000, spent: 4768.72, frequency: "Monthly", status: "active", program: "Travel", expires: "01/29", issued: "2025-01-12", allowedCategories: ["Airlines", "Lodging", "Rideshare", "Restaurants"] },
  { id: "card_4021", name: "Marketing tools", last4: "4021", cardholder: "Marcus Hale", type: "virtual", limit: 5000, spent: 1848.21, frequency: "Monthly", status: "active", program: "Marketing events", expires: "02/29", issued: "2025-02-27" },
  { id: "card_3317", name: "Jordan's travel card", last4: "3317", cardholder: "Jordan Lee", type: "physical", limit: 4000, spent: 3833.69, frequency: "Monthly", status: "active", program: "Travel", expires: "09/28", issued: "2025-09-08", allowedCategories: ["Airlines", "Lodging", "Rideshare", "Fuel and Gas", "Restaurants"] },
  { id: "card_8812", name: "Field sales", last4: "8812", cardholder: "Diego Santos", type: "physical", limit: 4000, spent: 1155.18, frequency: "Monthly", status: "active", program: "Travel", expires: "04/29", issued: "2026-04-18" },
  { id: "card_1190", name: "Office supplies", last4: "1190", cardholder: "Ava Thompson", type: "physical", limit: 2500, spent: 253.51, frequency: "Monthly", status: "active", program: "Office supplies", expires: "07/29", issued: "2025-07-21", allowedCategories: ["General Merchandise", "Hardware", "Shipping"] },
  { id: "card_2208", name: "Design tools", last4: "2208", cardholder: "Noah Kim", type: "virtual", limit: 1500, spent: 899.88, frequency: "Monthly", status: "active", program: "Software subscriptions", expires: "10/28", issued: "2025-10-01", allowedCategories: ["SaaS / Software"] },
  { id: "card_6121", name: "AI tools", last4: "6121", cardholder: "Ethan Park", type: "virtual", limit: 2500, spent: 1820.0, frequency: "Monthly", status: "active", program: "Software subscriptions", expires: "05/29", issued: "2026-05-11", allowedCategories: ["SaaS / Software"] },
  { id: "card_5520", name: "Growth experiments", last4: "5520", cardholder: "Priya Raman", type: "virtual", limit: 3000, spent: 174.0, frequency: "Monthly", status: "active", program: "Marketing events", expires: "12/28", issued: "2025-12-04" },
  { id: "card_2290", name: "Customer Summit 2026", last4: "2290", cardholder: "Marcus Hale", type: "virtual", limit: 12000, spent: 7340.5, frequency: "One-time", status: "active", program: "Marketing events", expires: "12/26", issued: "2026-07-15" },
  { id: "card_3398", name: "Tina's card", last4: "3398", cardholder: "Tina Cruz", type: "physical", limit: 5000, spent: 612.4, frequency: "Monthly", status: "active", expires: "08/28", issued: "2025-08-30" },
  { id: "card_1450", name: "Recruiting events", last4: "1450", cardholder: "Grace Whitfield", type: "physical", limit: 1000, spent: 18.45, frequency: "Monthly", status: "locked", program: "Meals", expires: "03/28", issued: "2025-03-16" },
  { id: "card_5571", name: "Accounting software", last4: "5571", cardholder: "Mia Chen", type: "virtual", limit: 800, spent: 0, frequency: "Monthly", status: "not_activated", program: "Software subscriptions", expires: "09/29", issued: "2026-09-29" },
  { id: "card_7350", name: "Team lunches", last4: "7350", cardholder: "Ava Thompson", type: "physical", limit: 1500, spent: 642.15, frequency: "Monthly", status: "active", program: "Meals", expires: "06/28", issued: "2025-06-09", allowedCategories: ["Restaurants"] },
  { id: "card_8045", name: "Q4 offsite", last4: "8045", cardholder: "Liam Novak", type: "virtual", limit: 20000, spent: 0, frequency: "One-time", status: "not_activated", expires: "01/27", issued: "2026-09-30" },
];

export const cardStatusLabels: Record<CardStatus, string> = {
  active: "Active",
  locked: "Locked",
  not_activated: "Not activated",
  terminated: "Terminated",
};

/** Merchant category controls shown on the card detail page. */
export const merchantCategories = [
  { id: "SaaS / Software", description: "Subscriptions, licenses and developer tools" },
  { id: "Cloud Infrastructure", description: "Hosting, compute and storage providers" },
  { id: "Airlines", description: "Flights and airline fees" },
  { id: "Lodging", description: "Hotels and short-term rentals" },
  { id: "Rideshare", description: "Uber, Lyft and taxis" },
  { id: "Restaurants", description: "Meals, coffee and food delivery" },
  { id: "General Merchandise", description: "Retail and online marketplaces" },
  { id: "Advertising", description: "Paid social, search and display" },
  { id: "Gambling", description: "Casinos, lotteries and betting" },
];

export type Fund = {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: string[];
  spent: number;
  limit: number;
  period: CardFrequency;
  resets?: string;
  status: "active" | "paused" | "expired";
};

export const funds: Fund[] = [
  { id: "fund_mkt_events", name: "Q4 marketing events", description: "Booths, sponsorships and swag for Q4 field events", owner: "Marcus Hale", members: ["Marcus Hale", "Priya Raman", "Grace Whitfield"], spent: 18420.55, limit: 40000, period: "Quarterly", resets: "2027-01-01", status: "active" },
  { id: "fund_eng_offsite", name: "Engineering offsite", description: "Lodging, meals and activities for the Nov offsite in Austin", owner: "Hannah Okafor", members: ["Hannah Okafor", "Ethan Park", "Noah Kim", "Alexander Bass"], spent: 6210.0, limit: 25000, period: "One-time", status: "active" },
  { id: "fund_team_meals", name: "Team meals · Austin", description: "Weekly team lunches and coffee for the Austin office", owner: "Ava Thompson", members: ["Ava Thompson", "Alexander Bass", "Tina Cruz", "Mia Chen", "Liam Novak", "Grace Whitfield"], spent: 1284.6, limit: 2000, period: "Monthly", resets: "2026-11-01", status: "active" },
  { id: "fund_sales_travel", name: "Sales travel", description: "Flights, hotels and ground transport for customer visits", owner: "Sofia Alvarez", members: ["Sofia Alvarez", "Jordan Lee", "Diego Santos"], spent: 9732.4, limit: 12000, period: "Monthly", resets: "2026-11-01", status: "active" },
  { id: "fund_software", name: "Software & tools", description: "Company-wide SaaS licenses and seat expansions", owner: "Alexander Bass", members: ["Alexander Bass", "Hannah Okafor", "Noah Kim", "Ethan Park", "Mia Chen"], spent: 31045.12, limit: 45000, period: "Monthly", resets: "2026-11-01", status: "active" },
  { id: "fund_learning", name: "Learning & development", description: "Books, courses and conference tickets", owner: "Grace Whitfield", members: ["Grace Whitfield", "Ethan Park", "Priya Raman", "Jordan Lee", "Noah Kim", "Mia Chen", "Diego Santos"], spent: 2140.0, limit: 10000, period: "Yearly", resets: "2027-01-01", status: "active" },
  { id: "fund_wfh", name: "Home office stipend", description: "One-time setup budget for new hires", owner: "Liam Novak", members: ["Liam Novak", "Grace Whitfield"], spent: 4800.0, limit: 4800, period: "Quarterly", resets: "2027-01-01", status: "paused" },
  { id: "fund_summit_25", name: "Customer Summit 2025", description: "Venue, catering and travel for the 2025 summit", owner: "Marcus Hale", members: ["Marcus Hale", "Sofia Alvarez"], spent: 48210.33, limit: 50000, period: "One-time", status: "expired" },
];
