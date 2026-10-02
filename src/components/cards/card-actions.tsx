"use client";

import { Gauge, Lock, LockOpen, MoreHorizontal, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import type { RampCard } from "@/data/cards";
import { useCards } from "./cards-store";

/** Lock/unlock + terminate with confirmation, shared by the table row menu and the detail header. */
export function useCardActions(card: RampCard) {
  const { updateCard } = useCards();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const locked = card.status === "locked";

  const toggleLock = () => {
    updateCard(card.id, { status: locked ? "active" : "locked" });
    toast.show(locked ? `Card ···· ${card.last4} unlocked` : `Card ···· ${card.last4} locked`, locked ? "success" : "neutral");
  };

  const confirmDialog: ReactNode = (
    <Dialog open={confirming} onClose={() => setConfirming(false)} className="max-w-[440px]">
      <DialogHeader
        title="Terminate card?"
        description={`${card.name} ···· ${card.last4} will stop working immediately. Recurring charges on it will decline. This can’t be undone.`}
        onClose={() => setConfirming(false)}
      />
      <DialogFooter>
        <Button size="md" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button
          size="md"
          variant="danger"
          onClick={() => {
            updateCard(card.id, { status: "terminated" });
            setConfirming(false);
            toast.show(`Card ···· ${card.last4} terminated`, "neutral");
          }}
        >
          Terminate card
        </Button>
      </DialogFooter>
    </Dialog>
  );

  return { locked, toggleLock, terminate: () => setConfirming(true), confirmDialog };
}

/** "···" row menu on the cards table. */
export function CardRowMenu({ card, onEditLimit }: { card: RampCard; onEditLimit: () => void }) {
  const { locked, toggleLock, terminate, confirmDialog } = useCardActions(card);
  const terminated = card.status === "terminated";

  return (
    <>
      <Popover
        align="end"
        trigger={({ toggle }) => (
          <IconButton variant="bare" label={`Actions for ${card.name}`} onClick={toggle} disabled={terminated} className="disabled:opacity-40">
            <MoreHorizontal />
          </IconButton>
        )}
      >
        {(close) => (
          <>
            <MenuItem icon={locked ? <LockOpen /> : <Lock />} onSelect={() => { close(); toggleLock(); }}>
              {locked ? "Unlock card" : "Lock card"}
            </MenuItem>
            <MenuItem icon={<Gauge />} onSelect={() => { close(); onEditLimit(); }}>
              Edit limit
            </MenuItem>
            <MenuDivider />
            <MenuItem icon={<Trash2 />} destructive onSelect={() => { close(); terminate(); }}>
              Terminate
            </MenuItem>
          </>
        )}
      </Popover>
      {confirmDialog}
    </>
  );
}
