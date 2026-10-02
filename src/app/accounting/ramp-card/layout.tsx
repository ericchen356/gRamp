import { AccountingProvider } from "@/components/accounting/accounting-store";
import { RampCardTabs } from "@/components/accounting/ramp-card-tabs";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Ramp Card · Accounting" };

export default function RampCardLayout({ children }: LayoutProps<"/accounting/ramp-card">) {
  return (
    <AccountingProvider>
      <div className="flex min-h-screen flex-col">
        <PageHeader eyebrow="Accounting" title="Ramp Card" count={279} />
        <RampCardTabs />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </AccountingProvider>
  );
}
