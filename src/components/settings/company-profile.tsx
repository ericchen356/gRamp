"use client";

import { Eye, EyeOff, Upload } from "lucide-react";
import { useState } from "react";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { companyProfile, currencyOptions, industryOptions, monthOptions, sizeOptions } from "@/data/settings";
import { SaveBar, SettingsPage } from "./settings-shell";
import { FormRow, FormSection, TextInput } from "@/components/ui/field";

export function CompanyProfileSettings() {
  const toast = useToast();
  const [form, setForm] = useState(companyProfile);
  const [showEin, setShowEin] = useState(false);
  const set = <K extends keyof typeof companyProfile>(key: K, value: (typeof companyProfile)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <SettingsPage title="Company profile" description="Business details used on cards, statements, 1099s and vendor payments.">
      <FormSection title="Business">
        <FormRow label="Company logo" description="Shown on virtual cards, receipts and vendor emails." align="center">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center bg-ink text-[22px] tracking-[-0.04em] text-canvas">ea</span>
            <Button size="sm" onClick={() => toast.show("Logo uploaded")}>
              <Upload className="size-3.5 stroke-[1.5]" />
              Replace
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast.show("Logo removed", "neutral")}>
              Remove
            </Button>
          </div>
        </FormRow>
        <FormRow label="Legal name" description="Must match your IRS records.">
          <TextInput value={form.legalName} onChange={(event) => set("legalName", event.target.value)} />
        </FormRow>
        <FormRow label="Doing business as">
          <TextInput value={form.dba} onChange={(event) => set("dba", event.target.value)} />
        </FormRow>
        <FormRow label="EIN" description="Verified with the IRS on Mar 14, 2023.">
          <TextInput
            readOnly
            value={showEin ? form.ein : "••-•••4821"}
            suffix={
              <span className="flex items-center gap-3">
                <Tag tone="success">Verified</Tag>
                <button type="button" aria-label={showEin ? "Hide EIN" : "Show EIN"} onClick={() => setShowEin((v) => !v)} className="text-ink-3 hover:text-ink">
                  {showEin ? <EyeOff className="size-4 stroke-[1.5]" /> : <Eye className="size-4 stroke-[1.5]" />}
                </button>
              </span>
            }
            inputClassName="tabular"
          />
        </FormRow>
        <FormRow label="Industry">
          <div className="grid grid-cols-2 gap-3">
            <Select variant="field" label="Industry" value={form.industry} options={industryOptions} onChange={(value) => set("industry", value)} placeholder="Select industry" />
            <Select variant="field" label="Company size" value={form.size} options={sizeOptions} onChange={(value) => set("size", value)} placeholder="Company size" />
          </div>
        </FormRow>
        <FormRow label="Website">
          <TextInput prefix={<span className="text-[14px]">https://</span>} value={form.website} onChange={(event) => set("website", event.target.value)} />
        </FormRow>
        <FormRow label="Phone">
          <TextInput value={form.phone} onChange={(event) => set("phone", event.target.value)} inputMode="tel" />
        </FormRow>
      </FormSection>

      <FormSection title="Address" description="Your registered business address. Cards ship here unless a different address is chosen.">
        <FormRow label="Street address">
          <TextInput value={form.street} onChange={(event) => set("street", event.target.value)} />
        </FormRow>
        <FormRow label="City, state, ZIP">
          <div className="grid grid-cols-[1fr_96px_120px] gap-3">
            <TextInput value={form.city} onChange={(event) => set("city", event.target.value)} aria-label="City" />
            <TextInput value={form.state} onChange={(event) => set("state", event.target.value)} aria-label="State" />
            <TextInput value={form.zip} onChange={(event) => set("zip", event.target.value)} aria-label="ZIP" inputClassName="tabular" />
          </div>
        </FormRow>
      </FormSection>

      <FormSection title="Financial">
        <FormRow label="Fiscal year starts" description="Used for budgets, Insights and spend limits that reset yearly.">
          <Select variant="field" label="Fiscal year start" value={form.fiscalYearStart} options={monthOptions} onChange={(value) => set("fiscalYearStart", value)} placeholder="Month" />
        </FormRow>
        <FormRow label="Reporting currency">
          <Select variant="field" label="Reporting currency" value={form.currency} options={currencyOptions} onChange={(value) => set("currency", value)} placeholder="Currency" />
        </FormRow>
      </FormSection>

      <SaveBar onCancel={() => setForm(companyProfile)} />
    </SettingsPage>
  );
}
