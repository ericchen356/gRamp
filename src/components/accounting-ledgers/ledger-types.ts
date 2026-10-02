import type { ReactNode } from "react";
import type { LedgerRowBase, LedgerStatus } from "@/data/ledgers";
import type { LedgerStoreApi } from "./ledger-store";

export type LedgerKey = "reimbursements" | "payments" | "treasury";

/** Tab slug ↔ status. The Overview tab has no slug. */
export const statusSlugs = {
  "needs-review": "needs_review",
  "ready-to-sync": "ready_to_sync",
  waiting: "waiting",
} as const satisfies Record<string, LedgerStatus>;

export type StatusSlug = keyof typeof statusSlugs;

export function isStatusSlug(value: string): value is StatusSlug {
  return value in statusSlugs;
}

export type LedgerColumn<R> = {
  id: string;
  header: string;
  width: number;
  align?: "left" | "right" | "center";
  className?: string;
  render: (row: R) => ReactNode;
};

/** An editable accounting field rendered as a cell Select. */
export type CodingField = {
  key: string;
  header: string;
  /** Short label used in the drawer and toasts ("GL account"). */
  label: string;
  width: number;
  options: string[];
  placeholder: string;
  /** Required before a row can be marked ready. */
  required?: boolean;
};

export type WaitingState = {
  tag: string;
  /** Inline follow-up link, e.g. "Remind". */
  action?: { label: string; message: string };
};

export type LedgerConfig<R extends LedgerRowBase> = {
  key: LedgerKey;
  title: string;
  basePath: string;
  noun: { one: string; other: string };
  /** Label of the fourth tab and locked filter ("Waiting for employee"). */
  waitingLabel: string;
  syncTarget: string;
  minWidth: number;
  /** Sticky identity column after the checkbox. */
  primary: { header: string; width: number; render: (row: R) => ReactNode };
  columns: LedgerColumn<R>[];
  coding: CodingField[];
  search: (row: R) => string;
  waiting: (row: R) => WaitingState;
  drawer: {
    title: string;
    identity: (row: R) => ReactNode;
    /** Line under the big amount ("Oct 1, 2026 · Mileage · 42.6 mi"). */
    subtitle: (row: R) => ReactNode;
    details: (row: R) => { label: string; value: ReactNode }[];
  };
  store: LedgerStoreApi<R>;
};
