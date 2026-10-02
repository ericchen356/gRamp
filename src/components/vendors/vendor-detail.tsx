"use client";

import { ArrowRight, FileText, MoreVertical, ReceiptText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { PageHeader } from "@/components/ui/page-header";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { Card, DetailRow, Stat } from "@/components/ui/stat";
import { CellStack, EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { bills, payFromAccount, remittanceFor, type Bill, type BillMethod } from "@/data/bills";
import { people } from "@/data/people";
import {
  benchmarkPercentile,
  benchmarkSavings,
  priceBenchmarks,
  spendMonths,
  vendorTransactions,
  type Vendor,
} from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatDateLong, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { BillStatus, billHref } from "@/components/bill-pay/bill-status";
import { ContractTag } from "./contract-tag";
import { PercentileBar } from "./percentile-bar";
import { SpendChart } from "./spend-chart";

type Tab = "overview" | "transactions" | "bills" | "contracts" | "details";

type ContractDoc = { name: string; type: string; term: string; value?: number; uploadedBy: string; uploadedOn: string; pending?: boolean };

/** Documents on file for the vendor, derived from its contract. */
function contractDocs(vendor: Vendor): ContractDoc[] {
  const c = vendor.contract;
  if (!c.start) return [];
  const term = c.end ? `${formatDateLong(c.start)} – ${formatDateLong(c.end)}` : `From ${formatDateLong(c.start)}`;
  const year = c.start.slice(0, 4);
  const docs: ContractDoc[] = [
    { name: `${vendor.name} - ${c.plan ?? "Order form"} ${year}.pdf`, type: "Order form", term, value: c.value, uploadedBy: vendor.owner, uploadedOn: c.start },
    { name: `${vendor.legalName} - Master Services Agreement.pdf`, type: "MSA", term: "Evergreen", uploadedBy: "Tina Cruz", uploadedOn: c.start },
  ];
  if (c.status === "renewing" || c.status === "negotiating") {
    docs.unshift({
      name: `${vendor.name} - Renewal quote ${Number(year) + 1}.pdf`,
      type: "Renewal quote",
      term: "12 months",
      value: Math.round((c.value ?? 0) * 1.07),
      uploadedBy: vendor.owner,
      uploadedOn: "2026-09-18",
      pending: true,
    });
  }
  return docs;
}

export function VendorDetail({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const transactions = useMemo(() => vendorTransactions(vendor), [vendor]);
  const vendorBills = useMemo(() => bills.filter((b) => b.vendor === vendor.name), [vendor.name]);
  const docs = useMemo(() => contractDocs(vendor), [vendor]);
  const benchmark = priceBenchmarks.find((b) => b.vendor === vendor.name && b.yourPrice !== null);

  const negotiate = () => toast.show(`Ramp's negotiation team will reach out about ${vendor.name} within 1 business day`);

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Vendors"
        eyebrowHref="/vendors"
        title={
          <span className="inline-flex items-center gap-4 align-middle">
            <MerchantLogo name={vendor.name} size={40} />
            {vendor.name}
          </span>
        }
        actions={
          <>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <IconButton variant="bare" label="More actions" onClick={toggle} className="mr-1.5 [&_svg]:size-[18px]">
                  <MoreVertical />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={() => { close(); setTab("details"); }}>Edit vendor details</MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show(`W-9 request sent to ${vendor.contactEmail}`); }}>Request W-9</MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show(`${vendor.name} added to the 1099 vendor list`); }}>Mark as 1099 vendor</MenuItem>
                  <MenuDivider />
                  <MenuItem destructive onSelect={() => { close(); toast.show(`${vendor.name} archived`); router.push("/vendors"); }}>
                    Archive vendor
                  </MenuItem>
                </>
              )}
            </Popover>
            <Button size="lg" onClick={negotiate}>
              Negotiate with Ramp
            </Button>
            <Button size="lg" variant="primary" onClick={() => router.push(`/bill-pay?new=1&vendor=${encodeURIComponent(vendor.name)}`)}>
              New bill
            </Button>
          </>
        }
      />
      <p className="mt-3 px-page text-[14px] text-ink-2">
        {vendor.category} · Owned by {vendor.owner} ·{" "}
        <a href={`https://${vendor.website}`} target="_blank" rel="noreferrer" className="hover:text-ink">
          {vendor.website}
        </a>
      </p>

      <Tabs
        className="mt-7"
        value={tab}
        onChange={(value) => setTab(value as Tab)}
        items={[
          { label: "Overview", value: "overview" },
          { label: "Transactions", value: "transactions", count: transactions.length },
          { label: "Bills", value: "bills", count: vendorBills.length },
          { label: "Contracts", value: "contracts", count: docs.length },
          { label: "Details", value: "details" },
        ]}
      />

      <div className="flex flex-1 flex-col">
        {tab === "overview" && (
          <OverviewTab
            vendor={vendor}
            transactions={transactions}
            benchmark={benchmark}
            onNegotiate={negotiate}
            onShowAll={() => setTab("transactions")}
            onShowContracts={() => setTab("contracts")}
          />
        )}
        {tab === "transactions" && <TransactionsTab vendor={vendor} transactions={transactions} />}
        {tab === "bills" && <BillsTab vendor={vendor} bills={vendorBills} />}
        {tab === "contracts" && <ContractsTab vendor={vendor} docs={docs} />}
        {tab === "details" && <DetailsTab vendor={vendor} />}
      </div>
    </div>
  );
}

