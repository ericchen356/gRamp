import { Tag } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { TreasuryHeaderActions } from "@/components/treasury/treasury-header-actions";

export const metadata = { title: { default: "Cash & Treasury", template: "%s · Cash & Treasury | Ramp" } };

export default function TreasuryLayout({ children }: LayoutProps<"/treasury">) {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader className="pt-[52px]" title="Cash & Treasury" actions={<TreasuryHeaderActions />} />
      <Tabs
        className="mt-7 gap-5"
        items={[
          { label: "Overview", href: "/treasury" },
          {
            label: "Forecast",
            href: "/treasury/forecast",
            tag: (
              <Tag tone="new" className="h-[18px] rounded-[3px] px-1.5 text-[12px]">
                New
              </Tag>
            ),
          },
          { label: "Automations", href: "/treasury/automations" },
          { label: "Documents", href: "/treasury/documents" },
        ]}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
