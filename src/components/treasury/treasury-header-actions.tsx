"use client";

import { ArrowLeftRight, ChevronDown, Landmark, MoreVertical, Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { TransferDialog } from "./transfer-dialog";

/** "⋮" overflow + "New ⌄" menu in the Cash & Treasury header. */
export function TreasuryHeaderActions() {
  const router = useRouter();
  const toast = useToast();
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <>
      <Popover
        align="end"
        trigger={({ toggle }) => (
          <IconButton variant="bare" label="More actions" onClick={toggle} className="mr-1 [&_svg]:size-[18px]">
            <MoreVertical />
          </IconButton>
        )}
      >
        {(close) => (
          <>
            <MenuItem
              onSelect={() => {
                close();
                router.push("/treasury/documents");
              }}
            >
              Statements & documents
            </MenuItem>
            <MenuItem
              onSelect={() => {
                close();
                toast.show("Account details copied to clipboard", "neutral");
              }}
            >
              Copy account details
            </MenuItem>
            <MenuItem
              onSelect={() => {
                close();
                router.push("/accounting/treasury");
              }}
            >
              Accounting settings
            </MenuItem>
          </>
        )}
      </Popover>
      <Popover
        align="end"
        panelClassName="min-w-[220px]"
        trigger={({ toggle, open }) => (
          <Button size="md" onClick={toggle} aria-expanded={open} className="gap-2 pr-3">
            New
            <ChevronDown className="size-4 stroke-[1.5] text-ink-2" />
          </Button>
        )}
      >
        {(close) => (
          <>
            <MenuItem
              icon={<ArrowLeftRight />}
              onSelect={() => {
                close();
                setTransferOpen(true);
              }}
            >
              Transfer funds
            </MenuItem>
            <MenuItem
              icon={<Repeat2 />}
              onSelect={() => {
                close();
                router.push("/treasury/automations?new=1");
              }}
            >
              Automated transfer
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={<Landmark />}
              onSelect={() => {
                close();
                toast.show("Application started for a new Treasury account", "neutral");
              }}
            >
              Open an account
            </MenuItem>
          </>
        )}
      </Popover>
      <TransferDialog open={transferOpen} onClose={() => setTransferOpen(false)} />
    </>
  );
}
