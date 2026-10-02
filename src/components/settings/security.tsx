"use client";

import { KeyRound, Laptop, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { sessions as seed } from "@/data/settings";
import { IntegrationLogo } from "./integration-logo";
import { SettingsPage } from "./settings-shell";
import { FormRow, FormSection } from "@/components/ui/field";

const timeoutOptions = [
  { value: "15", label: "15 minutes" },
  { value: "60", label: "1 hour" },
  { value: "480", label: "8 hours" },
  { value: "1440", label: "24 hours" },
];

function DeviceIcon({ device }: { device: string }) {
  const Icon = /iphone/i.test(device) ? Smartphone : /ipad/i.test(device) ? Tablet : Laptop;
  return <Icon className="size-4 shrink-0 stroke-[1.5] text-ink-2" />;
}

export function SecuritySettings() {
  const toast = useToast();
  const [twoFactor, setTwoFactor] = useState(true);
  const [enforce2fa, setEnforce2fa] = useState(true);
  const [sso, setSso] = useState(false);
  const [timeout, setTimeoutValue] = useState("480");
  const [sessions, setSessions] = useState(seed);

  return (
    <SettingsPage title="Security" description="Sign-in requirements for you and everyone at Efficient App.">
      <FormSection title="Your sign-in">
        <FormRow label="Two-factor authentication" description="Required for admins. We’ll ask for a code when you sign in on a new device." align="center">
          <div className="flex items-center justify-end gap-4">
            {twoFactor && (
              <span className="flex items-center gap-2 text-[13px] text-ink-2">
                <KeyRound className="size-3.5 stroke-[1.5]" />
                Authenticator app
              </span>
            )}
            <Switch
              checked={twoFactor}
              label="Two-factor authentication"
              onChange={(value) => {
                if (!value) {
                  toast.show("Admins must keep two-factor authentication on", "neutral");
                  return;
                }
                setTwoFactor(value);
              }}
            />
          </div>
        </FormRow>
        <FormRow label="Password" description="Last changed Jun 12, 2026." align="center">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.show("Password reset link sent to alexander@efficient.app")}>
              Change password
            </Button>
          </div>
        </FormRow>
        <FormRow label="Passkeys" description="Sign in with Touch ID or a hardware key instead of a password." align="center">
          <div className="flex items-center justify-end gap-3">
            <Tag tone="neutral">1 passkey</Tag>
            <Button size="sm" onClick={() => toast.show("Passkey added")}>
              Add passkey
            </Button>
          </div>
        </FormRow>
      </FormSection>

      <FormSection title="Company policies" description="Applies to every member of Efficient App.">
        <FormRow label="Require two-factor for everyone" description="Members without 2FA will be prompted to set it up at next sign-in." align="center">
          <div className="flex justify-end">
            <Switch
              checked={enforce2fa}
              label="Require two-factor for everyone"
              onChange={(value) => {
                setEnforce2fa(value);
                toast.show(value ? "Two-factor is now required for everyone" : "Two-factor is now optional for employees", value ? "success" : "neutral");
              }}
            />
          </div>
        </FormRow>
        <FormRow label="Single sign-on (SAML)" description="Let people sign in with your identity provider." align="center">
          <div className="flex items-center justify-end gap-3">
            <IntegrationLogo name="Okta" size={24} />
            {sso ? <Status tone="success">Okta connected</Status> : <span className="text-[13px] text-ink-2">Not configured</span>}
            <Button
              size="sm"
              onClick={() => {
                setSso((value) => !value);
                toast.show(sso ? "SSO disabled" : "Okta SSO configured", sso ? "neutral" : "success");
              }}
            >
              {sso ? "Disable" : "Set up SSO"}
            </Button>
          </div>
        </FormRow>
        <FormRow label="Session timeout" description="Sign people out after a period of inactivity.">
          <Select
            variant="field"
            label="Session timeout"
            value={timeout}
            options={timeoutOptions}
            onChange={(value) => {
              setTimeoutValue(value);
              toast.show("Settings saved");
            }}
            placeholder="Timeout"
          />
        </FormRow>
      </FormSection>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">Active sessions</h2>
            <p className="mt-1 text-[13px] text-ink-2">Devices currently signed in to your account.</p>
          </div>
          <Button
            size="sm"
            variant="danger"
            disabled={sessions.length === 1}
            onClick={() => {
              setSessions((current) => current.filter((s) => s.current));
              toast.show("Signed out of all other sessions", "neutral");
            }}
          >
            Sign out other sessions
          </Button>
        </div>
        <div className="border-t border-line">
          <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_130px_150px_90px] items-center gap-4 border-b border-line py-2.5 text-[12px] text-ink-3">
            <span>Device</span>
            <span>Location</span>
            <span>IP address</span>
            <span>Last active</span>
            <span />
          </div>
          {sessions.map((session) => (
            <div
              key={session.id}
              className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_130px_150px_90px] items-center gap-4 border-b border-line-soft py-3.5 text-[13px]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <DeviceIcon device={session.device} />
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-2 text-[14px] text-ink">
                    <span className="truncate">{session.device}</span>
                    {session.current && <Tag tone="success" className="h-[18px] text-[11px]">This device</Tag>}
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-ink-2">{session.browser}</div>
                </div>
              </div>
              <span className="truncate text-ink-1">{session.location}</span>
              <span className="text-ink-2 tabular">{session.ip}</span>
              <span className={session.current ? "text-positive" : "text-ink-2"}>{session.lastActive}</span>
              <span className="text-right">
                {!session.current && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setSessions((current) => current.filter((s) => s.id !== session.id));
                      toast.show(`Signed out of ${session.device}`, "neutral");
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </SettingsPage>
  );
}
