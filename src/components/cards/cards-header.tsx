"use client";

import { MoreVertical } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { MenuItem, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useCards } from "./cards-store";
import { CreateFundDialog } from "./create-fund-dialog";
import { IssueCardButtonFallback, IssueCardLauncher } from "./issue-card-dialog";

/** Title, actions and tabs for Funds & cards. */
export function CardsHeader() {
  const pathname = usePathname();
  const toast = useToast();
  const { cards, funds } = useCards();
  const [fundOpen, setFundOpen] = useState(false);
  const onFunds = pathname === "/cards/funds";

  return (
    <>
      <PageHeader
        eyebrow="Funds & cards"
        title={onFunds ? "Funds" : "Cards"}
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
                  <MenuItem onSelect={() => { close(); toast.show("Card export started. We'll email you the CSV.", "neutral"); }}>
                    Export cards
                  </MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show("Default card settings saved", "neutral"); }}>
                    Default card settings
                  </MenuItem>
                  <MenuItem onSelect={close}>Card designs</MenuItem>
                </>
              )}
            </Popover>
            {onFunds ? (
              <>
                <Button size="lg" onClick={() => toast.show("Request link copied. Employees can now request funds.", "neutral")}>
                  Share request link
                </Button>
                <Button size="lg" variant="primary" onClick={() => setFundOpen(true)}>
                  Create fund
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => toast.show("Bulk order started: 3 physical cards to Austin, TX", "neutral")}>
                  Order physical cards
                </Button>
                <Suspense fallback={<IssueCardButtonFallback />}>
                  <IssueCardLauncher />
                </Suspense>
              </>
            )}
          </>
        }
      />
      <Tabs
        className="mt-7"
        items={[
          { label: "Cards", href: "/cards", count: cards.filter((c) => c.status !== "terminated").length },
          { label: "Funds", href: "/cards/funds", count: funds.filter((f) => f.status !== "expired").length },
        ]}
      />
      <CreateFundDialog open={fundOpen} onClose={() => setFundOpen(false)} />
    </>
  );
}
