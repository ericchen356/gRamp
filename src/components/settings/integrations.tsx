"use client";

import { ArrowUpRight, MoreHorizontal, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { SearchField } from "@/components/ui/toolbar";
import { integrations as seed, type Integration } from "@/data/settings";
import { cn } from "@/lib/cn";
import { formatDateLong } from "@/lib/format";
import { IntegrationLogo } from "./integration-logo";
import { SettingsPage } from "./settings-shell";

const categories = ["All", "Accounting", "HR & payroll", "Communication", "Travel & productivity"] as const;

function QuickBooksPanel({ integration, onDisconnect }: { integration: Integration; onDisconnect: () => void }) {
  const toast = useToast();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(integration.connected?.lastSync ?? "");

  const sync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      setLastSync("Just now");
      toast.show("Synced 5 transactions to QuickBooks Online");
    }, 1100);
  };

  return (
    <section className="border border-line">
      <div className="flex items-center gap-4 px-6 py-5">
        <IntegrationLogo name={integration.logo} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">{integration.name}</h3>
            <Status tone="success">Connected</Status>
          </div>
          <p className="mt-0.5 text-[13px] text-ink-2">
            {integration.connected?.account} · Connected since {formatDateLong(integration.connected?.since ?? "")}
          </p>
        </div>
        <Button size="sm" onClick={sync} disabled={syncing}>
          <RefreshCw className={cn("size-3.5 stroke-[1.5]", syncing && "animate-spin")} />
          {syncing ? "Syncing…" : "Sync now"}
        </Button>
        <Popover
          align="end"
          trigger={({ toggle }) => (
            <IconButton variant="bare" label="QuickBooks options" onClick={toggle}>
              <MoreHorizontal />
            </IconButton>
          )}
        >
          {(close) => (
            <>
              <MenuItem onSelect={close}>Accounting settings</MenuItem>
              <MenuItem onSelect={close}>Field mapping</MenuItem>
              <MenuItem onSelect={close}>Sync history</MenuItem>
              <MenuDivider />
              <MenuItem destructive onSelect={() => { close(); onDisconnect(); }}>
                Disconnect
              </MenuItem>
            </>
          )}
        </Popover>
      </div>
      <div className="grid grid-cols-4 border-t border-line bg-subtle">
        <Stat label="Last sync" value={lastSync} size="sm" className="px-6 py-4" />
        <Stat label="Synced this month" value="1,284" caption="transactions" size="sm" className="border-l border-line px-6 py-4" />
        <Stat label="Ready to sync" value="5" caption="transactions" size="sm" className="border-l border-line px-6 py-4" />
        <Stat label="Auto-coding rules" value="38" caption="active rules" size="sm" className="border-l border-line px-6 py-4" />
      </div>
    </section>
  );
}

function IntegrationTile({
  integration,
  connecting,
  onConnect,
  onManage,
}: {
  integration: Integration;
  connecting: boolean;
  onConnect: () => void;
  onManage: () => void;
}) {
  const connected = !!integration.connected;
  return (
    <article className="flex flex-col border border-line p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between">
        <IntegrationLogo name={integration.logo} size={36} />
        {connected ? (
          <Status tone="success">Connected</Status>
        ) : (
          integration.popular && <Tag tone="outline">Popular</Tag>
        )}
      </div>
      <h3 className="mt-4 text-[15px] text-ink">{integration.name}</h3>
      <p className="mt-1 min-h-[36px] text-[13px] leading-snug text-ink-2">{integration.description}</p>
      <div className="mt-5 flex items-center justify-between">
        {connected ? (
          <Button size="sm" onClick={onManage}>
            Manage
          </Button>
        ) : (
          <Button size="sm" onClick={onConnect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect"}
          </Button>
        )}
        <span className="text-[12px] text-ink-3">{integration.category}</span>
      </div>
    </article>
  );
}

export function IntegrationSettings() {
  const toast = useToast();
  const [items, setItems] = useState(seed);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);

  const erp = items.find((i) => i.category === "Accounting" && i.connected);
  const others = items.filter((i) => i !== erp);
  const q = query.trim().toLowerCase();
  const visible = others.filter(
    (i) => (category === "All" || i.category === category) && (!q || `${i.name} ${i.description}`.toLowerCase().includes(q)),
  );

  const connect = (integration: Integration) => {
    if (integration.category === "Accounting" && erp) {
      toast.show(`Disconnect ${erp.name} before connecting ${integration.name}`, "neutral");
      return;
    }
    setConnecting(integration.name);
    window.setTimeout(() => {
      setItems((current) =>
        current.map((i) => (i.name === integration.name ? { ...i, connected: { since: "2026-10-02", lastSync: "Just now" } } : i)),
      );
      setConnecting(null);
      toast.show(`${integration.name} connected`);
    }, 900);
  };

  return (
    <SettingsPage
      title="Accounting integrations"
      description="Connect your general ledger, HR system and the tools your team already uses."
      actions={
        <Button size="sm" variant="ghost" className="-mr-3" onClick={() => toast.show("Opening the Ramp developer docs", "neutral")}>
          Request an integration
          <ArrowUpRight className="size-3.5 stroke-[1.5]" />
        </Button>
      }
    >
      {erp ? (
        <QuickBooksPanel
          integration={erp}
          onDisconnect={() => {
            setItems((current) => current.map((i) => (i.name === erp.name ? { ...i, connected: undefined } : i)));
            toast.show(`${erp.name} disconnected`, "neutral");
          }}
        />
      ) : (
        <div className="border border-dashed border-line-strong bg-subtle px-6 py-5 text-[13px] text-ink-2">
          No accounting system connected. Connect one below to start syncing transactions.
        </div>
      )}

      <div className="mt-10 flex items-center gap-2 border-b border-line pb-4">
        {categories.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-[13px] transition-colors",
              category === value ? "border-ink-1 text-ink" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            {value}
          </button>
        ))}
        <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search integrations" className="ml-auto" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {visible.map((integration) => (
          <IntegrationTile
            key={integration.name}
            integration={integration}
            connecting={connecting === integration.name}
            onConnect={() => connect(integration)}
            onManage={() => toast.show(`Opening ${integration.name} settings`, "neutral")}
          />
        ))}
      </div>
      {!visible.length && <p className="py-16 text-center text-[13px] text-ink-2">No integrations match “{query}”.</p>}
    </SettingsPage>
  );
}
