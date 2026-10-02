"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  cardExpenses as expenseSeed,
  expensePolicy,
  reimbursements as reimbursementSeed,
  type CardExpense,
  type PolicySection,
  type Reimbursement,
} from "@/data/expenses";

type Store = {
  expenses: CardExpense[];
  updateExpense: (ids: string[], patch: Partial<CardExpense>) => void;
  reimbursements: Reimbursement[];
  addReimbursement: (reimbursement: Reimbursement) => void;
  updateReimbursement: (id: string, patch: Partial<Reimbursement>) => void;
  policy: PolicySection[];
  updateRule: (sectionId: string, ruleId: string, patch: { enabled?: boolean; value?: number }) => void;
  /** New reimbursement dialog, shared by the header CTA and empty states. */
  composerOpen: boolean;
  setComposerOpen: (open: boolean) => void;
};

const ExpensesContext = createContext<Store | null>(null);

/** Client store shared by the Expenses & travel tabs. */
export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState(expenseSeed);
  const [reimbursements, setReimbursements] = useState(reimbursementSeed);
  const [policy, setPolicy] = useState(expensePolicy);
  const [composerOpen, setComposerOpen] = useState(false);

  const updateExpense = useCallback((ids: string[], patch: Partial<CardExpense>) => {
    setExpenses((list) => list.map((e) => (ids.includes(e.id) ? { ...e, ...patch } : e)));
  }, []);

  const addReimbursement = useCallback((reimbursement: Reimbursement) => {
    setReimbursements((list) => [reimbursement, ...list]);
  }, []);

  const updateReimbursement = useCallback((id: string, patch: Partial<Reimbursement>) => {
    setReimbursements((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const updateRule = useCallback((sectionId: string, ruleId: string, patch: { enabled?: boolean; value?: number }) => {
    setPolicy((sections) =>
      sections.map((section) =>
        section.id !== sectionId
          ? section
          : { ...section, rules: section.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)) },
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      expenses,
      updateExpense,
      reimbursements,
      addReimbursement,
      updateReimbursement,
      policy,
      updateRule,
      composerOpen,
      setComposerOpen,
    }),
    [expenses, updateExpense, reimbursements, addReimbursement, updateReimbursement, policy, updateRule, composerOpen],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) throw new Error("useExpenses must be used inside <ExpensesProvider>");
  return context;
}
