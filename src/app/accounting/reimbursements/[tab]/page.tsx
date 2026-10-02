import { notFound } from "next/navigation";
import { isStatusSlug, statusSlugs } from "@/components/accounting-ledgers/ledger-types";
import { LedgerView } from "@/components/accounting-ledgers/ledger-views";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(statusSlugs).map((tab) => ({ tab }));
}

export default async function ReimbursementsTabPage({ params }: PageProps<"/accounting/reimbursements/[tab]">) {
  const { tab } = await params;
  if (!isStatusSlug(tab)) notFound();
  return <LedgerView ledger="reimbursements" status={statusSlugs[tab]} />;
}
