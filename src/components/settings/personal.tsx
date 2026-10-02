"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { currentUser } from "@/data/people";
import { dateFormatOptions, languageOptions, timezoneOptions } from "@/data/settings";
import { SaveBar, SettingsPage } from "./settings-shell";
import { FormRow, FormSection, TextInput } from "@/components/ui/field";

const initial = {
  firstName: currentUser.name.split(" ")[0],
  lastName: currentUser.name.split(" ")[1],
  preferredName: "Alex",
  email: currentUser.email,
  phone: "(512) 555-0187",
  title: currentUser.title,
  timezone: "America/Chicago",
  language: "en-US",
  dateFormat: "mdy",
};

export function PersonalSettings() {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const set = (key: keyof typeof initial, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <SettingsPage title="Personal" description="Your profile, contact details and display preferences.">
      <FormSection title="Profile">
        <FormRow label="Photo" align="center">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser.name} size={56} />
            <Button size="sm" onClick={() => toast.show("Profile photo updated")}>
              <Upload className="size-3.5 stroke-[1.5]" />
              Upload photo
            </Button>
          </div>
        </FormRow>
        <FormRow label="Legal name" description="As it appears on your ID. Printed on physical cards.">
          <div className="grid grid-cols-2 gap-3">
            <TextInput aria-label="First name" value={form.firstName} onChange={(event) => set("firstName", event.target.value)} />
            <TextInput aria-label="Last name" value={form.lastName} onChange={(event) => set("lastName", event.target.value)} />
          </div>
        </FormRow>
        <FormRow label="Preferred name">
          <TextInput value={form.preferredName} onChange={(event) => set("preferredName", event.target.value)} />
        </FormRow>
        <FormRow label="Job title">
          <TextInput value={form.title} onChange={(event) => set("title", event.target.value)} />
        </FormRow>
        <FormRow label="Role" description="Managed by your Ramp admins in Company › People." align="center">
          <div className="flex items-center gap-3 text-[14px] text-ink-1">
            <Tag tone="info">{currentUser.role}</Tag>
            {currentUser.department} · {currentUser.location}
          </div>
        </FormRow>
      </FormSection>

      <FormSection title="Contact">
        <FormRow label="Work email" description="Used to sign in and receive receipts.">
          <TextInput value={form.email} onChange={(event) => set("email", event.target.value)} suffix={<Tag tone="success">Verified</Tag>} />
        </FormRow>
        <FormRow label="Mobile phone" description="For SMS receipts, 2FA and card alerts.">
          <TextInput value={form.phone} onChange={(event) => set("phone", event.target.value)} inputMode="tel" suffix={<Tag tone="success">Verified</Tag>} />
        </FormRow>
      </FormSection>

      <FormSection title="Preferences">
        <FormRow label="Time zone">
          <Select variant="field" label="Time zone" value={form.timezone} options={timezoneOptions} onChange={(value) => set("timezone", value)} placeholder="Time zone" />
        </FormRow>
        <FormRow label="Language">
          <Select variant="field" label="Language" value={form.language} options={languageOptions} onChange={(value) => set("language", value)} placeholder="Language" />
        </FormRow>
        <FormRow label="Date format">
          <Select variant="field" label="Date format" value={form.dateFormat} options={dateFormatOptions} onChange={(value) => set("dateFormat", value)} placeholder="Date format" />
        </FormRow>
      </FormSection>

      <SaveBar onCancel={() => setForm(initial)} />
    </SettingsPage>
  );
}