/* ---------------------------------- Overview --------------------------------- */

function OverviewTab({
  vendor,
  transactions,
  benchmark,
  onNegotiate,
  onShowAll,
  onShowContracts,
}: {
  vendor: Vendor;
  transactions: ReturnType<typeof vendorTransactions>;
  benchmark?: (typeof priceBenchmarks)[number];
  onNegotiate: () => void;
  onShowAll: () => void;
  onShowContracts: () => void;
}) {
  const toast = useToast();
  const [autoRenew, setAutoRenew] = useState(!!vendor.contract.autoRenew);
  const owner = people.find((p) => p.name === vendor.owner);
  const chartData = spendMonths.map((month, i) => ({ month, spend: vendor.trend[i] }));
  const c = vendor.contract;

  return (
    <>
      <section className="grid grid-cols-[minmax(0,1fr)_340px] gap-12 px-page pt-10 pb-12">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-x-[56px] gap-y-6">
            <Stat label="Spend · last 12 months" value={formatMoney(vendor.spend12mo)} />
            <Stat label="Spend YTD" value={formatMoney(vendor.spendYtd)} />
            <Stat label="Average per month" value={formatMoney(vendor.spend12mo / 12)} />
          </div>
          <div className="mt-10">
            <SpendChart data={chartData} series={[{ key: "spend", label: vendor.name, color: "var(--color-chart-sand)" }]} height={240} highlightLast />
          </div>

          <VendorFacts vendor={vendor} transactions={transactions} />

          {benchmark && (
            <Card className="mt-6 p-5">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[12px] text-ink-2">
                    Price Intelligence
                    <Tag tone="new" className="h-[18px] px-1.5 text-[11px]">New</Tag>
                  </div>
                  <p className="mt-2 text-[20px] leading-snug tracking-[-0.015em] text-ink">
                    You pay {formatMoneyWhole(benchmark.yourPrice ?? 0)} per {benchmark.unit.split(" / ")[0]}, median is {formatMoneyWhole(benchmark.median)}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-2">
                    {benchmark.product} · {benchmarkPercentile(benchmark)}th percentile across {benchmark.sample.toLocaleString("en-US")} companies
                  </p>
                </div>
                {benchmarkSavings(benchmark) > 0 ? (
                  <div className="shrink-0 text-right">
                    <div className="text-[12px] text-ink-2">Potential savings</div>
                    <div className="mt-1 text-[22px] leading-none tracking-[-0.02em] text-money tabular">
                      {formatMoneyWhole(benchmarkSavings(benchmark))}
                      <span className="text-[14px] tracking-normal text-ink-3"> / year</span>
                    </div>
                  </div>
                ) : (
                  <Status tone="success">Fair price</Status>
                )}
              </div>
              <div className="mt-5 flex items-end gap-8">
                <PercentileBar p25={benchmark.p25} median={benchmark.median} p75={benchmark.p75} value={benchmark.yourPrice} className="flex-1" />
                <Button size="sm" onClick={onNegotiate} className="mb-4">
                  Negotiate with Ramp
                </Button>
              </div>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] text-ink">Contract</h3>
              <ContractTag status={c.status} />
            </div>
            <div className="mt-2">
              <DetailRow label="Plan">{c.plan ?? `${c.billing} billing`}</DetailRow>
              {c.start && c.end && (
                <DetailRow label="Term">
                  {formatDateLong(c.start)} – {formatDateLong(c.end)}
                </DetailRow>
              )}
              {c.value !== undefined && <DetailRow label="Annual value">{formatMoney(c.value)}</DetailRow>}
              {c.seats !== undefined && <DetailRow label="Seats">{c.seats}</DetailRow>}
              {vendor.nextRenewal && (
                <>
                  <DetailRow label="Renews">{formatDateLong(vendor.nextRenewal)}</DetailRow>
                  <DetailRow label="Auto-renew">
                    <Switch
                      label="Auto-renew"
                      checked={autoRenew}
                      onChange={(checked) => {
                        setAutoRenew(checked);
                        toast.show(`Auto-renew turned ${checked ? "on" : "off"} for ${vendor.name}`);
                      }}
                    />
                  </DetailRow>
                </>
              )}
              {c.status !== "none" && (
                <button type="button" onClick={onShowContracts} className="flex w-full items-center justify-between py-3 text-[13px] text-ink hover:text-ink-2">
                  View contract documents
                  <ArrowRight className="size-4 stroke-[1.5]" />
                </button>
              )}
            </div>
          </Card>

          <Card className="px-5 py-4">
            <h3 className="text-[14px] text-ink">Owner</h3>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={vendor.owner} size={32} />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13px] text-ink">{vendor.owner}</div>
                <div className="mt-0.5 truncate text-[12px] text-ink-2">
                  {owner?.title ?? "Vendor owner"} · {vendor.department}
                </div>
              </div>
            </div>
          </Card>

          <Card className="px-5 pt-4 pb-1">
            <h3 className="text-[14px] text-ink">Payment details</h3>
            <div className="mt-2">
              <DetailRow label="Methods">{vendor.paymentMethods.join(" · ")}</DetailRow>
              <DetailRow label="Pay from">
                {payFromAccount.name} ···· {payFromAccount.last4}
              </DetailRow>
              <DetailRow label="Remit to">{remittanceFor({ vendor: vendor.name, method: (vendor.paymentMethods.find((m) => m !== "Card") ?? "Card") as BillMethod })}</DetailRow>
              <DetailRow label="Terms">{vendor.paymentTerms}</DetailRow>
              <DetailRow label="W-9">{vendor.w9 ? <Status tone="success">On file</Status> : <Status tone="warning">Missing</Status>}</DetailRow>
            </div>
          </Card>
        </aside>
      </section>

      <Toolbar>
        <ToolbarRow className="min-h-[50px] justify-between">
          <h2 className="text-[16px] tracking-[-0.01em] text-ink">Recent transactions</h2>
          <Button size="xs" variant="ghost" onClick={onShowAll} className="gap-1.5">
            View all {transactions.length}
            <ArrowRight className="size-3.5 stroke-[1.5]" />
          </Button>
        </ToolbarRow>
      </Toolbar>
      <TransactionTable rows={transactions.slice(0, 5)} />
    </>
  );
}

