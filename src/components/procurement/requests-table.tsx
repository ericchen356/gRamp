"use client";

import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuDivider, MenuItem, MenuLabel } from "@/components/ui/popover";
import { Stat } from "@/components/ui/stat";
import { CellStack, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { FilterChip } from "@/components/ui/toolbar";
import { DataToolbar, TODAY } from "@/components/ui/data-toolbar";
import { currentUser } from "@/data/people";
import { requestStatusLabels, type PurchaseRequest, type RequestStatus } from "@/data/procurement";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { useProcurement } from "./procurement-store";
import { RequestDrawer } from "./request-drawer";
import { RequestTag, StageProgress } from "./request-parts";

const statuses: RequestStatus[] = ["in_review", "needs_info", "approved", "rejected", "draft"];

function isOpen(r: PurchaseRequest) {
  return r.status === "in_review" || r.status === "needs_info";
}

function waitingOnMe(r: PurchaseRequest) {
  return isOpen(r) && r.timeline.some((e) => e.state === "current" && e.actor === currentUser.name);
}

function DueCell({ request }: { request: PurchaseRequest }) {
  if (!isOpen(request)) return <span className="text-ink-3">{formatDate(request.due)}</span>;
  const days = Math.round((new Date(`${request.due}T12:00:00`).getTime() - new Date(`${TODAY}T12:00:00`).getTime()) / 86_400_000);
  return (
    <div className="leading-tight">
      <div className={cn(days < 0 ? "text-flag" : "text-ink-1")}>{formatDate(request.due)}</div>
      <div className={cn("mt-0.5 text-[12px]", days <= 1 ? "text-flag" : "text-ink-3")}>
        {days < 0 ? `${-days}d overdue` : days === 0 ? "Due today" : days === 1 ? "Tomorrow" : `In ${days} days`}
      </div>
    </div>
  );
}

/** Procurement › Requests: purchase requests moving through approval. */
export function RequestsTable() {
  const { requests } = useProcurement();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RequestStatus | null>(null);
  const [mine, setMine] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter(
      (r) =>
        (!status || r.status === status) &&
        (!mine || waitingOnMe(r)) &&
        (!q || `${r.title} ${r.vendor} ${r.requester} ${r.id} ${r.department}`.toLowerCase().includes(q)),
    );
  }, [requests, status, mine, query]);

  const open = requests.filter(isOpen);
  const pipeline = open.reduce((sum, r) => sum + r.amount, 0);
  const onMe = requests.filter(waitingOnMe).length;
  const selected = requests.find((r) => r.id === openId) ?? null;

  return (
    <>
      <section className="flex gap-[66px] px-page pt-9 pb-10">
        <Stat label="Open requests" value={open.length} caption={`${onMe} waiting on you`} size="lg" />
        <Stat label="In approval" value={formatMoneyWhole(pipeline)} caption="Total contract value" size="lg" />
        <Stat label="Avg. time to approve" value="3.4 days" caption="Last 90 days" size="lg" />
        <Stat label="Saved through negotiation" value={formatMoney(18420)} caption="This quarter" size="lg" tone="money" />
      </section>

      <DataToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search requests, vendors, requesters..."
        filterCount={(status ? 1 : 0) + (mine ? 1 : 0)}
        onClearFilters={() => {
          setStatus(null);
          setMine(false);
        }}
        options={[
          { label: "Export CSV", onSelect: () => toast.show("Request export started. We'll email you the CSV.", "neutral") },
          { label: "Approval workflows", onSelect: () => toast.show("Opening approval workflows", "neutral") },
        ]}
        chips={
          <>
            {mine && <FilterChip label="Waiting on" value="Me" onRemove={() => setMine(false)} />}
            {status && <FilterChip label="Status" value={requestStatusLabels[status]} onRemove={() => setStatus(null)} />}
          </>
        }
        filterMenu={(close) => (
          <>
            <MenuItem selected={mine} onSelect={() => { setMine(true); close(); }}>
              Waiting on me
            </MenuItem>
            <MenuDivider />
            <MenuLabel>Status</MenuLabel>
            {statuses.map((value) => (
              <MenuItem key={value} selected={status === value} onSelect={() => { setStatus(value); close(); }}>
                {requestStatusLabels[value]}
              </MenuItem>
            ))}
          </>
        )}
      />

      <Table className="border-t border-line" minWidth={1320}>
        <THead>
          <tr>
            <Th>Request</Th>
            <Th className="w-[180px]">Requester</Th>
            <Th className="w-[170px]">Vendor</Th>
            <Th className="w-[130px]" align="right">
              Amount
            </Th>
            <Th className="w-[220px]">Stage</Th>
            <Th className="w-[124px]">Status</Th>
            <Th className="w-[120px]">Due</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((r) => (
            <Tr key={r.id} onClick={() => setOpenId(r.id)}>
              <Td className="h-[62px]">
                <CellStack
                  primary={
                    <span className="flex items-center gap-2 text-[13px]">
                      {r.title}
                      {waitingOnMe(r) && <span className="size-1.5 shrink-0 rounded-full bg-warning" title="Waiting on you" />}
                    </span>
                  }
                  secondary={
                    <span className="tabular">
                      {r.id} · {r.type}
                    </span>
                  }
                />
              </Td>
              <Td>
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={r.requester} size={22} />
                  <span className="truncate">{r.requester}</span>
                </span>
              </Td>
              <Td>
                <span className="flex min-w-0 items-center gap-2">
                  <MerchantLogo name={r.vendor} size={22} />
                  <span className="truncate">{r.vendor}</span>
                </span>
              </Td>
              <Td align="right">
                <div className="leading-tight">
                  <div className="text-ink">{formatMoney(r.amount)}</div>
                  <div className="mt-0.5 text-[12px] text-ink-3">{r.term}</div>
                </div>
              </Td>
              <Td>
                <StageProgress request={r} />
              </Td>
              <Td>
                <RequestTag status={r.status} />
              </Td>
              <Td>
                <DueCell request={r} />
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <ClipboardList className="size-7 stroke-[1.25] text-ink-4" />
          <p className="mt-3 text-[15px] text-ink">No requests</p>
          <p className="mt-1 text-[13px] text-ink-2">Nothing matches the current filters.</p>
        </div>
      )}

      <div className="flex-1" />
      <TableFooter
        right={
          <>
            <span>{pluralize(rows.length, "request")}</span>
            <span>·</span>
            <span>{formatMoney(rows.reduce((sum, r) => sum + r.amount, 0))} USD</span>
          </>
        }
      />

      <RequestDrawer request={selected} onClose={() => setOpenId(null)} />
    </>
  );
}
