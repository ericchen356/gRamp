"use client";

import { MoreVertical } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button, IconButton } from "@/components/ui/button";
import { MenuItem, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { stageRoutes } from "./bill-status";
import { useBills } from "./bills-store";

/** "Bill Pay" title, upload / new bill actions and the stage tabs. */
export function BillPayHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { counts } = useBills();
  const openNew = () => router.push(`${pathname}?new=1`, { scroll: false });

  return (
    <>
      <PageHeader
        title="Bill Pay"
        actions={
          <>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <IconButton variant="bare" label="More actions" onClick={toggle} className="mr-1.5 [&_svg]:size-[18px]">
                  <MoreVertical />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={() => { close(); toast.show("Bills exported to CSV"); }}>Export bills</MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show("Inbox address copied: bills@efficient.ramp.com"); }}>
                    Copy invoice inbox address
                  </MenuItem>
                  <MenuItem onSelect={() => { close(); router.push("/vendors"); }}>Manage vendors</MenuItem>
                  <MenuItem onSelect={close}>Bill Pay settings</MenuItem>
                </>
              )}
            </Popover>
            <Button size="lg" onClick={openNew}>
              Upload invoices
            </Button>
            <Button size="lg" variant="primary" onClick={openNew}>
              New bill
            </Button>
          </>
        }
      />
      <Tabs
        className="mt-7"
        items={[
          { label: "Drafts", href: stageRoutes.draft, count: counts.draft },
          { label: "For approval", href: stageRoutes.approval, count: counts.approval },
          { label: "For payment", href: stageRoutes.payment, count: counts.payment },
          { label: "Paid", href: stageRoutes.paid, count: counts.paid, separatorBefore: true },
        ]}
      />
    </>
  );
}
