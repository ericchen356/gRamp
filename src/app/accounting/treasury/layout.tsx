import { LedgerShell } from "@/components/accounting-ledgers/ledger-views";

export const metadata = { title: "Treasury · Accounting" };

export default function TreasuryLedgerLayout({ children }: LayoutProps<"/accounting/treasury">) {
  return <LedgerShell ledger="treasury">{children}</LedgerShell>;
}
