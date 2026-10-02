"use client";

import { Columns3, RefreshCw, Rows3, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { PageHeader } from "@/components/ui/page-header";
import { Progress, Stat } from "@/components/ui/stat";
import { CellStack, EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { daysFromToday, seatApps, type SeatApp } from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";

type View = "all" | "low";

const utilization = (app: SeatApp) => Math.round((app.active / app.purchased) * 100);
const savingsFor = (app: SeatApp) => Math.round(app.inactive.length * app.costPerSeat);

/** Vendors › Seat Intelligence (Beta): license utilization per SaaS app. */
export function SeatIntelligence() {
  const toast = useToast();
  const [apps, setApps] = useState(seatApps);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("all");
  const [reclaiming, setReclaiming] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps
      .filter((a) => !q || `${a.vendor} ${a.plan}`.toLowerCase().includes(q))
      .filter((a) => view === "all" || utilization(a) < 70)
      .sort((a, b) => savingsFor(b) - savingsFor(a));
  }, [apps, query, view]);

  const purchased = apps.reduce((s, a) => s + a.purchased, 0);
  const active = apps.reduce((s, a) => s + a.active, 0);
  const savings = apps.reduce((s, a) => s + savingsFor(a), 0);
  const app = apps.find((a) => a.vendor === reclaiming) ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Vendors"
        eyebrowHref="/vendors"
        title={
          <span className="inline-flex items-center gap-3">
            Seat Intelligence
            <Tag tone="beta" className="h-6 px-2.5 text-[13px] tracking-normal">
              Beta
            </Tag>
          </span>
        }
        actions={
          <Button size="lg" className="gap-2" onClick={() => toast.show("Seat activity synced from Okta, Google Workspace and Rippling")}>
            <RefreshCw className="size-4 stroke-[1.5]" />
            Sync activity
          </Button>
        }
      />
      <p className="mt-3 px-page text-[14px] text-ink-2">
        License activity from Okta, Google Workspace and Rippling · Last synced today at 9:41 AM
      </p>

      <section className="px-page pt-10 pb-12">
        <div className="flex flex-wrap gap-x-[66px] gap-y-6">
          <Stat label="Paid seats" value={purchased} caption={`Across ${pluralize(apps.length, "app")}`} />
          <Stat label="Active in the last 30 days" value={active} caption={`${purchased - active} inactive`} />
          <Stat label="Utilization" value={`${Math.round((active / purchased) * 100)}%`} caption="Company-wide" />
          <Stat label="Potential annual savings" value={formatMoney(savings)} tone="money" caption="By reclaiming inactive seats" />
        </div>
      </section>

      <Toolbar>
        <ToolbarRow className="min-h-[50px]">
          <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search or add filter..." />
          <div className="flex items-center gap-1.5">
            {(
              [
                ["all", "All apps", apps.length],
                ["low", "Under 70% utilized", apps.filter((a) => utilization(a) < 70).length],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] transition-colors",
                  view === value ? "bg-ink text-canvas" : "border border-line-strong bg-canvas text-ink-1 hover:bg-muted",
                )}
              >
                {label}
                <span className={cn("tabular", view === value ? "text-canvas/70" : "text-ink-3")}>{count}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2.5">
            <IconButton label="Row density">
              <Rows3 />
            </IconButton>
            <IconButton label="Columns">
              <Columns3 />
            </IconButton>
          </div>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1180}>
        <THead>
          <tr>
            <Th className="w-[21%]">App</Th>
            <Th className="w-[9%]" align="right">
              Licenses
            </Th>
            <Th className="w-[9%]" align="right">
              Active seats
            </Th>
            <Th className="w-[15%]">Utilization</Th>
            <Th className="w-[16%]">Inactive users</Th>
            <Th className="w-[10%]" align="right">
              Cost per seat
            </Th>
            <Th className="w-[11%]" align="right" sort="desc">
              Potential savings
            </Th>
            <Th>Action</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((a) => {
            const pct = utilization(a);
            return (
              <Tr key={a.vendor} interactive={false} className="hover:bg-subtle/60">
                <Td className="h-[62px]">
                  <div className="flex items-center gap-4">
                    <MerchantLogo name={a.vendor} size={32} />
                    <CellStack primary={a.vendor} secondary={`${a.plan} · via ${a.source}`} />
                  </div>
                </Td>
                <Td align="right" className="text-[14px] text-ink">
                  {a.purchased}
                </Td>
                <Td align="right" className="text-[14px] text-ink">
                  {a.active}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <Progress value={pct} tone={pct < 60 ? "warning" : "ink"} className="w-[96px]" />
                    <span className={cn("text-[13px] tabular", pct < 60 ? "text-warning" : "text-ink-1")}>{pct}%</span>
                  </div>
                </Td>
                <Td>
                  {a.inactive.length ? (
                    <span className="flex items-center gap-2.5">
                      <AvatarStack names={a.inactive.map((s) => s.name)} size={24} max={3} />
                      <span className="text-[12px] text-ink-2">{a.inactive.length} inactive</span>
                    </span>
                  ) : (
                    <span className="text-ink-3">None</span>
                  )}
                </Td>
                <Td align="right">
                  <CellStack primary={<span className="text-[13px]">{formatMoney(a.costPerSeat)}</span>} secondary="per year" />
                </Td>
                <Td align="right">
                  {savingsFor(a) > 0 ? (
                    <span className="text-[14px] text-money">{formatMoneyWhole(savingsFor(a))}</span>
                  ) : (
                    <span className="text-ink-3">$0</span>
                  )}
                </Td>
                <Td>
                  {a.inactive.length ? (
                    <Button size="xs" onClick={() => setReclaiming(a.vendor)}>
                      Reclaim seats
                    </Button>
                  ) : (
                    <Status tone="success">Fully utilized</Status>
                  )}
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && <EmptyState icon={<UsersRound />} title="No apps found" description="Try a different search or filter." />}

      <div className="flex-1" />
      <TableFooter
        left={<span>{pluralize(rows.length, "app")}</span>}
        right={<span>{formatMoney(rows.reduce((s, a) => s + savingsFor(a), 0))} potential annual savings</span>}
      />

      <ReclaimDialog
        app={app}
        onClose={() => setReclaiming(null)}
        onReclaim={(target, names) => {
          setApps((current) =>
            current.map((a) =>
              a.vendor === target.vendor
                ? { ...a, purchased: a.purchased - names.length, inactive: a.inactive.filter((s) => !names.includes(s.name)) }
                : a,
            ),
          );
          setReclaiming(null);
          toast.show(
            `${pluralize(names.length, "seat")} reclaimed from ${target.vendor} · saving ${formatMoneyWhole(names.length * target.costPerSeat)}/yr`,
          );
        }}
      />
    </div>
  );
}

