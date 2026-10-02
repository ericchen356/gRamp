"use client";

import { ChevronDown, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, IconButton } from "@/components/ui/button";
import { MenuItem, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { migrationSummary } from "@/data/vendors";

/**
 * Header + tabs shared by Vendors › Overview, Renewals and Migrate payments.
 * `newVendorHref` (optional) makes "New vendor" navigate, e.g. to `/vendors?new=1`.
 */
export function VendorsHeader({ newVendorHref }: { newVendorHref?: string } = {}) {
  const router = useRouter();
  return (
    <>
      <PageHeader
        eyebrow="Vendors"
        title="Overview"
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
                  <MenuItem onSelect={close}>Import vendors</MenuItem>
                  <MenuItem onSelect={close}>Export vendor list</MenuItem>
                  <MenuItem onSelect={close}>Vendor settings</MenuItem>
                </>
              )}
            </Popover>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <Button size="lg" onClick={toggle} className="gap-3 pr-3.5">
                  Download 1099 vendors for
                  <ChevronDown className="size-4 stroke-[1.5]" />
                </Button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={close}>2026 tax year</MenuItem>
                  <MenuItem onSelect={close}>2025 tax year</MenuItem>
                  <MenuItem onSelect={close}>2024 tax year</MenuItem>
                </>
              )}
            </Popover>
            <Button
              size="lg"
              variant="primary"
              onClick={newVendorHref ? () => router.push(newVendorHref, { scroll: false }) : undefined}
            >
              New vendor
            </Button>
          </>
        }
      />
      <Tabs
        bordered={false}
        className="mt-[30px] gap-4"
        items={[
          { label: "Overview", href: "/vendors" },
          { label: "Renewals", href: "/vendors/renewals" },
          { label: "Migrate payments", href: "/vendors/migrate", count: migrationSummary.pending, countTone: "limeStrong" },
        ]}
      />
    </>
  );
}
