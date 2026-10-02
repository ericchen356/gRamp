"use client";

import { CalendarClock, Columns3, MoreVertical, Rows3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Count, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuItem, Popover } from "@/components/ui/popover";
import { Stat } from "@/components/ui/stat";
import { CellStack, EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { TODAY, daysFromToday, vendors, type Vendor } from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatDate, formatDateLong, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";

type Renewal = Vendor & { nextRenewal: string; days: number; noticeBy: string };
type View = "all" | "auto" | "decision";

const WEEKS = 13;
const DAY = 86_400_000;

function addDays(iso: string, days: number) {
  return new Date(new Date(`${iso}T12:00:00`).getTime() + days * DAY).toISOString().slice(0, 10);
}

/** Monday of the week containing TODAY. */
function weekStart(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return addDays(iso, -((date.getDay() + 6) % 7));
}

const seed: Renewal[] = vendors
  .filter((v): v is Vendor & { nextRenewal: string } => !!v.nextRenewal && daysFromToday(v.nextRenewal) <= 90)
  .map((v) => ({ ...v, days: daysFromToday(v.nextRenewal), noticeBy: addDays(v.nextRenewal, -(v.contract.noticeDays ?? 0)) }))
  .sort((a, b) => a.days - b.days);

const groups = [
  { label: "Upcoming in 30 days", min: 0, max: 30 },
  { label: "Upcoming in 60 days", min: 31, max: 60 },
  { label: "Upcoming in 90 days", min: 61, max: 90 },
];

const views: { value: View; label: string }[] = [
  { value: "all", label: "All renewals" },
  { value: "auto", label: "Auto-renew on" },
  { value: "decision", label: "Needs decision" },
];

/** Vendors › Renewals: 13-week strip plus a grouped renewal table. */
export function VendorRenewals() {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("all");
  const [autoRenew, setAutoRenew] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(seed.map((r) => [r.id, !!r.contract.autoRenew])),
  );
  const [negotiating, setNegotiating] = useState<Set<string>>(
    () => new Set(seed.filter((r) => r.contract.status === "negotiating").map((r) => r.id)),
  );

  const needsDecision = (r: Renewal) => !autoRenew[r.id] && !negotiating.has(r.id);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seed.filter(
      (r) =>
        (!q || `${r.name} ${r.owner} ${r.category}`.toLowerCase().includes(q)) &&
        (view === "all" || (view === "auto" ? autoRenew[r.id] : !autoRenew[r.id] && !negotiating.has(r.id))),
    );
  }, [query, view, autoRenew, negotiating]);

  const total = seed.reduce((sum, r) => sum + (r.contract.value ?? 0), 0);
  const noticeSoon = seed.filter((r) => {
    const d = daysFromToday(r.noticeBy);
    return d >= 0 && d <= 14;
  }).length;

  const weeks = useMemo(() => {
    const first = weekStart(TODAY);
    return Array.from({ length: WEEKS }, (_, i) => {
      const start = addDays(first, i * 7);
      const end = addDays(start, 6);
      const items = seed.filter((r) => r.nextRenewal >= start && r.nextRenewal <= end);
      return { start, end, items, value: items.reduce((s, r) => s + (r.contract.value ?? 0), 0) };
    });
  }, []);

  const negotiate = (r: Renewal) => {
    setNegotiating((current) => new Set(current).add(r.id));
    toast.show(`Ramp's negotiation team will reach out about ${r.name} within 1 business day`);
  };

  return (
    <>
      <section className="px-page pt-[52px] pb-12">
        <div className="flex flex-wrap gap-x-[66px] gap-y-6">
          <Stat label="Renewing in the next 90 days" value={seed.length} caption={`${pluralize(seed.filter((r) => r.days <= 30).length, "renewal")} this month`} />
          <Stat label="Contract value up for renewal" value={formatMoney(total)} caption="Annualized" />
          <Stat
            label="Auto-renew on"
            value={`${Object.values(autoRenew).filter(Boolean).length} of ${seed.length}`}
            caption="Renew without review"
          />
          <Stat label="Notice deadlines in 14 days" value={noticeSoon} tone={noticeSoon ? "warning" : "default"} caption="Cancel or renegotiate before" />
        </div>

        <div className="mt-12 grid border border-line" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
          {weeks.map((week, i) => {
            const current = i === 0;
            const newMonth = i === 0 || week.start.slice(5, 7) !== weeks[i - 1].start.slice(5, 7);
            return (
              <div
                key={week.start}
                className={cn(
                  "relative flex h-[128px] min-w-0 flex-col border-l border-line px-2.5 pt-2.5 pb-3 first:border-l-0",
                  current && "bg-subtle",
                  newMonth && i > 0 && "border-l-line-strong",
                )}
              >
                {current && <span className="absolute inset-x-0 -top-px h-[2px] bg-ink" />}
                <div className="h-4 text-[12px] text-ink">
                  {newMonth ? new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(`${week.start}T12:00:00`)) : ""}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-ink-3">{current ? "This week" : `${formatDate(week.start)} – ${Number(week.end.slice(8))}`}</div>
                <div className="mt-auto">
                  {week.items.length > 0 ? (
                    <>
                      <div className="flex items-center" title={week.items.map((r) => r.name).join(", ")}>
                        {week.items.slice(0, 3).map((r, index) => (
                          <MerchantLogo key={r.id} name={r.name} size={22} className={cn("ring-2", current ? "ring-subtle" : "ring-canvas", index > 0 && "-ml-1.5")} />
                        ))}
                        {week.items.length > 3 && (
                          <span className="-ml-1.5 inline-flex size-[22px] items-center justify-center rounded-full bg-chip text-[10px] text-ink-2 ring-2 ring-canvas">
                            +{week.items.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 truncate text-[12px] text-ink-1 tabular">{formatMoneyWhole(week.value)}</div>
                    </>
                  ) : (
                    <div className="text-[12px] text-ink-4">No renewals</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Toolbar>
        <ToolbarRow className="min-h-[50px]">
          <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search or add filter..." />
          <div className="flex items-center gap-1.5">
            {views.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] transition-colors",
                  view === option.value ? "bg-ink text-canvas" : "border border-line-strong bg-canvas text-ink-1 hover:bg-muted",
                )}
              >
                {option.label}
                {option.value === "decision" && (
                  <span className={cn("tabular", view === option.value ? "text-canvas/70" : "text-ink-3")}>
                    {seed.filter(needsDecision).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2.5">
            <IconButton label="Sync renewals to calendar" onClick={() => toast.show("Renewal reminders added to your Google Calendar")}>
              <CalendarClock />
            </IconButton>
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
            <Th className="w-[24%]">Vendor</Th>
            <Th className="w-[14%]">Renewal date</Th>
            <Th className="w-[14%]">Notice deadline</Th>
            <Th className="w-[12%]" align="right">
              Contract value
            </Th>
            <Th className="w-[15%]">Owner</Th>
            <Th className="w-[11%]">Auto-renew</Th>
            <Th>Actions</Th>
          </tr>
        </THead>
        <TBody>
          {groups.map((group) => {
            const items = rows.filter((r) => r.days >= group.min && r.days <= group.max);
            if (!items.length) return null;
            return (
              <Fragment key={group.label}>
                <tr className="border-b border-line">
                  <td colSpan={7} className="h-10 bg-subtle px-page">
                    <span className="flex items-center gap-2 text-[13px] text-ink">
                      {group.label}
                      <Count value={items.length} />
                      <span className="ml-1 text-[12px] text-ink-2 tabular">
                        {formatMoney(items.reduce((s, r) => s + (r.contract.value ?? 0), 0))}
                      </span>
                    </span>
                  </td>
                </tr>
                {items.map((r) => {
                  const noticeDays = daysFromToday(r.noticeBy);
                  return (
                    <Tr key={r.id} onClick={() => router.push(`/vendors/v/${r.id}`)}>
                      <Td>
                        <div className="flex items-center gap-4">
                          <MerchantLogo name={r.name} size={32} />
                          <CellStack primary={r.name} secondary={r.contract.plan ?? r.category} />
                        </div>
                      </Td>
                      <Td>
                        <CellStack
                          primary={<span className="text-[13px]">{formatDateLong(r.nextRenewal)}</span>}
                          secondary={<span className={cn(r.days <= 14 && "text-warning")}>in {pluralize(r.days, "day")}</span>}
                        />
                      </Td>
                      <Td>
                        {r.contract.noticeDays ? (
                          <CellStack
                            primary={<span className="text-[13px]">{formatDateLong(r.noticeBy)}</span>}
                            secondary={
                              noticeDays < 0 ? (
                                <span className="text-flag">Passed {pluralize(-noticeDays, "day")} ago</span>
                              ) : (
                                <span className={cn(noticeDays <= 14 && "text-warning")}>
                                  {r.contract.noticeDays}-day notice · {noticeDays === 0 ? "today" : `in ${pluralize(noticeDays, "day")}`}
                                </span>
                              )
                            }
                          />
                        ) : (
                          <span className="text-ink-3">No notice required</span>
                        )}
                      </Td>
                      <Td align="right">
                        <CellStack
                          primary={formatMoney(r.contract.value ?? 0)}
                          secondary={r.contract.seats ? `${r.contract.seats} seats · ${r.contract.billing}` : r.contract.billing}
                        />
                      </Td>
                      <Td>
                        <span className="flex items-center gap-2 truncate">
                          <Avatar name={r.owner} size={22} />
                          {r.owner}
                        </span>
                      </Td>
                      <Td onClick={(event) => event.stopPropagation()}>
                        <span className="flex items-center gap-2.5">
                          <Switch
                            label={`Auto-renew ${r.name}`}
                            checked={autoRenew[r.id]}
                            onChange={(checked) => {
                              setAutoRenew((current) => ({ ...current, [r.id]: checked }));
                              toast.show(`Auto-renew turned ${checked ? "on" : "off"} for ${r.name}`);
                            }}
                          />
                          <span className="text-[12px] text-ink-2">{autoRenew[r.id] ? "On" : "Off"}</span>
                        </span>
                      </Td>
                      <Td onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between gap-3">
                          {negotiating.has(r.id) ? (
                            <Tag tone="info">Negotiating with Ramp</Tag>
                          ) : (
                            <Button size="xs" onClick={() => negotiate(r)}>
                              Negotiate
                            </Button>
                          )}
                          <Popover
                            align="end"
                            trigger={({ toggle }) => (
                              <IconButton variant="bare" size="sm" label={`${r.name} renewal actions`} onClick={toggle}>
                                <MoreVertical />
                              </IconButton>
                            )}
                          >
                            {(close) => (
                              <>
                                <MenuItem onSelect={() => { close(); router.push(`/vendors/v/${r.id}`); }}>View contract</MenuItem>
                                <MenuItem onSelect={() => { close(); toast.show(`Reminder set for ${formatDate(addDays(r.noticeBy, -7))}`); }}>
                                  Remind me a week before notice
                                </MenuItem>
                                <MenuItem onSelect={() => { close(); toast.show(`Renewal review requested from ${r.owner}`); }}>
                                  Ask {r.owner.split(" ")[0]} to review
                                </MenuItem>
                                <MenuItem
                                  destructive
                                  onSelect={() => {
                                    close();
                                    setAutoRenew((current) => ({ ...current, [r.id]: false }));
                                    toast.show(`${r.name} marked to cancel at renewal`);
                                  }}
                                >
                                  Cancel at renewal
                                </MenuItem>
                              </>
                            )}
                          </Popover>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Fragment>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <EmptyState icon={<CalendarClock />} title="No renewals match" description="Try a different search or view." />
      )}

      <div className="flex-1" />
      <TableFooter
        left={<span>{pluralize(rows.length, "renewal")}</span>}
        right={<span>{formatMoney(rows.reduce((s, r) => s + (r.contract.value ?? 0), 0))} contract value</span>}
      />
    </>
  );
}
