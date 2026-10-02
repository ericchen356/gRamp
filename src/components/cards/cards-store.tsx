"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cards as cardSeed, funds as fundSeed, type Fund, type RampCard } from "@/data/cards";

type Store = {
  cards: RampCard[];
  addCard: (card: RampCard) => void;
  updateCard: (id: string, patch: Partial<RampCard>) => void;
  funds: Fund[];
  addFund: (fund: Fund) => void;
};

const CardsContext = createContext<Store | null>(null);

/** Shared card + fund state for the Funds & cards list, Funds tab and card detail. */
export function CardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState(cardSeed);
  const [funds, setFunds] = useState(fundSeed);

  const addCard = useCallback((card: RampCard) => setCards((list) => [card, ...list]), []);
  const updateCard = useCallback((id: string, patch: Partial<RampCard>) => {
    setCards((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);
  const addFund = useCallback((fund: Fund) => setFunds((list) => [fund, ...list]), []);

  const value = useMemo(() => ({ cards, addCard, updateCard, funds, addFund }), [cards, addCard, updateCard, funds, addFund]);
  return <CardsContext.Provider value={value}>{children}</CardsContext.Provider>;
}

export function useCards() {
  const context = useContext(CardsContext);
  if (!context) throw new Error("useCards must be used inside <CardsProvider>");
  return context;
}
