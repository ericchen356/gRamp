import { BillsTable } from "@/components/bill-pay/bills-table";

export const metadata = { title: "For payment · Bill Pay" };

export default async function Page({ searchParams }: PageProps<"/bill-pay">) {
  const { bill } = await searchParams;
  return <BillsTable stage="payment" initialBillId={typeof bill === "string" ? bill : undefined} />;
}
