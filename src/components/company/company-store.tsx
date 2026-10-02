"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  departmentRecords,
  locationRecords,
  members as seedMembers,
  type Department,
  type Member,
  type OfficeLocation,
} from "@/data/company";

type CompanyStore = {
  members: Member[];
  invite: (invites: Pick<Member, "email" | "role" | "department">[]) => void;
  update: (id: string, patch: Partial<Member>) => void;
  resend: (id: string) => void;
  remove: (id: string) => void;
  departments: Department[];
  addDepartment: (department: Department) => void;
  locations: OfficeLocation[];
  addLocation: (location: OfficeLocation) => void;
};

const CompanyContext = createContext<CompanyStore | null>(null);

function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

/** People, departments and locations shared by the Company header, tables and dialogs. */
export function CompanyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [departments, setDepartments] = useState<Department[]>(departmentRecords);
  const [locations, setLocations] = useState<OfficeLocation[]>(locationRecords);

  const invite = useCallback<CompanyStore["invite"]>((invites) => {
    const today = new Date().toISOString().slice(0, 10);
    setMembers((current) => [
      ...current,
      ...invites
        .filter((entry) => !current.some((member) => member.email === entry.email))
        .map((entry) => ({
          ...entry,
          id: `p_${entry.email}`,
          name: nameFromEmail(entry.email),
          title: "—",
          location: "Austin, TX",
          status: "Invited" as const,
          cards: 0,
          spendThisMonth: 0,
          since: today,
        })),
    ]);
  }, []);

  const update = useCallback<CompanyStore["update"]>((id, patch) => {
    setMembers((current) => current.map((member) => (member.id === id ? { ...member, ...patch } : member)));
  }, []);

  const resend = useCallback<CompanyStore["resend"]>((id) => {
    const today = new Date().toISOString().slice(0, 10);
    setMembers((current) => current.map((member) => (member.id === id ? { ...member, since: today } : member)));
  }, []);

  const remove = useCallback((id: string) => setMembers((current) => current.filter((member) => member.id !== id)), []);

  const addDepartment = useCallback((department: Department) => setDepartments((current) => [...current, department]), []);
  const addLocation = useCallback((location: OfficeLocation) => setLocations((current) => [...current, location]), []);

  const value = useMemo(
    () => ({ members, invite, update, resend, remove, departments, addDepartment, locations, addLocation }),
    [members, invite, update, resend, remove, departments, addDepartment, locations, addLocation],
  );
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error("useCompany must be used inside <CompanyProvider>");
  return context;
}
