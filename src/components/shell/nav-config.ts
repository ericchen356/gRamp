import {
  Award,
  BookOpen,
  Building2,
  ChartNoAxesColumn,
  CircleDollarSign,
  CircleHelp,
  FilePenLine,
  House,
  Inbox,
  PanelTop,
  ReceiptText,
  Settings,
  ShoppingCart,
  Store,
  TrendingUp,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type NavChild = {
  label: string;
  href: string;
  count?: number;
  tag?: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
  /** Sub-pages shown when the group is active. */
  children?: NavChild[];
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/home", icon: House },
  { label: "Inbox", href: "/inbox", icon: Inbox, count: 167 },
  { label: "Insights", href: "/insights", icon: ChartNoAxesColumn },
  { label: "My Ramp", href: "/my-ramp", icon: PanelTop, count: 2 },
  { label: "Expenses & travel", href: "/expenses", icon: CircleDollarSign },
  { label: "Funds & cards", href: "/cards", icon: WalletCards },
  { label: "Spend programs", href: "/spend-programs", icon: FilePenLine },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart },
  { label: "Bill Pay", href: "/bill-pay", icon: ReceiptText },
  {
    label: "Accounting",
    href: "/accounting",
    icon: BookOpen,
    children: [
      { label: "Ramp Card", href: "/accounting/ramp-card", count: 279 },
      { label: "Reimbursements", href: "/accounting/reimbursements", count: 36 },
      { label: "Payments", href: "/accounting/payments", count: 7 },
      { label: "Treasury", href: "/accounting/treasury", count: 15 },
    ],
  },
  { label: "Treasury", href: "/treasury", icon: TrendingUp },
  { label: "Company", href: "/company", icon: Building2, count: 1 },
  {
    label: "Vendors",
    href: "/vendors",
    icon: Store,
    children: [
      { label: "Overview", href: "/vendors" },
      { label: "Price Intelligence", href: "/vendors/price-intelligence" },
      { label: "Seat Intelligence", href: "/vendors/seat-intelligence", tag: "Beta" },
    ],
  },
];

export const secondaryNav: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Refer & earn", href: "/refer", icon: Award },
  { label: "Help", href: "/help", icon: CircleHelp },
  { label: "Assistant mode", href: "/assistant", icon: UsersRound },
];

/** True when `pathname` is `href` or nested below it. */
export function isActivePath(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The most specific child whose href contains `pathname` (longest prefix wins). */
export function activeChildHref(pathname: string, children: NavChild[]) {
  return children
    .filter((child) => isActivePath(pathname, child.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
