"use client";

import { Eye, EyeOff, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import { Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuItem, Popover } from "@/components/ui/popover";
import { DetailRow, Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { entities, type Entity } from "@/data/company";
import { formatDateLong, formatMoney } from "@/lib/format";

/** FX rates used only to show a consolidated USD figure. */
const toUsd: Record<string, number> = { USD: 1, GBP: 1.27, INR: 0.012 };

function formatIn(value: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency }).format(value);
}

/** "86-2194821" → "••-•••4821": hides every character but the last four, keeping separators. */
function maskId(value: string) {
  const keepFrom = value.length - 4;
  return value.replace(/[A-Za-z0-9]/g, (char, index: number) => (index < keepFrom ? "•" : char));
}

/** Two-letter country code set in a square hairline tile (no emoji flags: they render inconsistently). */
function CountryMark({ code }: { code: string }) {
  return (
    <span className="inline-flex size-10 shrink-0 items-center justify-center border border-line bg-subtle text-[13px] tracking-wide text-ink-1">
      {code}
    </span>
  );
}

function EntityCard({ entity }: { entity: Entity }) {
  const toast = useToast();
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="flex flex-col border border-line bg-canvas">
      <header className="flex items-start gap-3.5 px-6 pt-6">
        <CountryMark code={entity.flag} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[18px] leading-snug tracking-[-0.01em] text-ink">{entity.legalName}</h3>
            {entity.primary && <Tag tone="outline">Primary</Tag>}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-ink-2">
            {entity.shortName} · {entity.country}
          </p>
        </div>
        <Popover
          align="end"
          trigger={({ toggle }) => (
            <IconButton variant="bare" size="sm" label={`${entity.legalName} options`} onClick={toggle} className="-mr-2">
              <MoreVertical />
            </IconButton>
          )}
        >
          {(close) => (
            <>
              <MenuItem onSelect={close}>Edit entity details</MenuItem>
              <MenuItem onSelect={() => { close(); toast.show(`Downloading ${entity.legalName} verification letter`, "neutral"); }}>
                Download verification letter
              </MenuItem>
              <MenuItem onSelect={close}>Accounting subsidiary mapping</MenuItem>
            </>
          )}
        </Popover>
      </header>

      <div className="mt-6 px-6">
        <Stat
          label={`Balance (${entity.currency})`}
          value={formatIn(entity.balance, entity.currency)}
          caption={entity.currency !== "USD" ? `≈ ${formatMoney(entity.balance * toUsd[entity.currency])} USD` : `${entity.cards} active cards`}
          size="md"
        />
      </div>

      <div className="mt-5 px-6">
        <DetailRow label="Currency">
          {entity.currency} · {entity.currencyName}
        </DetailRow>
        <DetailRow label={entity.taxIdLabel}>
          <span className="inline-flex items-center gap-2 tabular">
            {revealed ? entity.taxId : maskId(entity.taxId)}
            <button
              type="button"
              aria-label={revealed ? `Hide ${entity.taxIdLabel}` : `Show ${entity.taxIdLabel}`}
              onClick={() => setRevealed((value) => !value)}
              className="text-ink-3 hover:text-ink"
            >
              {revealed ? <EyeOff className="size-3.5 stroke-[1.5]" /> : <Eye className="size-3.5 stroke-[1.5]" />}
            </button>
          </span>
        </DetailRow>
        <DetailRow label="Incorporated">{formatDateLong(entity.incorporated)}</DetailRow>
        <DetailRow label="Registered address">
          <span className="block max-w-[220px]">{entity.address}</span>
        </DetailRow>
      </div>

      <div className="mt-4 border-t border-line px-6 pt-4 pb-2">
        <div className="mb-1 flex items-center justify-between text-[12px] text-ink-2">
          <span>Bank accounts</span>
          <span className="tabular">{entity.bankAccounts.length}</span>
        </div>
        <ul>
          {entity.bankAccounts.map((account) => (
            <li key={account.last4} className="flex items-center gap-3 border-b border-line-soft py-2.5 last:border-b-0">
              <MerchantLogo name={account.bank} size={26} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[13px] text-ink">{account.bank}</div>
                <div className="mt-0.5 text-[11px] text-ink-2">
                  {account.nickname} · {account.currency}
                </div>
              </div>
              {account.primary && <Tag tone="outline" className="h-[18px] text-[11px]">Primary</Tag>}
              <span className="w-[52px] text-right text-[13px] text-ink-1 tabular">••{account.last4}</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-auto flex items-center gap-2 border-t border-line px-6 py-4">
        <Button size="sm" onClick={() => toast.show(`Plaid opened to link a ${entity.currency} account`, "neutral")}>
          <Plus className="size-3.5 stroke-[1.75]" />
          Add bank account
        </Button>
        <Button size="sm" variant="ghost" onClick={() => toast.show(`Switched to ${entity.legalName}`, "neutral")}>
          Switch to entity
        </Button>
      </footer>
    </article>
  );
}

/** Legal entities: consolidated summary, then one card per entity. */
export function Entities() {
  const toast = useToast();
  const consolidated = entities.reduce((sum, e) => sum + e.balance * toUsd[e.currency], 0);
  const accounts = entities.reduce((sum, e) => sum + e.bankAccounts.length, 0);
  const cards = entities.reduce((sum, e) => sum + e.cards, 0);

  return (
    <div className="px-page pt-10 pb-16">
      <div className="flex items-end justify-between gap-6">
        <div className="flex gap-[66px]">
          <Stat label="Consolidated balance" value={formatMoney(consolidated)} info size="lg" />
          <Stat label="Entities" value={entities.length} size="lg" />
          <Stat label="Bank accounts" value={accounts} size="lg" />
          <Stat label="Active cards" value={cards} size="lg" />
        </div>
        <Button onClick={() => toast.show("Entity setup started. We’ll ask for formation documents next.", "neutral")}>
          <Plus className="size-4 stroke-[1.5]" />
          Add entity
        </Button>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-5">
        {entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} />
        ))}
      </div>
    </div>
  );
}
