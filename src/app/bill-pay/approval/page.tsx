import { BillsTable } from "@/components/bill-pay/bills-table";

export const metadata = { title: "For approval · Bill Pay" };

export default async function Page({ searchParams }: PageProps<"/bill-pay/approval">) {
  const { bill } = await searchParams;
  return <BillsTable stage="approval" initialBillId={typeof bill === "string" ? bill : undefined} />;
}
