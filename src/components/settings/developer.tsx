"use client";

import { ArrowUpRight, Copy, MoreHorizontal, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { apiKeys as seedKeys, apiScopes, webhooks as seedHooks, type ApiKey } from "@/data/settings";
import { cn } from "@/lib/cn";
import { formatDateLong } from "@/lib/format";
import { copyText } from "./clipboard";
import { SettingsPage } from "./settings-shell";
import { Field, TextInput } from "@/components/ui/field";

function maskKey(key: string) {
  return `${key.slice(0, 13)}${"•".repeat(12)}${key.slice(-4)}`;
}

function SectionTitle({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-6">
      <div>
        <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">{title}</h2>
        <p className="mt-1 text-[13px] text-ink-2">{description}</p>
      </div>
      {action}
    </div>
  );
}

function CreateKeyDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (key: ApiKey) => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["transactions:read"]);
  const [created, setCreated] = useState<ApiKey | null>(null);

  const close = () => {
    setName("");
    setScopes(["transactions:read"]);
    setCreated(null);
    onClose();
  };

  const create = () => {
    const random = Array.from({ length: 32 }, (_, i) => "0123456789abcdef"[(name.length * 7 + i * 13 + scopes.length) % 16]).join("");
    const key: ApiKey = {
      id: `k-${Date.now()}`,
      name: name.trim(),
      key: `ramp_live_sk_${random}`,
      scopes,
      created: "2026-10-02",
      lastUsed: "Never",
      createdBy: "Alexander Bass",
    };
    onCreate(key);
    setCreated(key);
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogHeader
        title={created ? "Copy your API key" : "Create API key"}
        description={created ? "This is the only time the full key is shown. Store it somewhere safe." : "Keys authenticate server-to-server requests to the Ramp API."}
        onClose={close}
      />
      {created ? (
        <div className="px-6 pt-4 pb-6">
          <TextInput
            readOnly
            value={created.key}
            inputClassName="font-mono text-[12.5px]"
            suffix={
              <Button
                size="xs"
                onClick={async () => {
                  await copyText(created.key);
                  toast.show("API key copied to clipboard");
                }}
              >
                <Copy className="size-3 stroke-[1.75]" />
                Copy
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-5 px-6 pt-4 pb-6">
          <Field label="Name">
            <TextInput autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Snowflake export" />
          </Field>
          <Field label="Scopes">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border border-line p-4">
              {apiScopes.map((scope) => {
                const checked = scopes.includes(scope);
                return (
                  <label key={scope} className="flex cursor-pointer items-center gap-2.5 font-mono text-[12px] text-ink-1">
                    <Checkbox
                      checked={checked}
                      label={scope}
                      onChange={(value) => setScopes((current) => (value ? [...current, scope] : current.filter((s) => s !== scope)))}
                    />
                    {scope}
                  </label>
                );
              })}
            </div>
          </Field>
        </div>
      )}
      <DialogFooter>
        {created ? (
          <Button variant="primary" onClick={close}>
            Done
          </Button>
        ) : (
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" disabled={!name.trim() || !scopes.length} onClick={create}>
              Create key
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  );
}

export function DeveloperSettings() {
  const toast = useToast();
  const [env, setEnv] = useState<"live" | "sandbox">("live");
  const [keys, setKeys] = useState(seedKeys);
  const [hooks, setHooks] = useState(seedHooks);
  const [creating, setCreating] = useState(false);

  const copy = async (value: string, message: string) => {
    await copyText(value);
    toast.show(message);
  };

  const visibleKeys = env === "live" ? keys : keys.map((k) => ({ ...k, key: k.key.replace("live", "test") })).slice(0, 1);

  return (
    <SettingsPage
      title="Developer API"
      description="Build on Ramp with REST APIs and webhooks. Keys inherit the permissions of their scopes, not of the person who created them."
      actions={
        <Button size="sm" variant="ghost" className="-mr-3" onClick={() => toast.show("Opening docs.ramp.com", "neutral")}>
          API reference
          <ArrowUpRight className="size-3.5 stroke-[1.5]" />
        </Button>
      }
    >
      <div className="mb-10 flex items-center justify-between border border-line bg-subtle px-5 py-4">
        <div className="flex items-center gap-8 text-[13px]">
          <div>
            <div className="text-[12px] text-ink-2">Client ID</div>
            <div className="mt-1 flex items-center gap-2 font-mono text-[13px] text-ink">
              ramp_id_4Hq9xT2bLw7c
              <IconButton variant="bare" size="sm" label="Copy client ID" className="size-6" onClick={() => copy("ramp_id_4Hq9xT2bLw7c", "Client ID copied to clipboard")}>
                <Copy />
              </IconButton>
            </div>
          </div>
          <div>
            <div className="text-[12px] text-ink-2">Rate limit</div>
            <div className="mt-1 text-ink tabular">200 requests / 10s</div>
          </div>
          <div>
            <div className="text-[12px] text-ink-2">Requests (24h)</div>
            <div className="mt-1 text-ink tabular">18,402</div>
          </div>
        </div>
        <Segmented
          value={env}
          onChange={setEnv}
          options={[
            { value: "live", label: "Live" },
            { value: "sandbox", label: "Sandbox" },
          ]}
          className="gap-2 [&_button]:h-8 [&_button]:text-[13px]"
        />
      </div>

      <section>
        <SectionTitle
          title="API keys"
          description={`${visibleKeys.length} ${env} ${visibleKeys.length === 1 ? "key" : "keys"}`}
          action={
            <Button size="sm" variant="primary" onClick={() => setCreating(true)}>
              <Plus className="size-3.5 stroke-[1.75]" />
              Create API key
            </Button>
          }
        />
        <div className="border-t border-line">
          <div className="grid grid-cols-[minmax(0,1fr)_272px_120px_110px_40px] items-center gap-4 border-b border-line py-2.5 text-[12px] text-ink-3">
            <span>Name</span>
            <span>Key</span>
            <span>Created</span>
            <span>Last used</span>
            <span />
          </div>
          {visibleKeys.map((apiKey) => (
            <div key={apiKey.id} className="grid grid-cols-[minmax(0,1fr)_272px_120px_110px_40px] items-center gap-4 border-b border-line-soft py-3.5 text-[13px]">
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[14px] text-ink">{apiKey.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {apiKey.scopes.map((scope) => (
                    <span key={scope} className="rounded-[2px] bg-muted px-1.5 py-px font-mono text-[11px] text-ink-2">
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <code className="truncate font-mono text-[12px] text-ink-1">{maskKey(apiKey.key)}</code>
                <IconButton variant="bare" size="sm" label={`Copy ${apiKey.name} key`} className="size-6" onClick={() => copy(apiKey.key, "API key copied to clipboard")}>
                  <Copy />
                </IconButton>
              </div>
              <div className="leading-tight">
                <div className="text-ink-1">{formatDateLong(apiKey.created)}</div>
                <div className="mt-0.5 truncate text-[12px] text-ink-3">{apiKey.createdBy}</div>
              </div>
              <span className="text-ink-2">{apiKey.lastUsed}</span>
              <Popover
                align="end"
                trigger={({ toggle }) => (
                  <IconButton variant="bare" size="sm" label={`${apiKey.name} options`} onClick={toggle}>
                    <MoreHorizontal />
                  </IconButton>
                )}
              >
                {(close) => (
                  <>
                    <MenuItem onSelect={() => { close(); toast.show(`${apiKey.name} key rolled. Update your integration within 24 hours.`, "neutral"); }}>
                      Roll key
                    </MenuItem>
                    <MenuItem onSelect={close}>Edit scopes</MenuItem>
                    <MenuDivider />
                    <MenuItem
                      destructive
                      onSelect={() => {
                        close();
                        setKeys((current) => current.filter((k) => k.id !== apiKey.id));
                        toast.show(`${apiKey.name} key revoked`, "neutral");
                      }}
                    >
                      Revoke
                    </MenuItem>
                  </>
                )}
              </Popover>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle
          title="Webhooks"
          description="Ramp sends signed POST requests to these endpoints when events happen."
          action={
            <Button size="sm" onClick={() => toast.show("New endpoint created. Send a test event to verify it.", "neutral")}>
              <Plus className="size-3.5 stroke-[1.75]" />
              Add endpoint
            </Button>
          }
        />
        <div className="border-t border-line">
          <div className="grid grid-cols-[minmax(0,1fr)_110px_120px_90px_40px] items-center gap-4 border-b border-line py-2.5 text-[12px] text-ink-3">
            <span>Endpoint</span>
            <span>Status</span>
            <span>Last delivery</span>
            <span className="text-right">Success</span>
            <span />
          </div>
          {hooks.map((hook) => (
            <div key={hook.id} className="grid grid-cols-[minmax(0,1fr)_110px_120px_90px_40px] items-center gap-4 border-b border-line-soft py-3.5 text-[13px]">
              <div className="min-w-0 leading-tight">
                <div className="truncate font-mono text-[12.5px] text-ink">{hook.url}</div>
                <div className="mt-1 truncate text-[12px] text-ink-2">{hook.events.join(", ")}</div>
              </div>
              <Status tone={hook.status === "Active" ? "success" : hook.status === "Failing" ? "danger" : "neutral"}>{hook.status}</Status>
              <span className="text-ink-2">{hook.lastDelivery}</span>
              <span className={cn("text-right tabular", hook.successRate < 95 ? "text-warning" : "text-ink-1")}>{hook.successRate}%</span>
              <Popover
                align="end"
                trigger={({ toggle }) => (
                  <IconButton variant="bare" size="sm" label={`${hook.url} options`} onClick={toggle}>
                    <MoreHorizontal />
                  </IconButton>
                )}
              >
                {(close) => (
                  <>
                    <MenuItem onSelect={() => { close(); toast.show("Test event delivered (200 OK)"); }}>Send test event</MenuItem>
                    <MenuItem onSelect={() => { close(); copy("whsec_5c2f0a91e7b44d0d", "Signing secret copied to clipboard"); }}>Copy signing secret</MenuItem>
                    <MenuItem
                      onSelect={() => {
                        close();
                        setHooks((current) => current.map((h) => (h.id === hook.id ? { ...h, status: h.status === "Disabled" ? "Active" : "Disabled" } : h)));
                      }}
                    >
                      {hook.status === "Disabled" ? "Enable" : "Disable"}
                    </MenuItem>
                  </>
                )}
              </Popover>
            </div>
          ))}
        </div>
        {hooks.some((h) => h.status === "Failing") && (
          <p className="mt-3 flex items-center gap-2 text-[12px] text-ink-2">
            <Tag tone="danger" className="h-[18px] text-[11px]">Action needed</Tag>
            One endpoint is returning 5xx errors. Ramp retries failed deliveries for 72 hours.
          </p>
        )}
      </section>

      <CreateKeyDialog open={creating} onClose={() => setCreating(false)} onCreate={(key) => setKeys((current) => [...current, key])} />
    </SettingsPage>
  );
}
