"use client";

import { Plus, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/stat";
import { CellStack, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import type { Member } from "@/data/company";
import { people } from "@/data/people";
import { cn } from "@/lib/cn";
import { formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { useCompany } from "./company-store";
import { Field, TextInput } from "@/components/ui/field";

type Kind = "department" | "location";

const ownerOptions = people.map((person) => ({ value: person.name, label: person.name }));

function OwnerCell({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2">
      <Avatar name={name} size={22} />
      <span className="truncate">{name}</span>
    </span>
  );
}

function MembersCell({ members }: { members: Member[] }) {
  if (!members.length) return <span className="text-ink-4">No members</span>;
  return (
    <span className="flex items-center gap-2.5">
      <AvatarStack names={members.map((m) => m.name)} size={24} max={4} />
      <span className="text-ink-2">{members.length}</span>
    </span>
  );
}

function NewUnitDialog({ kind, open, onClose }: { kind: Kind; open: boolean; onClose: () => void }) {
  const { addDepartment, addLocation } = useCompany();
  const toast = useToast();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState<string | null>(null);
  const [extra, setExtra] = useState("");
  const [budget, setBudget] = useState("");

  const reset = () => {
    setName("");
    setOwner(null);
    setExtra("");
    setBudget("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    const trimmed = name.trim();
    if (kind === "department") {
      addDepartment({
        name: trimmed,
        owner: owner ?? "Alexander Bass",
        glCode: extra.trim() || "—",
        monthlyBudget: Number(budget.replace(/[^0-9.]/g, "")) || 0,
        spendThisMonth: 0,
        spendLastMonth: 0,
      });
    } else {
      addLocation({ name: trimmed, owner: owner ?? "Alexander Bass", address: extra.trim() || "—", timezone: "Central (CT)", spendThisMonth: 0 });
    }
    toast.show(`${kind === "department" ? "Department" : "Location"} “${trimmed}” created`);
    close();
  };

  const noun = kind === "department" ? "department" : "location";

  return (
    <Dialog open={open} onClose={close}>
      <DialogHeader
        title={`New ${noun}`}
        description={
          kind === "department"
            ? "Departments group people for approvals, budgets and accounting."
            : "Locations map to offices and sync to your accounting class field."
        }
        onClose={close}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) submit();
        }}
      >
        <div className="space-y-4 px-6 pt-4 pb-6">
          <Field label="Name">
            <TextInput autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === "department" ? "e.g. Customer Success" : "e.g. Denver"} />
          </Field>
          <Field label="Owner" hint={kind === "department" ? "Owners approve spend as “Department head” in approval chains." : undefined}>
            <Select variant="field" label="Owner" value={owner} options={ownerOptions} onChange={setOwner} placeholder="Select owner" />
          </Field>
          {kind === "department" ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="GL code">
                <TextInput value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="700" />
              </Field>
              <Field label="Monthly budget">
                <TextInput prefix="$" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="0.00" inputMode="decimal" />
              </Field>
            </div>
          ) : (
            <Field label="Address">
              <TextInput value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="Street, city, state, ZIP" />
            </Field>
          )}
        </div>
        <DialogFooter>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            Create {noun}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

/** Departments and Locations tabs: owner, member stack and spend per unit. */
export function OrgUnits({ kind }: { kind: Kind }) {
  const { members, departments, locations } = useCompany();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const isDept = kind === "department";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = isDept
      ? departments.map((d) => ({ ...d, key: d.name, secondary: `GL ${d.glCode}`, extra: d }))
      : locations.map((l) => ({ ...l, key: l.name, secondary: l.address, extra: l }));
    return source
      .map((unit) => ({
        ...unit,
        members: members.filter((m) => (isDept ? m.department : m.location) === unit.name),
      }))
      .filter((unit) => !q || `${unit.name} ${unit.owner} ${unit.secondary}`.toLowerCase().includes(q));
  }, [isDept, departments, locations, members, query]);

  const totalSpend = rows.reduce((sum, row) => sum + row.spendThisMonth, 0);

  return (
    <>
      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} placeholder={`Search ${isDept ? "departments" : "locations"}...`} />
          <div className="ml-auto flex items-center gap-2">
            <IconButton label="Row density">
              <Rows3 />
            </IconButton>
            <Button pill size="sm" onClick={() => setCreating(true)} className="h-8 gap-1.5 pr-3.5 pl-3 text-[12px]">
              <Plus className="size-3.5 stroke-[1.75]" />
              New {kind}
            </Button>
          </div>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1180}>
        <THead>
          <tr>
            <Th className="w-[26%]" sort="asc">
              {isDept ? "Department" : "Location"}
            </Th>
            <Th className="w-[17%]">Owner</Th>
            <Th className="w-[17%]">Members</Th>
            {isDept ? (
              <>
                <Th className="w-[14%]" align="right">
                  Spend this month
                </Th>
                <Th>Budget used</Th>
              </>
            ) : (
              <>
                <Th className="w-[14%]">Time zone</Th>
                <Th align="right">Spend this month</Th>
              </>
            )}
          </tr>
        </THead>
        <TBody>
          {rows.map((row) => {
            const dept = isDept ? departments.find((d) => d.name === row.name) : undefined;
            const loc = !isDept ? locations.find((l) => l.name === row.name) : undefined;
            const change = dept && dept.spendLastMonth ? (dept.spendThisMonth - dept.spendLastMonth) / dept.spendLastMonth : 0;
            const used = dept && dept.monthlyBudget ? dept.spendThisMonth / dept.monthlyBudget : 0;
            return (
              <Tr key={row.key} interactive={false} className="hover:bg-subtle/60">
                <Td>
                  <CellStack
                    primary={
                      <span className="flex items-center gap-2">
                        {row.name}
                        {loc?.headquarters && <Tag tone="outline" className="h-[18px] px-1.5 text-[11px]">HQ</Tag>}
                      </span>
                    }
                    secondary={row.secondary}
                  />
                </Td>
                <Td>
                  <OwnerCell name={row.owner} />
                </Td>
                <Td>
                  <MembersCell members={row.members} />
                </Td>
                {dept ? (
                  <>
                    <Td align="right">
                      <CellStack
                        primary={formatMoney(dept.spendThisMonth)}
                        secondary={
                          dept.spendLastMonth ? (
                            <span className={cn(change > 0.1 && "text-warning")}>
                              {change >= 0 ? "+" : "−"}
                              {Math.abs(change * 100).toFixed(0)}% vs. Aug
                            </span>
                          ) : (
                            "No spend yet"
                          )
                        }
                      />
                    </Td>
                    <Td>
                      {dept.monthlyBudget ? (
                        <div className="flex items-center gap-4">
                          <Progress value={dept.spendThisMonth} max={dept.monthlyBudget} tone={used > 0.85 ? "warning" : "ink"} className="max-w-[180px]" />
                          <span className="shrink-0 text-[12px] whitespace-nowrap text-ink-2 tabular">
                            {Math.round(used * 100)}% of {formatMoneyWhole(dept.monthlyBudget)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-ink-4">No budget</span>
                      )}
                    </Td>
                  </>
                ) : (
                  <>
                    <Td className="text-ink-2">{loc?.timezone}</Td>
                    <Td align="right" className="text-ink">
                      {formatMoney(row.spendThisMonth)}
                    </Td>
                  </>
                )}
              </Tr>
            );
          })}
        </TBody>
      </Table>

      <div className="flex-1" />
      <TableFooter
        right={
          <>
            <span>{pluralize(rows.length, kind)}</span>
            <span>·</span>
            <span>{formatMoney(totalSpend)} this month</span>
          </>
        }
      />

      <NewUnitDialog kind={kind} open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
