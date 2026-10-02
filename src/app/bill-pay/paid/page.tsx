import { BillsTable } from "@/components/bill-pay/bills-table";

export const metadata = { title: "Paid · Bill Pay" };

export default async function Page({ searchParams }: PageProps<"/bill-pay/paid">) {
  const { bill } = await searchParams;
  return <BillsTable stage="paid" initialBillId={typeof bill === "string" ? bill : undefined} />;
}
