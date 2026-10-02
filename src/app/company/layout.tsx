import { Suspense } from "react";
import { CompanyHeader } from "@/components/company/company-header";
import { CompanyProvider } from "@/components/company/company-store";
import { InviteDialog } from "@/components/company/invite-dialog";

export const metadata = { title: { default: "People · Company", template: "%s · Company | Ramp" } };

export default function CompanyLayout({ children }: LayoutProps<"/company">) {
  return (
    <CompanyProvider>
      <div className="flex min-h-screen flex-col">
        <CompanyHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
      <Suspense fallback={null}>
        <InviteDialog />
      </Suspense>
    </CompanyProvider>
  );
}
