"use client";

import { ArrowRight, Columns3, Download, MoreVertical, Rows3, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuDivider, MenuItem, MenuLabel, Popover } from "@/components/ui/popover";
import { Sparkline } from "@/components/ui/sparkline";
import { Card, Stat } from "@/components/ui/stat";
import { CellStack, EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { AddFilterButton, FilterChip, SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import {
  benchmarkSavings,
  daysFromToday,
  priceBenchmarks,
  seatApps,
  vendorMonthlySpend,
  vendors,
  type ContractStatus,
  type Vendor,
} from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatDateLong, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { ContractTag, contractLabel } from "./contract-tag";
import { NewVendorDialog } from "./new-vendor-dialog";
import { SpendChart } from "./spend-chart";

type SortKey = "name" | "spend" | "renewal";
type Sort = { key: SortKey; dir: "asc" | "desc" };
export type VendorRow = Vendor & { isNew?: boolean };

const statuses: ContractStatus[] = ["active", "renewing", "negotiating", "expired", "none"];

const chartSeries = [
  { key: "card", label: "Ramp card", color: "var(--color-ink-1)" },
  { key: "bills", label: "Bill Pay", color: "var(--color-chart-sand)" },
];

/** Savings opportunities across Price + Seat Intelligence, largest first. */
function savingsOpportunities() {
  const price = priceBenchmarks
    .map((b) => ({
      vendor: b.vendor,
      amount: benchmarkSavings(b),
      reason: `${Math.round(((b.yourPrice ?? 0) / b.median - 1) * 100)}% above market median`,
      href: "/vendors/price-intelligence",
    }))
    .filter((o) => o.amount > 0);
  const seats = seatApps
    .map((app) => ({
      vendor: app.vendor,
      amount: Math.round(app.inactive.length * app.costPerSeat),
      reason: `${pluralize(app.inactive.length, "unused seat")} to reclaim`,
      href: "/vendors/seat-intelligence",
    }))
    .filter((o) => o.amount > 0);
  return [...price, ...seats].sort((a, b) => b.amount - a.amount);
}

const opportunities = savingsOpportunities();

function compare(a: VendorRow, b: VendorRow, sort: Sort) {
  const dir = sort.dir === "asc" ? 1 : -1;
  if (sort.key === "name") return a.name.localeCompare(b.name) * dir;
  if (sort.key === "spend") return (a.spend12mo - b.spend12mo) * dir;
  // Vendors without a renewal always sink to the bottom.
  if (!a.nextRenewal) return 1;
  if (!b.nextRenewal) return -1;
  return a.nextRenewal.localeCompare(b.nextRenewal) * dir;
}

export function VendorsOverview() {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<VendorRow[]>(vendors);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus | null>(null);
  const [sort, setSort] = useState<Sort>({ key: "spend", dir: "desc" });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((v) => !statusFilter || v.contract.status === statusFilter)
      .filter((v) => !q || `${v.name} ${v.category} ${v.owner}`.toLowerCase().includes(q))
      .sort((a, b) => compare(a, b, sort));
  }, [rows, query, statusFilter, sort]);

  const potentialSavings = opportunities.reduce((sum, o) => sum + o.amount, 0);
  const spendYtd = rows.reduce((sum, v) => sum + v.spendYtd, 0);
  const upcoming = rows.filter((v) => v.nextRenewal && daysFromToday(v.nextRenewal) <= 90);
  const upcomingValue = upcoming.reduce((sum, v) => sum + (v.contract.value ?? 0), 0);

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "spend" ? "desc" : "asc" },
    );
  const sortFor = (key: SortKey) => (sort.key === key ? sort.dir : null);

  const open = (vendor: VendorRow) =>
    vendor.isNew
      ? toast.show(`We're still enriching ${vendor.name}'s profile`, "neutral")
      : router.push(`/vendors/v/${vendor.id}`);

  return (
    <>
      <section className="px-page pt-[52px] pb-12">
        <div className="flex flex-wrap gap-x-[66px] gap-y-6">
          <Stat label="Total vendor spend YTD" value={formatMoney(spendYtd)} caption="Jan 1 – Oct 2, 2026" />
          <Stat label="Active vendors" value={rows.length} caption="Paid in the last 12 months" />
          <Stat
            label="Upcoming renewals"
            value={upcoming.length}
            caption={
              <Link href="/vendors/renewals" className="hover:text-ink">
                {formatMoneyWhole(upcomingValue)} in the next 90 days
              </Link>
            }
          />
          <Stat
            label="Potential savings"
            value={formatMoney(potentialSavings)}
            tone="money"
            info
            caption={`Across ${pluralize(new Set(opportunities.map((o) => o.vendor)).size, "vendor")}`}
          />
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)_320px] gap-12">
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] leading-snug tracking-[-0.015em] text-ink">Spend by month</h2>
              <div className="flex items-center gap-5 text-[12px] text-ink-2">
                {chartSeries.map((s) => (
                  <span key={s.key} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-[1px]" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
            <SpendChart data={vendorMonthlySpend} series={chartSeries} height={300} />
          </div>

          <Card tone="subtle" className="flex flex-col p-5">
            <div className="text-[12px] text-ink-2">Savings opportunities</div>
            <div className="mt-1 text-[26px] leading-[1.1] tracking-[-0.02em] text-money tabular">
              {formatMoneyWhole(potentialSavings)}
              <span className="text-[15px] tracking-normal text-ink-3"> / year</span>
            </div>
            <ul className="mt-4 flex-1">
              {opportunities.slice(0, 4).map((o) => (
                <li key={`${o.vendor}-${o.href}`}>
                  <Link href={o.href} className="flex items-center gap-3 border-t border-line py-2.5 hover:opacity-80">
                    <MerchantLogo name={o.vendor} size={24} />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[13px] text-ink">{o.vendor}</span>
                      <span className="block truncate text-[12px] text-ink-2">{o.reason}</span>
                    </span>
                    <span className="text-[13px] text-money tabular">{formatMoneyWhole(o.amount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/vendors/price-intelligence"
              className="mt-3 flex h-9 items-center justify-between rounded-[2px] border border-line-strong bg-canvas px-3 text-[13px] text-ink hover:border-ink-5"
            >
              View Price Intelligence
              <ArrowRight className="size-4 stroke-[1.5]" />
            </Link>
          </Card>
        </div>
      </section>

      <Toolbar>
        <ToolbarRow className="min-h-[50px]">
          <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search or add filter..." />
          {statusFilter ? (
            <FilterChip label="Contract" value={contractLabel(statusFilter)} onRemove={() => setStatusFilter(null)} />
          ) : (
            <Popover trigger={({ toggle }) => <AddFilterButton onClick={toggle} />}>
              {(close) => (
                <>
                  <MenuLabel>Contract status</MenuLabel>
                  {statuses.map((status) => (
                    <MenuItem
                      key={status}
                      hint={rows.filter((v) => v.contract.status === status).length}
                      onSelect={() => {
                        setStatusFilter(status);
                        close();
                      }}
                    >
                      {contractLabel(status)}
                    </MenuItem>
                  ))}
                </>
              )}
            </Popover>
          )}
          <div className="ml-auto flex gap-2.5">
            <IconButton label="Export vendors" onClick={() => toast.show("Vendor list exported to CSV")}>
              <Download />
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
            <Th className="w-[22%] cursor-pointer select-none" sort={sortFor("name")} onClick={() => toggleSort("name")}>
              Vendor
            </Th>
            <Th className="w-[13%]">Owner</Th>
            <Th className="w-[12%] cursor-pointer select-none" align="right" sort={sortFor("spend")} onClick={() => toggleSort("spend")}>
              Spend · last 12 mo
            </Th>
            <Th className="w-[118px]">Trend</Th>
            <Th className="w-[10%]">Payment methods</Th>
            <Th className="w-[11%]">Contract</Th>
            <Th className="min-w-[190px] cursor-pointer select-none" sort={sortFor("renewal")} onClick={() => toggleSort("renewal")}>
              Next renewal
            </Th>
            <Th className="w-[60px]" aria-label="Actions" />
          </tr>
        </THead>
        <TBody>
          {visible.map((vendor) => (
            <Tr key={vendor.id} onClick={() => open(vendor)}>
              <Td className="h-[62px]">
                <div className="flex items-center gap-4">
                  <MerchantLogo name={vendor.name} size={32} />
                  <CellStack primary={vendor.name} secondary={vendor.category} />
                </div>
              </Td>
              <Td>
                <span className="flex items-center gap-2 truncate">
                  <Avatar name={vendor.owner} size={22} />
                  {vendor.owner}
                </span>
              </Td>
              <Td align="right">
                <div className="leading-tight">
                  <div className="text-[14px] text-ink">{formatMoney(vendor.spend12mo)}</div>
                  <div className="mt-0.5 text-[12px] text-ink-2">{pluralize(vendor.transactionCount, "payment")}</div>
                </div>
              </Td>
              <Td>
                <Sparkline
                  data={vendor.trend.some(Boolean) ? vendor.trend : [0, 0]}
                  width={88}
                  height={24}
                  stroke="var(--color-ink-3)"
                  fill="var(--color-chart-sand)"
                />
              </Td>
              <Td>{vendor.paymentMethods.join(" · ")}</Td>
              <Td>
                <ContractTag status={vendor.contract.status} />
              </Td>
              <Td>
                <RenewalCell vendor={vendor} />
              </Td>
              <Td className="pr-[40px]! text-right" onClick={(event) => event.stopPropagation()}>
                <Popover
                  align="end"
                  trigger={({ toggle }) => (
                    <IconButton variant="bare" size="sm" label={`${vendor.name} actions`} onClick={toggle}>
                      <MoreVertical />
                    </IconButton>
                  )}
                >
                  {(close) => (
                    <>
                      <MenuItem onSelect={() => { close(); open(vendor); }}>View vendor</MenuItem>
                      <MenuItem onSelect={() => { close(); router.push("/bill-pay?new=1"); }}>Create bill</MenuItem>
                      <MenuItem onSelect={() => { close(); toast.show(`W-9 request sent to ${vendor.contactEmail}`); }}>Request W-9</MenuItem>
                      <MenuDivider />
                      <MenuItem
                        destructive
                        onSelect={() => {
                          close();
                          setRows((current) => current.filter((v) => v.id !== vendor.id));
                          toast.show(`${vendor.name} archived`);
                        }}
                      >
                        Archive vendor
                      </MenuItem>
                    </>
                  )}
                </Popover>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      {visible.length === 0 && (
        <EmptyState icon={<Store />} title="No vendors found" description="Try a different search or remove the contract filter." />
      )}

      <div className="flex-1" />
      <TableFooter
        left={<span>{pluralize(visible.length, "vendor")}</span>}
        right={<span>{formatMoney(visible.reduce((sum, v) => sum + v.spend12mo, 0))} spend in the last 12 months</span>}
      />

      <Suspense fallback={null}>
        <NewVendorDialog
          onCreate={(vendor) => {
            setRows((current) => [vendor, ...current]);
            setSort({ key: "spend", dir: "desc" });
            toast.show(`${vendor.name} added to your vendors`);
          }}
        />
      </Suspense>
    </>
  );
}

function RenewalCell({ vendor }: { vendor: VendorRow }) {
  if (vendor.contract.status === "expired" && vendor.contract.end) {
    return (
      <div className="leading-tight whitespace-nowrap">
        <div className="text-[13px] text-ink-3">Ended {formatDateLong(vendor.contract.end)}</div>
        <div className="mt-0.5 text-[12px] text-flag">Contract expired</div>
      </div>
    );
  }
  if (!vendor.nextRenewal) {
    return <span className="text-ink-3">{vendor.contract.billing === "Usage-based" ? "Usage-based" : "Month-to-month"}</span>;
  }
  const days = daysFromToday(vendor.nextRenewal);
  return (
    <div className="leading-tight whitespace-nowrap">
      <div className="text-[13px] text-ink-1">{formatDateLong(vendor.nextRenewal)}</div>
      <div className={cn("mt-0.5 text-[12px]", days <= 30 ? "text-warning" : "text-ink-2")}>
        in {pluralize(days, "day")}
        {vendor.contract.autoRenew ? " · Auto-renews" : ""}
      </div>
    </div>
  );
}
