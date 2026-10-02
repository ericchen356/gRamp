import { ProcurementHeader } from "@/components/procurement/procurement-header";
import { ProcurementProvider } from "@/components/procurement/procurement-store";

export default function ProcurementLayout({ children }: LayoutProps<"/procurement">) {
  return (
    <ProcurementProvider>
      <div className="flex min-h-screen flex-col">
        <ProcurementHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </ProcurementProvider>
  );
}
