"use client";

import { FileSpreadsheet, MoreVertical, RefreshCw, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button, IconButton } from "@/components/ui/button";
import { MenuItem, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { entities } from "@/data/company";
import { useCompany } from "./company-store";

/** "Company" title, header actions and the route tabs shared by every Company page. */
export function CompanyHeader() {
  const { members, departments, locations } = useCompany();
  const toast = useToast();

  return (
    <>
      <PageHeader
        title="Company"
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
                  <MenuItem icon={<FileSpreadsheet />} onSelect={() => { close(); toast.show("Exporting people directory as CSV", "neutral"); }}>
                    Export directory
                  </MenuItem>
                  <MenuItem icon={<RefreshCw />} onSelect={() => { close(); toast.show("Synced 15 people from Gusto"); }}>
                    Sync from HRIS
                  </MenuItem>
                </>
              )}
            </Popover>
            <Button size="lg" onClick={() => toast.show("Upload a CSV with name, email, role and department", "neutral")}>
              Import
            </Button>
            <Link
              href="/company?invite=1"
              scroll={false}
              className="inline-flex h-10 items-center gap-2 rounded-[2px] bg-lime px-[18px] text-[15px] text-ink transition-colors hover:bg-lime-hover"
            >
              <UserPlus className="size-4 stroke-[1.5]" />
              Invite people
            </Link>
          </>
        }
      />
      <Tabs
        className="mt-7"
        items={[
          { label: "People", href: "/company", count: members.length },
          { label: "Departments", href: "/company/departments", count: departments.length },
          { label: "Locations", href: "/company/locations", count: locations.length },
          { label: "Entities", href: "/company/entities", count: entities.length },
          { label: "Approval chains", href: "/company/approvals", separatorBefore: true },
        ]}
      />
    </>
  );
}