function ReclaimDialog({
  app,
  onClose,
  onReclaim,
}: {
  app: SeatApp | null;
  onClose: () => void;
  onReclaim: (app: SeatApp, names: string[]) => void;
}) {
  return (
    <Dialog open={!!app} onClose={onClose} className="max-w-[560px]">
      {/* Keyed so the selection resets for every app. */}
      {app && <ReclaimForm key={app.vendor} app={app} onClose={onClose} onReclaim={onReclaim} />}
    </Dialog>
  );
}

function ReclaimForm({
  app,
  onClose,
  onReclaim,
}: {
  app: SeatApp;
  onClose: () => void;
  onReclaim: (app: SeatApp, names: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(app.inactive.map((s) => s.name)));
  const all = selected.size === app.inactive.length;
  const toggle = (name: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <>
      <DialogHeader
        title={`Reclaim ${app.vendor} seats`}
        description={`These people haven't signed in to ${app.vendor} in 30+ days. Ramp removes their licenses and lowers your seat count at the next billing cycle.`}
        onClose={onClose}
      />
      <div className="mt-3 border-y border-line">
        <div className="flex h-10 items-center gap-3 bg-subtle px-6 text-[12px] text-ink-2">
          <Checkbox
            label="Select all"
            checked={all}
            indeterminate={!all && selected.size > 0}
            onChange={(checked) => setSelected(checked ? new Set(app.inactive.map((s) => s.name)) : new Set())}
          />
          <span className="flex-1">Inactive users ({app.inactive.length})</span>
          <span>Last active</span>
        </div>
        <ul className="max-h-[300px] overflow-y-auto scrollbar-thin">
          {app.inactive.map((seat) => (
            <li key={seat.name}>
              <label className="flex h-[52px] cursor-pointer items-center gap-3 border-t border-line-soft px-6 hover:bg-subtle">
                <Checkbox label={`Select ${seat.name}`} checked={selected.has(seat.name)} onChange={() => toggle(seat.name)} />
                <Avatar name={seat.name} size={28} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[13px] text-ink">{seat.name}</span>
                  <span className="block truncate text-[12px] text-ink-2">{seat.email}</span>
                </span>
                <span className="text-right text-[12px] leading-tight text-ink-2">
                  <span className="block text-ink-1">{formatDate(seat.lastActive)}</span>
                  <span className="block">{-daysFromToday(seat.lastActive)} days ago</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <span className="text-[13px] text-ink-2">
          Save <span className="text-money tabular">{formatMoneyWhole(selected.size * app.costPerSeat)}</span> per year
        </span>
        <div className="flex gap-2">
          <Button size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" disabled={selected.size === 0} onClick={() => onReclaim(app, [...selected])}>
            Reclaim {pluralize(selected.size, "seat")}
          </Button>
        </div>
      </div>
    </>
  );
}
