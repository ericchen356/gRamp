import { notFound } from "next/navigation";
import { isStatusSlug, statusSlugs } from "@/components/accounting-ledgers/ledger-types";
import { LedgerView } from "@/components/accounting-ledgers/ledger-views";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(statusSlugs).map((tab) => ({ tab }));
}

export default async function TreasuryTabPage({ params }: PageProps<"/accounting/treasury/[tab]">) {
  const { tab } = await params;
  if (!isStatusSlug(tab)) notFound();
  return <LedgerView ledger="treasury" status={statusSlugs[tab]} />;
}
