"use client";

import { ChevronDown, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { currentUser } from "@/data/people";

export function HomeHeader() {
  const toast = useToast();
  const router = useRouter();
  const firstName = currentUser.name.split(" ")[0];

  return (
    <PageHeader
      eyebrow="Efficient App"
      title={`Good afternoon, ${firstName}`}
      actions={
        <>
          <Button size="lg" onClick={() => toast.show("Drag sections to rearrange your Home", "neutral")}>
            <Settings2 className="size-4 stroke-[1.5]" />
            Customize
          </Button>
          <Popover
            align="end"
            trigger={({ toggle }) => (
              <Button size="lg" variant="primary" onClick={toggle} className="gap-2.5 pr-3.5">
                New
                <ChevronDown className="size-4 stroke-[1.5]" />
              </Button>
            )}
          >
            {(close) => (
              <>
                <MenuItem onSelect={() => { close(); router.push("/cards"); }}>Card</MenuItem>
                <MenuItem onSelect={() => { close(); router.push("/bill-pay"); }}>Bill</MenuItem>
                <MenuItem onSelect={() => { close(); router.push("/my-ramp?new=reimbursement"); }}>Reimbursement</MenuItem>
                <MenuItem onSelect={() => { close(); router.push("/spend-programs"); }}>Spend program</MenuItem>
                <MenuDivider />
                <MenuItem onSelect={() => { close(); toast.show("Invite link copied to clipboard", "neutral"); }}>Invite people</MenuItem>
              </>
            )}
          </Popover>
        </>
      }
    />
  );
}