/** Next payment, quarter-over-quarter change and card cashback under the chart. */
function VendorFacts({ vendor, transactions }: { vendor: Vendor; transactions: ReturnType<typeof vendorTransactions> }) {
  const last = transactions[0];
  const recent = vendor.trend.slice(9).reduce((a, b) => a + b, 0);
  const prior = vendor.trend.slice(6, 9).reduce((a, b) => a + b, 0);
  const change = prior > 0 ? Math.round(((recent - prior) / prior) * 100) : null;
  const cashback = transactions.filter((t) => t.method === "Card").reduce((sum, t) => sum + t.amount, 0) * 0.015;
  const recurring = vendor.contract.billing === "Monthly" || vendor.contract.billing === "Usage-based";
  const nextDate = recurring && last ? `2026-10-${last.date.slice(8)}` : vendor.nextRenewal;

  return (
    <div className="mt-10 grid grid-cols-3 border border-line">
      <div className="px-5 py-4">
        <div className="text-[12px] text-ink-2">Next expected payment</div>
        <div className="mt-1 text-[18px] tracking-[-0.01em] text-ink tabular">
          {nextDate ? formatMoney(recurring ? (last?.amount ?? 0) : (vendor.contract.value ?? vendor.spend12mo)) : "None scheduled"}
        </div>
        <div className="mt-0.5 text-[12px] text-ink-2">{nextDate ? `${formatDateLong(nextDate)} · ${vendor.contract.billing}` : vendor.contract.billing}</div>
      </div>
      <div className="border-l border-line px-5 py-4">
        <div className="text-[12px] text-ink-2">Last 3 months</div>
        <div className="mt-1 text-[18px] tracking-[-0.01em] text-ink tabular">{formatMoney(recent)}</div>
        <div className={cn("mt-0.5 text-[12px]", change !== null && change > 15 ? "text-warning" : "text-ink-2")}>
          {change === null ? "No spend in the prior quarter" : `${change > 0 ? "↑" : change < 0 ? "↓" : ""} ${Math.abs(change)}% vs. prior 3 months`}
        </div>
      </div>
      <div className="border-l border-line px-5 py-4">
        <div className="text-[12px] text-ink-2">Cashback earned</div>
        <div className={cn("mt-1 text-[18px] tracking-[-0.01em] tabular", cashback > 0 ? "text-money" : "text-ink")}>{formatMoney(cashback)}</div>
        <div className="mt-0.5 text-[12px] text-ink-2">
          {cashback > 0 ? "1.5% on Ramp card spend" : "Pay by Ramp card to earn 1.5%"}
        </div>
      </div>
    </div>
  );
}

