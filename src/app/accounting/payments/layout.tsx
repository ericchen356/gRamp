import { LedgerShell } from "@/components/accounting-ledgers/ledger-views";

export const metadata = { title: "Payments · Accounting" };

export default function PaymentsLedgerLayout({ children }: LayoutProps<"/accounting/payments">) {
  return <LedgerShell ledger="payments">{children}</LedgerShell>;
}
