import { VendorsHeader } from "@/components/vendors/vendors-header";

export default function VendorsOverviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <VendorsHeader newVendorHref="/vendors?new=1" />
      {children}
    </div>
  );
}
