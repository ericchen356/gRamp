import { Suspense } from "react";
import { BillPayHeader } from "@/components/bill-pay/bill-pay-header";
import { BillsProvider } from "@/components/bill-pay/bills-store";
import { NewBillDialog } from "@/components/bill-pay/new-bill-dialog";

export default function BillPayLayout({ children }: LayoutProps<"/bill-pay">) {
  return (
    <BillsProvider>
      <div className="flex min-h-screen flex-col">
        <BillPayHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
      <Suspense fallback={null}>
        <NewBillDialog />
      </Suspense>
    </BillsProvider>
  );
}
