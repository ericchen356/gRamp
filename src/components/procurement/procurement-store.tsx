"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  intakeForms as formSeed,
  purchaseOrders as poSeed,
  purchaseRequests as requestSeed,
  type IntakeForm,
  type PurchaseOrder,
  type PurchaseRequest,
} from "@/data/procurement";

type Store = {
  requests: PurchaseRequest[];
  addRequest: (request: PurchaseRequest) => void;
  updateRequest: (id: string, patch: Partial<PurchaseRequest>) => void;
  orders: PurchaseOrder[];
  addOrder: (order: PurchaseOrder) => void;
  updateOrder: (id: string, patch: Partial<PurchaseOrder>) => void;
  forms: IntakeForm[];
  updateForm: (id: string, patch: Partial<IntakeForm>) => void;
};

const ProcurementContext = createContext<Store | null>(null);

function patchList<T extends { id: string }>(id: string, patch: Partial<T>) {
  return (list: T[]) => list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

/** Requests, POs and intake forms shared across the Procurement tabs. */
export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState(requestSeed);
  const [orders, setOrders] = useState(poSeed);
  const [forms, setForms] = useState(formSeed);

  const addRequest = useCallback((request: PurchaseRequest) => setRequests((list) => [request, ...list]), []);
  const updateRequest = useCallback((id: string, patch: Partial<PurchaseRequest>) => setRequests(patchList(id, patch)), []);
  const addOrder = useCallback((order: PurchaseOrder) => setOrders((list) => [order, ...list]), []);
  const updateOrder = useCallback((id: string, patch: Partial<PurchaseOrder>) => setOrders(patchList(id, patch)), []);
  const updateForm = useCallback((id: string, patch: Partial<IntakeForm>) => setForms(patchList(id, patch)), []);

  const value = useMemo(
    () => ({ requests, addRequest, updateRequest, orders, addOrder, updateOrder, forms, updateForm }),
    [requests, addRequest, updateRequest, orders, addOrder, updateOrder, forms, updateForm],
  );
  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>;
}

export function useProcurement() {
  const context = useContext(ProcurementContext);
  if (!context) throw new Error("useProcurement must be used inside <ProcurementProvider>");
  return context;
}
