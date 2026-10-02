import type { LedgerRowBase, LedgerStatus } from "@/data/ledgers";
import type { CodingField } from "./ledger-types";

export function statusLabel(config: { waitingLabel: string }, status: LedgerStatus) {
  switch (status) {
    case "needs_review":
      return "Needs review";
    case "ready_to_sync":
      return "Ready to sync";
    case "waiting":
      return config.waitingLabel;
    case "synced":
      return "Synced";
  }
}

/** Required coding fields that are still empty (they block "Mark ready"). */
export function missingCoding(row: LedgerRowBase, coding: CodingField[]) {
  return coding.filter((field) => field.required && !row.coding[field.key]);
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
