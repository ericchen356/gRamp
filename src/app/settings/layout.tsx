import { SettingsNav } from "@/components/settings/settings-shell";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: { default: "Settings", template: "%s · Settings | Ramp" } };

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Settings" />
      <div className="mt-8 flex flex-1 gap-16 border-t border-line px-page pt-10 pb-24">
        <SettingsNav />
        <div className="max-w-[920px] min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
