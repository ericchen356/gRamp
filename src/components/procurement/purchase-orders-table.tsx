"use client";

import { PackageCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuItem, MenuLabel } from "@/components/ui/popover";
import { DetailRow, Progress, Stat } from "@/components/ui/stat";
import { CellStack, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { FilterChip } from "@/components/ui/toolbar";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { purchaseOrderStatusLabels, type PurchaseOrder, type PurchaseOrderStatus } from "@/data/procurement";
import { formatDate, formatDateLong, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { useProcurement } from "./procurement-store";
import { OrderStatus } from "./request-parts";

const statuses: PurchaseOrderStatus[] = ["open", "partially_received", "closed", "draft", "cancelled"];

function Meter({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between text-[12px] tabular">
        <span className="text-ink-1">{formatMoneyWhole(value)}</span>
        <span className="text-ink-3">{label ?? `${pct}%`}</span>
      </div>
      <Progress value={value} max={max} tone={pct === 100 ? "positive" : "ink"} className="mt-1.5" />
    </div>
  );
}

/** Procurement › Purchase orders: what's been committed, received and billed. */
export function PurchaseOrdersTable() {
  const { orders, updateOrder } = useProcurement();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PurchaseOrderStatus | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) => (!status || o.status === status) && (!q || `${o.id} ${o.vendor} ${o.description} ${o.owner}`.toLowerCase().includes(q)),
    );
  }, [orders, status, query]);

  const live = orders.filter((o) => o.status === "open" || o.status === "partially_received");
  const committed = live.reduce((sum, o) => sum + o.amount, 0);
  const toReceive = live.reduce((sum, o) => sum + (o.amount - o.received), 0);
  const unbilled = live.reduce((sum, o) => sum + (o.received - o.billed), 0);
  const selected = orders.find((o) => o.id === openId) ?? null;

  const receiveAll = (o: PurchaseOrder) => {
    updateOrder(o.id, { received: o.amount, status: o.billed >= o.amount ? "closed" : "open" });
    toast.show(`All items on ${o.id} marked received`);
  };

  return (
    <>
      <section className="flex gap-[66px] px-page pt-9 pb-10">
        <Stat label="Open commitments" value={formatMoney(committed)} caption={pluralize(live.length, "open PO")} size="lg" />
        <Stat label="Awaiting receipt" value={formatMoney(toReceive)} caption="Goods and services not yet received" size="lg" />
        <Stat label="Received, not billed" value={formatMoney(unbilled)} caption="Accrual candidates" size="lg" />
      </section>

      <DataToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search PO number, vendor, owner..."
        filterCount={status ? 1 : 0}
        onClearFilters={() => setStatus(null)}
        options={[
          { label: "Export CSV", onSelect: () => toast.show("PO export started. We'll email you the CSV.", "neutral") },
          { label: "Three-way match settings", onSelect: () => toast.show("Opening three-way match settings", "neutral") },
        ]}
        chips={status && <FilterChip label="Status" value={purchaseOrderStatusLabels[status]} onRemove={() => setStatus(null)} />}
        filterMenu={(close) => (
          <>
            <MenuLabel>Status</MenuLabel>
            {statuses.map((value) => (
              <MenuItem key={value} selected={status === value} onSelect={() => { setStatus(value); close(); }}>
                {purchaseOrderStatusLabels[value]}
              </MenuItem>
            ))}
          </>
        )}
      />

      <Table className="border-t border-line" minWidth={1320}>
        <THead>
          <tr>
            <Th>Purchase order</Th>
            <Th className="w-[170px]">Vendor</Th>
            <Th className="w-[170px]">Owner</Th>
            <Th className="w-[130px]" align="right">
              Amount
            </Th>
            <Th className="w-[160px]">Received</Th>
            <Th className="w-[160px]">Billed</Th>
            <Th className="w-[96px]" sort="desc">
              Issued
            </Th>
            <Th className="w-[172px]">Status</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((o) => (
            <Tr key={o.id} onClick={() => setOpenId(o.id)} className={o.status === "cancelled" ? "[&_td]:text-ink-3" : undefined}>
              <Td className="h-[62px]">
                <CellStack primary={<span className="text-[13px] tabular">{o.id}</span>} secondary={o.description} />
              </Td>
              <Td>
                <span className="flex min-w-0 items-center gap-2">
                  <MerchantLogo name={o.vendor} size={22} />
                  <span className="truncate">{o.vendor}</span>
                </span>
              </Td>
              <Td>
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={o.owner} size={22} />
                  <span className="truncate">{o.owner}</span>
                </span>
              </Td>
              <Td align="right" className="text-ink">
                {formatMoney(o.amount)}
              </Td>
              <Td>
                <Meter value={o.received} max={o.amount} />
              </Td>
              <Td>
                <Meter value={o.billed} max={o.amount} />
              </Td>
              <Td className="text-ink-2">{formatDate(o.issued)}</Td>
              <Td className="whitespace-nowrap">
                <OrderStatus status={o.status} />
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <PackageCheck className="size-7 stroke-[1.25] text-ink-4" />
          <p className="mt-3 text-[15px] text-ink">No purchase orders</p>
          <p className="mt-1 text-[13px] text-ink-2">Nothing matches the current filters.</p>
        </div>
      )}
      <div className="flex-1" />
      <TableFooter
        right={
          <>
            <span>{pluralize(rows.length, "purchase order")}</span>
            <span>·</span>
            <span>{formatMoney(rows.reduce((sum, o) => sum + o.amount, 0))} USD</span>
          </>
        }
      />

      <Drawer open={!!selected} onClose={() => setOpenId(null)} title={selected ? selected.id : "Purchase order"}>
        {selected && (
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <MerchantLogo name={selected.vendor} size={40} />
              <div className="min-w-0">
                <div className="truncate text-[16px] text-ink">{selected.vendor}</div>
                <div className="truncate text-[12px] text-ink-2">{selected.description}</div>
              </div>
              <span className="ml-auto">
                <OrderStatus status={selected.status} />
              </span>
            </div>
            <div className="mt-6 text-[36px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(selected.amount)}</div>
            <div className="mt-2 text-[13px] text-ink-2">
              Issued {formatDateLong(selected.issued)} · {pluralize(selected.lines, "line item")}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-6 border-y border-line py-5">
              <div>
                <div className="mb-2 text-[12px] text-ink-2">Received</div>
                <Meter value={selected.received} max={selected.amount} />
              </div>
              <div>
                <div className="mb-2 text-[12px] text-ink-2">Billed</div>
                <Meter value={selected.billed} max={selected.amount} />
              </div>
            </div>

            <div className="mt-2">
              <DetailRow label="Owner">{selected.owner}</DetailRow>
              <DetailRow label="Linked request">{selected.request ?? "None"}</DetailRow>
              <DetailRow label="Payment terms">Net 30</DetailRow>
              <DetailRow label="Ship to">100 Congress Ave, Austin, TX</DetailRow>
            </div>

            <div className="mt-8 flex gap-2">
              {selected.status === "draft" && (
                <Button
                  variant="primary"
                  onClick={() => {
                    updateOrder(selected.id, { status: "open" });
                    toast.show(`${selected.id} sent to ${selected.vendor}`);
                  }}
                >
                  Send to vendor
                </Button>
              )}
              {(selected.status === "open" || selected.status === "partially_received") && selected.received < selected.amount && (
                <Button variant="primary" onClick={() => receiveAll(selected)}>
                  Mark all received
                </Button>
              )}
              {selected.status !== "closed" && selected.status !== "cancelled" && (
                <Button
                  onClick={() => {
                    updateOrder(selected.id, { status: "closed" });
                    toast.show(`${selected.id} closed`, "neutral");
                  }}
                >
                  Close PO
                </Button>
              )}
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
