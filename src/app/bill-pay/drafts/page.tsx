import { BillsTable } from "@/components/bill-pay/bills-table";

export const metadata = { title: "Drafts · Bill Pay" };

export default async function Page({ searchParams }: PageProps<"/bill-pay/drafts">) {
  const { bill } = await searchParams;
  return <BillsTable stage="draft" initialBillId={typeof bill === "string" ? bill : undefined} />;
}
