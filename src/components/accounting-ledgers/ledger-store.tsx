"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { LedgerRowBase, LedgerStatus } from "@/data/ledgers";

export type LedgerCounts = Record<"overview" | LedgerStatus, number>;

export type LedgerStore<R extends LedgerRowBase> = {
  rows: R[];
  counts: LedgerCounts;
  setStatus: (ids: string[], status: LedgerStatus) => void;
  setCoding: (id: string, field: string, value: string) => void;
};

export type LedgerStoreApi<R extends LedgerRowBase> = {
  Provider: (props: { children: ReactNode }) => ReactNode;
  useLedger: () => LedgerStore<R>;
};

function tally(rows: LedgerRowBase[]): LedgerCounts {
  const counts: LedgerCounts = { overview: 0, needs_review: 0, ready_to_sync: 0, waiting: 0, synced: 0 };
  for (const row of rows) {
    counts[row.status] += 1;
    // Overview lists everything that still needs accounting attention.
    if (row.status !== "synced") counts.overview += 1;
  }
  return counts;
}

/**
 * Creates an isolated client store for one ledger. Mounted in the ledger's
 * layout so edits and status moves survive switching between its tabs.
 */
export function createLedgerStore<R extends LedgerRowBase>(seed: R[], name: string): LedgerStoreApi<R> {
  const Context = createContext<LedgerStore<R> | null>(null);
  Context.displayName = `${name}LedgerContext`;

  function Provider({ children }: { children: ReactNode }) {
    const [rows, setRows] = useState(seed);

    const setStatus = useCallback((ids: string[], status: LedgerStatus) => {
      setRows((list) => list.map((row) => (ids.includes(row.id) ? { ...row, status } : row)));
    }, []);

    const setCoding = useCallback((id: string, field: string, value: string) => {
      setRows((list) => list.map((row) => (row.id === id ? { ...row, coding: { ...row.coding, [field]: value } } : row)));
    }, []);

    const counts = useMemo(() => tally(rows), [rows]);
    const value = useMemo(() => ({ rows, counts, setStatus, setCoding }), [rows, counts, setStatus, setCoding]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useLedger() {
    const context = useContext(Context);
    if (!context) throw new Error(`use${name}Ledger must be used inside its <Provider>`);
    return context;
  }

  return { Provider, useLedger };
}