function TransactionTable({ rows }: { rows: ReturnType<typeof vendorTransactions> }) {
  return (
    <Table className="border-t border-line" minWidth={980}>
      <THead>
        <tr>
          <Th className="w-[16%]" sort="desc">
            Date
          </Th>
          <Th className="w-[32%]">Description</Th>
          <Th className="w-[18%]">Payment method</Th>
          <Th className="w-[18%]">User</Th>
          <Th align="right">Amount</Th>
        </tr>
      </THead>
      <TBody>
        {rows.map((t) => (
          <Tr key={t.id} interactive={false} className="hover:bg-subtle/60">
            <Td className="text-ink-2">{formatDateLong(t.date)}</Td>
            <Td className="text-ink">{t.memo}</Td>
            <Td>
              <CellStack primary={<span className="text-[13px]">{t.method === "Card" ? "Ramp card" : t.method}</span>} secondary={t.reference} />
            </Td>
            <Td>
              <span className="flex items-center gap-2">
                <Avatar name={t.user} size={22} />
                {t.user}
              </span>
            </Td>
            <Td align="right" className="text-[14px] text-ink">
              {formatMoney(t.amount)}
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}

/* -------------------------------- Transactions ------------------------------- */

function TransactionsTab({ vendor, transactions }: { vendor: Vendor; transactions: ReturnType<typeof vendorTransactions> }) {
  const [query, setQuery] = useState("");
  const rows = transactions.filter((t) => `${t.memo} ${t.method} ${t.user}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <div className="h-8" />
      <Toolbar>
        <ToolbarRow className="min-h-[50px]">
          <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search or add filter..." />
        </ToolbarRow>
      </Toolbar>
      <TransactionTable rows={rows} />
      {rows.length === 0 && <EmptyState title="No transactions found" description={`No ${vendor.name} payments match your search.`} />}
      <div className="flex-1" />
      <TableFooter
        left={<span>{pluralize(rows.length, "transaction")}</span>}
        right={<span>{formatMoney(rows.reduce((s, t) => s + t.amount, 0))} USD</span>}
      />
    </>
  );
}

/* ------------------------------------ Bills ---------------------------------- */

function BillsTab({ vendor, bills: rows }: { vendor: Vendor; bills: Bill[] }) {
  const router = useRouter();
  if (!rows.length) {
    return (
      <EmptyState
        icon={<ReceiptText />}
        title={`No bills from ${vendor.name}`}
        description={`${vendor.name} is paid by ${vendor.paymentMethods.includes("Card") ? "Ramp card" : vendor.paymentMethods.join(" or ")}. Upload an invoice to pay them through Bill Pay.`}
        action={
          <Button size="sm" variant="primary" onClick={() => router.push(`/bill-pay?new=1&vendor=${encodeURIComponent(vendor.name)}`)}>
            New bill
          </Button>
        }
      />
    );
  }
  return (
    <>
      <div className="h-8" />
      <Toolbar>
        <ToolbarRow className="min-h-[50px] justify-between">
          <span className="text-[13px] text-ink-2">
            {pluralize(rows.filter((b) => b.stage !== "paid").length, "open bill")} ·{" "}
            {formatMoney(rows.filter((b) => b.stage !== "paid").reduce((s, b) => s + b.amount, 0))} outstanding
          </span>
          <Button size="xs" variant="ghost" className="gap-1.5" onClick={() => router.push("/bill-pay")}>
            Open Bill Pay
            <ArrowRight className="size-3.5 stroke-[1.5]" />
          </Button>
        </ToolbarRow>
      </Toolbar>
      <Table className="border-t border-line" minWidth={980}>
        <THead>
          <tr>
            <Th className="w-[22%]">Invoice</Th>
            <Th className="w-[14%]">Issued</Th>
            <Th className="w-[14%]">Due</Th>
            <Th className="w-[16%]">Payment method</Th>
            <Th className="w-[18%]">Status</Th>
            <Th align="right">Amount</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((bill) => (
            <Tr key={bill.id} onClick={() => router.push(billHref(bill))}>
              <Td>
                <CellStack primary={bill.invoiceNumber} secondary={bill.lines[0]?.description} />
              </Td>
              <Td className="text-ink-2">{formatDateLong(bill.issueDate)}</Td>
              <Td>{formatDateLong(bill.dueDate)}</Td>
              <Td>{bill.method}</Td>
              <Td>
                <BillStatus bill={bill} />
              </Td>
              <Td align="right" className="text-[14px] text-ink">
                {formatMoney(bill.amount)}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      <div className="flex-1" />
      <TableFooter
        left={<span>{pluralize(rows.length, "bill")}</span>}
        right={<span>{formatMoney(rows.reduce((s, b) => s + b.amount, 0))} USD</span>}
      />
    </>
  );
}

/* ---------------------------------- Contracts -------------------------------- */

function ContractsTab({ vendor, docs }: { vendor: Vendor; docs: ContractDoc[] }) {
  const toast = useToast();
  return (
    <>
      <section className="px-page pt-8 pb-8">
        <button
          type="button"
          onClick={() => toast.show(`Contract uploaded. Ramp is extracting terms for ${vendor.name}`)}
          className="flex w-full items-center justify-center gap-3 border border-dashed border-line-strong bg-subtle px-6 py-6 text-[13px] text-ink-2 transition-colors hover:border-ink-5 hover:text-ink"
        >
          <Upload className="size-4 stroke-[1.5]" />
          Drop a contract or order form here. Ramp extracts the term, price and renewal date automatically.
        </button>
      </section>
      {docs.length ? (
        <Table className="border-t border-line" minWidth={980}>
          <THead>
            <tr>
              <Th className="w-[36%]">Document</Th>
              <Th className="w-[14%]">Type</Th>
              <Th className="w-[22%]">Term</Th>
              <Th className="w-[12%]" align="right">
                Value
              </Th>
              <Th>Uploaded</Th>
            </tr>
          </THead>
          <TBody>
            {docs.map((doc) => (
              <Tr key={doc.name} onClick={() => toast.show(`Opening ${doc.name}`, "neutral")}>
                <Td>
                  <span className="flex items-center gap-3">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-[2px] border border-line bg-subtle">
                      <FileText className="size-4 stroke-[1.5] text-ink-2" />
                    </span>
                    <span className="truncate text-ink">{doc.name}</span>
                  </span>
                </Td>
                <Td>{doc.pending ? <Tag tone="warning">{doc.type}</Tag> : doc.type}</Td>
                <Td className="text-ink-2">{doc.term}</Td>
                <Td align="right">{doc.value !== undefined ? formatMoney(doc.value) : <span className="text-ink-3">n/a</span>}</Td>
                <Td>
                  <CellStack primary={<span className="text-[13px]">{doc.uploadedBy}</span>} secondary={formatDateLong(doc.uploadedOn)} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      ) : (
        <EmptyState icon={<FileText />} title="No contracts on file" description={`${vendor.name} is billed ${vendor.contract.billing.toLowerCase()} without a signed agreement.`} />
      )}
    </>
  );
}

/* ----------------------------------- Details --------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-[14px] text-ink">{title}</h3>
      {children}
    </div>
  );
}

function DetailsTab({ vendor }: { vendor: Vendor }) {
  const tin = `••-•••${String(vendor.name.length * 731).slice(-4).padStart(4, "0")}`;
  return (
    <section className="grid grid-cols-2 gap-x-16 gap-y-10 px-page pt-10 pb-16">
      <Section title="Vendor information">
        <DetailRow label="Display name">{vendor.name}</DetailRow>
        <DetailRow label="Legal name">{vendor.legalName}</DetailRow>
        <DetailRow label="Category">{vendor.category}</DetailRow>
        <DetailRow label="Website">{vendor.website}</DetailRow>
        <DetailRow label="Address">{vendor.address || "Not provided"}</DetailRow>
      </Section>
      <Section title="Contacts & ownership">
        <DetailRow label="Vendor owner">{vendor.owner}</DetailRow>
        <DetailRow label="Department">{vendor.department}</DetailRow>
        <DetailRow label="Billing contact">{vendor.contactEmail}</DetailRow>
        <DetailRow label="Account manager">{`accounts@${vendor.website.split(".").slice(-2).join(".")}`}</DetailRow>
      </Section>
      <Section title="Payment">
        <DetailRow label="Payment methods">{vendor.paymentMethods.join(" · ")}</DetailRow>
        <DetailRow label="Payment terms">{vendor.paymentTerms}</DetailRow>
        <DetailRow label="Default GL account">{vendor.glAccount}</DetailRow>
        <DetailRow label="Pay from">
          {payFromAccount.bank} ···· {payFromAccount.last4}
        </DetailRow>
      </Section>
      <Section title="Tax">
        <DetailRow label="W-9">{vendor.w9 ? <Status tone="success">Collected</Status> : <Status tone="warning">Requested</Status>}</DetailRow>
        <DetailRow label="Tax ID (EIN)">{tin}</DetailRow>
        <DetailRow label="1099 eligible">{vendor.is1099 ? "Yes · 1099-NEC" : "No"}</DetailRow>
        <DetailRow label="Entity type">{vendor.legalName.match(/LLP|LLC/) ? "Partnership / LLC" : "C corporation"}</DetailRow>
      </Section>
    </section>
  );
}
