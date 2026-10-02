"use client";

import { Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Status } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { MenuItem, MenuLabel } from "@/components/ui/popover";
import { DetailRow, Progress, Stat } from "@/components/ui/stat";
import { CellStack, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { FilterChip } from "@/components/ui/toolbar";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { people } from "@/data/people";
import type { Fund } from "@/data/cards";
import { formatDate, formatDateLong, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { SpendMeter } from "./card-status";
import { useCards } from "./cards-store";

const statusMeta = {
  active: { label: "Active", tone: "success" },
  paused: { label: "Paused", tone: "warning" },
  expired: { label: "Expired", tone: "neutral" },
} as const satisfies Record<Fund["status"], { label: string; tone: Parameters<typeof Status>[0]["tone"] }>;

function periodLabel(fund: Fund) {
  return fund.resets ? `${fund.period} · resets ${formatDate(fund.resets)}` : fund.period;
}

/** Funds & cards › Funds: shared budgets with members spending on their own cards. */
export function FundsTable() {
  const { funds } = useCards();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Fund["status"] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return funds.filter(
      (f) => (!status || f.status === status) && (!q || `${f.name} ${f.owner} ${f.description}`.toLowerCase().includes(q)),
    );
  }, [funds, status, query]);

  const live = funds.filter((f) => f.status === "active");
  const allocated = live.reduce((sum, f) => sum + f.limit, 0);
  const spent = live.reduce((sum, f) => sum + f.spent, 0);
  const nearLimit = live.filter((f) => f.spent / f.limit >= 0.8).length;
  const open = funds.find((f) => f.id === openId) ?? null;

  return (
    <>
      <section className="flex gap-[66px] px-page pt-9 pb-10">
        <Stat label="Allocated to active funds" value={formatMoneyWhole(allocated)} caption={pluralize(live.length, "active fund")} size="lg" />
        <Stat label="Spent from funds" value={formatMoney(spent)} caption={`${Math.round((spent / allocated) * 100)}% of allocated`} size="lg" />
        <Stat
          label="Near limit"
          value={nearLimit}
          caption={<span className={nearLimit ? "text-warning" : undefined}>Over 80% spent</span>}
          size="lg"
        />
      </section>

      <DataToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search funds or owners..."
        filterCount={status ? 1 : 0}
        onClearFilters={() => setStatus(null)}
        options={[
          { label: "Export CSV", onSelect: () => toast.show("Fund export started. We'll email you the CSV.", "neutral") },
          { label: "Fund request settings", onSelect: () => toast.show("Opening fund request settings", "neutral") },
        ]}
        chips={status && <FilterChip label="Status" value={statusMeta[status].label} onRemove={() => setStatus(null)} />}
        filterMenu={(close) => (
          <>
            <MenuLabel>Status</MenuLabel>
            {(Object.keys(statusMeta) as Fund["status"][]).map((value) => (
              <MenuItem key={value} selected={status === value} onSelect={() => { setStatus(value); close(); }}>
                {statusMeta[value].label}
              </MenuItem>
            ))}
          </>
        )}
      />

      <Table className="border-t border-line" minWidth={1180}>
        <THead>
          <tr>
            <Th>Fund</Th>
            <Th className="w-[184px]">Owner</Th>
            <Th className="w-[150px]">Members</Th>
            <Th className="w-[244px]">Spent</Th>
            <Th className="w-[190px]">Period</Th>
            <Th className="w-[112px]">Status</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((fund) => (
            <Tr key={fund.id} onClick={() => setOpenId(fund.id)}>
              <Td className="h-[62px]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-muted text-ink-1">
                    <Wallet className="size-[15px] stroke-[1.5]" />
                  </span>
                  <CellStack primary={<span className="text-[13px]">{fund.name}</span>} secondary={fund.description} />
                </div>
              </Td>
              <Td>
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={fund.owner} size={22} />
                  <span className="truncate">{fund.owner}</span>
                </span>
              </Td>
              <Td>
                <span className="flex items-center gap-2.5">
                  <AvatarStack names={fund.members} size={24} />
                  <span className="text-[12px] text-ink-2 tabular">{fund.members.length}</span>
                </span>
              </Td>
              <Td>
                <SpendMeter spent={fund.spent} limit={fund.limit} />
              </Td>
              <Td className="text-ink-2">{periodLabel(fund)}</Td>
              <Td>
                <Status tone={statusMeta[fund.status].tone}>{statusMeta[fund.status].label}</Status>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      <div className="flex-1" />
      <TableFooter
        right={
          <>
            <span>{pluralize(rows.length, "fund")}</span>
            <span>·</span>
            <span>
              {formatMoney(rows.reduce((sum, f) => sum + f.spent, 0))} of {formatMoneyWhole(rows.reduce((sum, f) => sum + f.limit, 0))}
            </span>
          </>
        }
      />

      <Drawer open={!!open} onClose={() => setOpenId(null)} title="Fund">
        {open && (
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-ink-1">
                <Wallet className="size-[18px] stroke-[1.5]" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[16px] text-ink">{open.name}</div>
                <div className="truncate text-[12px] text-ink-2">{open.description}</div>
              </div>
              <span className="ml-auto">
                <Status tone={statusMeta[open.status].tone}>{statusMeta[open.status].label}</Status>
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-[36px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(open.spent)}</span>
              <span className="text-[14px] text-ink-3 tabular">of {formatMoneyWhole(open.limit)}</span>
            </div>
            <Progress value={open.spent} max={open.limit} tone={open.spent / open.limit >= 0.9 ? "warning" : "ink"} className="mt-3" />
            <div className="mt-2 text-[13px] text-ink-2">{formatMoney(Math.max(0, open.limit - open.spent))} available</div>

            <h3 className="mt-7 mb-1 text-[13px] text-ink">Details</h3>
            <DetailRow label="Owner">{open.owner}</DetailRow>
            <DetailRow label="Period">{open.period}</DetailRow>
            <DetailRow label="Resets">{open.resets ? formatDateLong(open.resets) : "Does not reset"}</DetailRow>

            <h3 className="mt-7 mb-1 text-[13px] text-ink">Members · {open.members.length}</h3>
            <ul className="divide-y divide-line-soft">
              {open.members.map((name) => (
                <li key={name} className="flex items-center gap-3 py-2.5 text-[13px]">
                  <Avatar name={name} size={26} />
                  <span className="flex-1 text-ink-1">{name}</span>
                  <span className="text-ink-3">{people.find((p) => p.name === name)?.title}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex gap-2">
              <Button variant="primary" onClick={() => toast.show(`Invite sent to join ${open.name}`)}>
                Add members
              </Button>
              <Button onClick={() => toast.show(`${open.name} limit request sent to ${open.owner}`, "neutral")}>Request increase</Button>
              <Button variant="ghost" className="ml-auto" onClick={() => setOpenId(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
