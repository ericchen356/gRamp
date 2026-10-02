"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { TODAY, bills as seed, type Bill, type BillApprover, type BillStage } from "@/data/bills";
import { currentUser } from "@/data/people";

type Store = {
  bills: Bill[];
  counts: Record<BillStage, number>;
  /** Approves the current step; the bill moves to payment once every approver signs off. */
  approve: (ids: string[]) => void;
  reject: (id: string) => void;
  pay: (ids: string[]) => void;
  schedule: (id: string, date: string) => void;
  submit: (ids: string[]) => void;
  add: (bill: Bill) => void;
  remove: (id: string) => void;
};

const BillsContext = createContext<Store | null>(null);

/** Default approval chain for newly submitted bills. */
export function defaultApprovers(amount: number): BillApprover[] {
  return amount >= 5000
    ? [{ name: "Tina Cruz", state: "pending" }, { name: currentUser.name, state: "queued" }]
    : [{ name: "Tina Cruz", state: "pending" }];
}

function advance(bill: Bill): Bill {
  const index = bill.approvers.findIndex((a) => a.state === "pending");
  if (index === -1) return { ...bill, stage: "payment" };
  const approvers = bill.approvers.map((a, i) =>
    i === index ? { ...a, state: "approved" as const } : i === index + 1 ? { ...a, state: "pending" as const } : a,
  );
  const done = approvers.every((a) => a.state === "approved");
  return { ...bill, approvers, stage: done ? "payment" : "approval" };
}

/** Bill Pay state shared by every tab, the drawer and the New bill flow. */
export function BillsProvider({ children }: { children: ReactNode }) {
  const [bills, setBills] = useState(seed);

  const update = useCallback((ids: string[], fn: (bill: Bill) => Bill) => {
    setBills((list) => list.map((bill) => (ids.includes(bill.id) ? fn(bill) : bill)));
  }, []);

  const approve = useCallback((ids: string[]) => update(ids, advance), [update]);
  const reject = useCallback(
    (id: string) => update([id], (b) => ({ ...b, stage: "draft", approvers: [], missing: ["Changes requested"] })),
    [update],
  );
  const pay = useCallback(
    (ids: string[]) => update(ids, (b) => ({ ...b, stage: "paid", paidOn: TODAY, scheduledFor: undefined })),
    [update],
  );
  const schedule = useCallback((id: string, date: string) => update([id], (b) => ({ ...b, scheduledFor: date })), [update]);
  const submit = useCallback(
    (ids: string[]) =>
      update(ids, (b) => ({
        ...b,
        stage: "approval",
        missing: undefined,
        glAccount: b.glAccount ?? "6200 Office Supplies",
        approvers: b.approvers.length ? b.approvers : defaultApprovers(b.amount),
      })),
    [update],
  );
  const add = useCallback((bill: Bill) => setBills((list) => [bill, ...list]), []);
  const remove = useCallback((id: string) => setBills((list) => list.filter((b) => b.id !== id)), []);

  const counts = useMemo(
    () =>
      bills.reduce<Record<BillStage, number>>((acc, b) => ({ ...acc, [b.stage]: acc[b.stage] + 1 }), {
        draft: 0,
        approval: 0,
        payment: 0,
        paid: 0,
      }),
    [bills],
  );

  const value = useMemo(
    () => ({ bills, counts, approve, reject, pay, schedule, submit, add, remove }),
    [bills, counts, approve, reject, pay, schedule, submit, add, remove],
  );
  return <BillsContext.Provider value={value}>{children}</BillsContext.Provider>;
}

export function useBills() {
  const context = useContext(BillsContext);
  if (!context) throw new Error("useBills must be used inside <BillsProvider>");
  return context;
}
