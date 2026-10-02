"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { spendPrograms as seed, type SpendProgram } from "@/data/spend-programs";

type Store = {
  programs: SpendProgram[];
  addProgram: (program: SpendProgram) => void;
  updateProgram: (id: string, patch: Partial<SpendProgram>) => void;
};

const ProgramsContext = createContext<Store | null>(null);

/** Spend programs shared by the list and the program detail route. */
export function ProgramsProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState(seed);
  const addProgram = useCallback((program: SpendProgram) => setPrograms((list) => [...list, program]), []);
  const updateProgram = useCallback((id: string, patch: Partial<SpendProgram>) => {
    setPrograms((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);
  const value = useMemo(() => ({ programs, addProgram, updateProgram }), [programs, addProgram, updateProgram]);
  return <ProgramsContext.Provider value={value}>{children}</ProgramsContext.Provider>;
}

export function usePrograms() {
  const context = useContext(ProgramsContext);
  if (!context) throw new Error("usePrograms must be used inside <ProgramsProvider>");
  return context;
}
