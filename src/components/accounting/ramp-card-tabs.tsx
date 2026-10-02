"use client";

import { Tabs } from "@/components/ui/tabs";
import { useAccounting } from "./accounting-store";

export function RampCardTabs() {
  const { counts } = useAccounting();
  return (
    <Tabs
      className="mt-7"
      items={[
        { label: "Overview", href: "/accounting/ramp-card", count: counts.overview },
        { label: "Needs review", href: "/accounting/ramp-card/needs-review", count: counts.needs_review },
        { label: "Ready to sync", href: "/accounting/ramp-card/ready-to-sync", count: counts.ready_to_sync },
        {
          label: "Waiting for cardholder",
          href: "/accounting/ramp-card/waiting",
          count: counts.waiting,
          separatorBefore: true,
        },
      ]}
    />
  );
}
