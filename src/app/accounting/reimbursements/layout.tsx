import { LedgerShell } from "@/components/accounting-ledgers/ledger-views";

export const metadata = { title: "Reimbursements · Accounting" };

export default function ReimbursementsLedgerLayout({ children }: LayoutProps<"/accounting/reimbursements">) {
  return <LedgerShell ledger="reimbursements">{children}</LedgerShell>;
}
