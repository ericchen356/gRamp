"use client";

import { Check, Download, Landmark } from "lucide-react";
import Link from "next/link";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { billing, invoices } from "@/data/settings";
import { formatDateLong, formatMoney } from "@/lib/format";
import { SettingsPage } from "./settings-shell";
import { FormRow, FormSection } from "@/components/ui/field";

export function BillingSettings() {
  const toast = useToast();
  const monthly = billing.pricePerUser * billing.activeUsers;

  return (
    <SettingsPage title="Billing" description="Your Ramp plan, payment method and invoices.">
      <section className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] border border-line">
        <div className="p-7">
          <div className="flex items-center gap-2.5">
            <Tag tone="plus">Plus</Tag>
            <span className="text-[13px] text-ink-2">Current plan · Annual</span>
          </div>
          <h3 className="mt-4 text-[34px] leading-none tracking-[-0.025em] text-ink">{billing.plan}</h3>
          <p className="mt-3 max-w-[420px] text-[14px] text-ink-2">
            Advanced controls, procurement and multi-entity for growing finance teams. Renews {formatDateLong(billing.renewal)}.
          </p>
          <ul className="mt-6 space-y-2.5">
            {billing.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[13px] text-ink-1">
                <Check className="mt-0.5 size-3.5 shrink-0 stroke-[1.75] text-positive" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex gap-2">
            <Button size="sm" onClick={() => toast.show("Your account manager will reach out within one business day")}>
              Manage plan
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast.show("Opening plan comparison", "neutral")}>
              Compare plans
            </Button>
          </div>
        </div>
        <div className="flex flex-col border-l border-line bg-subtle p-7">
          <Stat label="Next invoice" value={formatMoney(monthly)} caption={`Due ${formatDateLong(billing.nextInvoiceDate)}`} size="lg" />
          <div className="mt-7 space-y-3 border-t border-line pt-5 text-[13px]">
            <div className="flex justify-between">
              <span className="text-ink-2">Price</span>
              <span className="text-ink-1 tabular">{formatMoney(billing.pricePerUser)} / user / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">Active users</span>
              <span className="text-ink-1 tabular">{billing.activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">Travel cashback this year</span>
              <span className="text-money tabular">{formatMoney(2184.6)}</span>
            </div>
          </div>
          <Link href="/refer" className="mt-auto pt-6 text-[13px] text-ink-2 underline decoration-ink-4 underline-offset-2 hover:text-ink">
            Refer a company and get a month of Plus free
          </Link>
        </div>
      </section>

      <FormSection title="Payment method" className="mt-12">
        <FormRow label="Billed to" description="Plan fees are debited automatically." align="center">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2.5 text-[14px] text-ink-1">
              <Landmark className="size-4 stroke-[1.5] text-ink-2" />
              {billing.paymentMethod}
            </span>
            <Link href="/settings/bank-accounts" className="text-[13px] text-ink underline decoration-ink-4 underline-offset-2 hover:decoration-ink">
              Change
            </Link>
          </div>
        </FormRow>
        <FormRow label="Billing email" description="Invoices are sent here." align="center">
          <span className="text-[14px] text-ink-1">billing@efficient.app</span>
        </FormRow>
      </FormSection>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">Invoices</h2>
          <Button size="sm" variant="ghost" className="-mr-3" onClick={() => toast.show("Downloading all 2026 invoices as ZIP", "neutral")}>
            <Download className="size-3.5 stroke-[1.5]" />
            Download all
          </Button>
        </div>
        <div className="border-t border-line">
          <div className="grid grid-cols-[150px_120px_minmax(0,1fr)_110px_90px_40px] items-center gap-4 border-b border-line py-2.5 text-[12px] text-ink-3">
            <span>Invoice</span>
            <span>Date</span>
            <span>Billing period</span>
            <span className="text-right">Amount</span>
            <span>Status</span>
            <span />
          </div>
          {invoices.map((invoice) => (
            <div key={invoice.id} className="grid grid-cols-[150px_120px_minmax(0,1fr)_110px_90px_40px] items-center gap-4 border-b border-line-soft py-3 text-[13px]">
              <span className="text-ink tabular">{invoice.number}</span>
              <span className="text-ink-2">{formatDateLong(invoice.date)}</span>
              <span className="truncate text-ink-1">{invoice.period}</span>
              <span className="text-right text-ink tabular">{formatMoney(invoice.amount)}</span>
              <Status tone={invoice.status === "Paid" ? "success" : "warning"}>{invoice.status}</Status>
              <IconButton
                variant="bare"
                size="sm"
                label={`Download ${invoice.number}`}
                onClick={() => toast.show(`${invoice.number}.pdf downloaded`)}
              >
                <Download />
              </IconButton>
            </div>
          ))}
        </div>
      </section>
    </SettingsPage>
  );
}
