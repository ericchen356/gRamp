"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { accountingCounts, transactions as seed, type AccountingStatus, type Transaction } from "@/data/transactions";

type Store = {
  transactions: Transaction[];
  setStatus: (ids: string[], status: AccountingStatus) => void;
  update: (id: string, patch: Partial<Transaction>) => void;
  /** Tab counts: production-scale baselines adjusted by local moves. */
  counts: Record<"overview" | AccountingStatus, number>;
};

const AccountingContext = createContext<Store | null>(null);

function tally(list: Transaction[]) {
  return list.reduce<Record<AccountingStatus, number>>(
    (acc, transaction) => ({ ...acc, [transaction.status]: acc[transaction.status] + 1 }),
    { needs_review: 0, ready_to_sync: 0, waiting: 0, synced: 0 },
  );
}

const seedTally = tally(seed);

/** Keeps accounting edits consistent across the Ramp Card tabs. */
export function AccountingProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState(seed);

  const setStatus = useCallback((ids: string[], status: AccountingStatus) => {
    setTransactions((list) => list.map((t) => (ids.includes(t.id) ? { ...t, status } : t)));
  }, []);

  const update = useCallback((id: string, patch: Partial<Transaction>) => {
    setTransactions((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const counts = useMemo(() => {
    const now = tally(transactions);
    return {
      overview: accountingCounts.overview,
      needs_review: accountingCounts.needs_review + now.needs_review - seedTally.needs_review,
      ready_to_sync: now.ready_to_sync,
      waiting: accountingCounts.waiting + now.waiting - seedTally.waiting,
      synced: now.synced,
    };
  }, [transactions]);

  const value = useMemo(() => ({ transactions, setStatus, update, counts }), [transactions, setStatus, update, counts]);
  return <AccountingContext.Provider value={value}>{children}</AccountingContext.Provider>;
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (!context) throw new Error("useAccounting must be used inside <AccountingProvider>");
  return context;
}
