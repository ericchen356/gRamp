"use client";

import { Mail, MessageSquareText } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Switch } from "@/components/ui/checkbox";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { Select } from "@/components/ui/select";
import { notificationGroups, type Channel } from "@/data/settings";
import { SaveBar, SettingsPage } from "./settings-shell";
import { FormRow, FormSection } from "@/components/ui/field";

const channels: { id: Channel; label: string; icon: ReactNode }[] = [
  { id: "email", label: "Email", icon: <Mail className="size-3.5 stroke-[1.5]" /> },
  { id: "sms", label: "SMS", icon: <MessageSquareText className="size-3.5 stroke-[1.5]" /> },
  { id: "slack", label: "Slack", icon: <MerchantLogo name="Slack" size={16} /> },
];

type Matrix = Record<string, Record<Channel, boolean>>;

const initialMatrix: Matrix = Object.fromEntries(
  notificationGroups.flatMap((group) => group.events.map((event) => [event.id, event.channels])),
);

const digestOptions = [
  { value: "realtime", label: "As it happens" },
  { value: "hourly", label: "Hourly digest" },
  { value: "daily", label: "Daily digest at 9:00 AM" },
];

export function NotificationSettings() {
  const [matrix, setMatrix] = useState(initialMatrix);
  const [digest, setDigest] = useState("realtime");
  const [quietHours, setQuietHours] = useState(true);

  const toggle = (id: string, channel: Channel, value: boolean) =>
    setMatrix((current) => ({ ...current, [id]: { ...current[id], [channel]: value } }));

  const setColumn = (channel: Channel, value: boolean) =>
    setMatrix((current) => Object.fromEntries(Object.entries(current).map(([id, row]) => [id, { ...row, [channel]: value }])));

  return (
    <SettingsPage title="Notifications" description="Choose how Ramp reaches you. Admin alerts for declines and low balances can’t be fully turned off.">
      <div className="border-y border-line">
        <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,96px)] items-center border-b border-line">
          <div className="py-3 text-[12px] text-ink-3">Event</div>
          {channels.map((channel) => {
            const allOn = Object.values(matrix).every((row) => row[channel.id]);
            return (
              <button
                key={channel.id}
                type="button"
                title={allOn ? `Turn off all ${channel.label}` : `Turn on all ${channel.label}`}
                onClick={() => setColumn(channel.id, !allOn)}
                className="flex items-center justify-center gap-1.5 py-3 text-[12px] text-ink-2 hover:text-ink"
              >
                {channel.icon}
                {channel.label}
              </button>
            );
          })}
        </div>

        {notificationGroups.map((group) => (
          <Fragment key={group.title}>
            <div className="pt-6 pb-1.5 text-[12px] text-ink-3">{group.title}</div>
            {group.events.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_repeat(3,96px)] items-center py-3.5",
                  index > 0 && "border-t border-line-soft",
                )}
              >
                <div className="min-w-0 leading-tight">
                  <div className="text-[14px] text-ink">{event.label}</div>
                  <div className="mt-1 text-[12px] text-ink-2">{event.description}</div>
                </div>
                {channels.map((channel) => (
                  <div key={channel.id} className="flex justify-center">
                    <Switch
                      checked={matrix[event.id][channel.id]}
                      onChange={(value) => toggle(event.id, channel.id, value)}
                      label={`${event.label} via ${channel.label}`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </Fragment>
        ))}
      </div>

      <FormSection title="Delivery" className="mt-12">
        <FormRow label="Email frequency" description="Bundle non-urgent emails into a digest.">
          <Select variant="field" label="Email frequency" value={digest} options={digestOptions} onChange={setDigest} placeholder="Frequency" />
        </FormRow>
        <FormRow label="Quiet hours" description="Pause SMS and Slack alerts from 8:00 PM to 7:00 AM, except declines." align="center">
          <div className="flex justify-end">
            <Switch checked={quietHours} onChange={setQuietHours} label="Quiet hours" />
          </div>
        </FormRow>
        <FormRow label="Slack workspace" description="Alerts are sent as direct messages from the Ramp app." align="center">
          <div className="flex items-center gap-2.5 text-[14px] text-ink-1">
            <MerchantLogo name="Slack" size={22} />
            efficient-app.slack.com
            <span className="text-ink-3">· @alexander</span>
          </div>
        </FormRow>
      </FormSection>

      <SaveBar onCancel={() => setMatrix(initialMatrix)} />
    </SettingsPage>
  );
}
