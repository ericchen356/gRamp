"use client";

import { ChevronDown, Columns3, MailWarning, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuDivider, MenuItem, MenuLabel, Popover } from "@/components/ui/popover";
import { Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { AddFilterButton, FilterChip, SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { roles, type Member } from "@/data/company";
import type { Person } from "@/data/people";
import { formatDate, pluralize } from "@/lib/format";
import { useCompany } from "./company-store";
import { PersonDrawer } from "./person-drawer";

const roleTones: Record<Person["role"], "neutral" | "info" | "outline" | "success"> = {
  Admin: "info",
  "Business owner": "info",
  Bookkeeper: "success",
  Manager: "outline",
  Employee: "neutral",
};

export function RoleTag({ role }: { role: Person["role"] }) {
  return <Tag tone={roleTones[role]}>{role}</Tag>;
}

type Filter = { kind: "role"; value: Person["role"] } | { kind: "status"; value: Member["status"] };

/** Pending-invite notice that backs the sidebar "Company 1" counter. */
function PendingInvites({ pending, onOpen }: { pending: Member[]; onOpen: (id: string) => void }) {
  const { resend } = useCompany();
  const toast = useToast();
  if (!pending.length) return null;
  const [first] = pending;

  return (
    <div className="px-page pt-6 pb-6">
      <div className="flex items-center gap-4 border border-line bg-subtle py-3 pr-3 pl-4">
        <MailWarning className="size-4 shrink-0 stroke-[1.5] text-ink-2" />
        <p className="min-w-0 flex-1 truncate text-[13px] text-ink-2">
          <span className="text-ink">{pluralize(pending.length, "invite")} pending.</span>{" "}
          {pending.length === 1 ? (
            <>
              <button type="button" className="text-ink-1 underline decoration-ink-4 underline-offset-2 hover:decoration-ink" onClick={() => onOpen(first.id)}>
                {first.name}
              </button>{" "}
              was invited on {formatDate(first.since)} and hasn’t joined Ramp yet.
            </>
          ) : (
            "These people haven’t accepted their invitation to Ramp yet."
          )}
        </p>
        <Button
          size="sm"
          onClick={() => {
            pending.forEach((member) => resend(member.id));
            toast.show(pending.length === 1 ? `Invite resent to ${first.email}` : `${pending.length} invites resent`);
          }}
        >
          {pending.length === 1 ? "Resend invite" : "Resend all"}
        </Button>
      </div>
    </div>
  );
}

export function PeopleTable() {
  const { members } = useCompany();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(
      (m) =>
        filters.every((f) => (f.kind === "role" ? m.role === f.value : m.status === f.value)) &&
        (!q || `${m.name} ${m.email} ${m.title} ${m.department} ${m.location}`.toLowerCase().includes(q)),
    );
  }, [members, filters, query]);

  const pending = members.filter((m) => m.status === "Invited");
  const allSelected = rows.length > 0 && rows.every((m) => selected.has(m.id));
  const someSelected = rows.some((m) => selected.has(m.id));
  const openMember = members.find((m) => m.id === openId) ?? null;

  const addFilter = (filter: Filter) =>
    setFilters((current) => [...current.filter((f) => f.kind !== filter.kind), filter]);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <PendingInvites pending={pending} onOpen={setOpenId} />

      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} placeholder="Search people..." />
          <div className="ml-auto flex items-center gap-2">
            <IconButton label="Row density">
              <Rows3 />
            </IconButton>
            <IconButton label="Columns">
              <Columns3 />
            </IconButton>
            <Popover
              align="end"
              trigger={({ toggle: open }) => (
                <Button pill size="sm" onClick={open} className="h-8 gap-1 pr-2.5 pl-3 text-[12px]">
                  Options
                  <ChevronDown className="size-3.5 stroke-[1.5]" />
                </Button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={() => { close(); toast.show("Exporting people as CSV", "neutral"); }}>Export CSV</MenuItem>
                  <MenuItem onSelect={close}>Manage roles & permissions</MenuItem>
                  <MenuItem onSelect={close}>HRIS sync settings</MenuItem>
                </>
              )}
            </Popover>
          </div>
        </ToolbarRow>
        <ToolbarRow className="min-h-0 pb-3">
          {filters.map((filter) => (
            <FilterChip
              key={filter.kind}
              label={filter.kind === "role" ? "Role" : "Status"}
              value={filter.value}
              onRemove={() => setFilters((current) => current.filter((f) => f.kind !== filter.kind))}
            />
          ))}
          <Popover trigger={({ toggle: open }) => <AddFilterButton onClick={open} />}>
            {(close) => (
              <>
                <MenuLabel>Status</MenuLabel>
                {(["Active", "Invited"] as const).map((value) => (
                  <MenuItem key={value} onSelect={() => { addFilter({ kind: "status", value }); close(); }}>
                    {value}
                  </MenuItem>
                ))}
                <MenuDivider />
                <MenuLabel>Role</MenuLabel>
                {roles.map((value) => (
                  <MenuItem key={value} onSelect={() => { addFilter({ kind: "role", value }); close(); }}>
                    {value}
                  </MenuItem>
                ))}
              </>
            )}
          </Popover>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1240}>
        <THead>
          <tr>
            <Th align="center" className="w-[52px] min-w-[52px] px-0!">
              <Checkbox
                label="Select all"
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={(checked) => setSelected(checked ? new Set(rows.map((m) => m.id)) : new Set())}
              />
            </Th>
            <Th className="w-[260px] pl-[14px]!" sort="asc">
              Name
            </Th>
            <Th className="w-[130px]">Role</Th>
            <Th className="w-[160px]">Title</Th>
            <Th className="w-[120px]">Department</Th>
            <Th className="w-[120px]">Location</Th>
            <Th className="w-[150px]">Manager</Th>
            <Th className="w-[70px]" align="right">
              Cards
            </Th>
            <Th>Status</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((m) => {
            const isSelected = selected.has(m.id);
            return (
              <Tr key={m.id} selected={isSelected} onClick={() => setOpenId(m.id)}>
                <Td className="w-[52px] px-0! text-center">
                  <Checkbox label={`Select ${m.name}`} checked={isSelected} onChange={() => toggle(m.id)} />
                </Td>
                <Td className="pl-[14px]!">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size={30} />
                    <div className="min-w-0 leading-tight">
                      <div className="truncate text-[13px] text-ink">{m.name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-ink-2">{m.email}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <RoleTag role={m.role} />
                </Td>
                <Td className="max-w-[160px] truncate">{m.title}</Td>
                <Td>{m.department}</Td>
                <Td>{m.location}</Td>
                <Td className="max-w-[150px] truncate">{m.manager ?? <span className="text-ink-4">—</span>}</Td>
                <Td align="right">{m.cards}</Td>
                <Td>
                  {m.status === "Active" ? (
                    <Status tone="success">Active</Status>
                  ) : (
                    <Status tone="pending">Invited</Status>
                  )}
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <p className="text-[15px] text-ink">No people found</p>
          <p className="mt-1 text-[13px] text-ink-2">Try a different search or remove a filter.</p>
        </div>
      )}

      <div className="flex-1" />
      <TableFooter
        left={
          someSelected ? (
            <>
              <span className="text-ink-1">{selected.size} selected</span>
              <Button
                size="xs"
                onClick={() => {
                  toast.show(`${pluralize(selected.size, "person", "people")} added to the Q4 card program`);
                  setSelected(new Set());
                }}
              >
                Issue cards
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </>
          ) : (
            <button type="button" className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
              Select
              <ChevronDown className="size-3 stroke-[1.75]" />
            </button>
          )
        }
        right={
          <span>
            1–{rows.length} of {pluralize(rows.length, "person", "people")}
          </span>
        }
      />

      <PersonDrawer member={openMember} onClose={() => setOpenId(null)} />
    </>
  );
}
