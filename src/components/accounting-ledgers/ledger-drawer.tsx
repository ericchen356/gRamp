"use client";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { DetailRow } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import type { LedgerRowBase, LedgerStatus } from "@/data/ledgers";
import { formatMoney } from "@/lib/format";
import type { LedgerConfig } from "./ledger-types";
import { capitalize, missingCoding, statusLabel } from "./ledger-utils";

/** Right-hand detail sheet with editable coding, shared by every ledger. */
export function LedgerDrawer<R extends LedgerRowBase>({
  config,
  row,
  onClose,
  onMove,
}: {
  config: LedgerConfig<R>;
  row: R | null;
  onClose: () => void;
  onMove: (ids: string[], status: LedgerStatus, message: string) => void;
}) {
  const { setCoding } = config.store.useLedger();
  const toast = useToast();
  const missing = row ? missingCoding(row, config.coding) : [];

  return (
    <Drawer open={!!row} onClose={onClose} title={config.drawer.title}>
      {row && (
        <div className="px-6 py-6">
          {config.drawer.identity(row)}

          <div className="mt-6 text-[36px] leading-none tracking-[-0.02em] text-ink tabular">{formatMoney(row.amount)}</div>
          <div className="mt-2 text-[13px] text-ink-2">{config.drawer.subtitle(row)}</div>

          <h3 className="mt-7 mb-1 text-[13px] text-ink">Details</h3>
          {config.drawer.details(row).map((detail) => (
            <DetailRow key={detail.label} label={detail.label}>
              {detail.value}
            </DetailRow>
          ))}
          <DetailRow label="Accounting status">{statusLabel(config, row.status)}</DetailRow>

          <h3 className="mt-7 mb-3 text-[13px] text-ink">Accounting</h3>
          <div className="flex flex-col gap-3">
            {config.coding.map((field) => (
              <label key={field.key} className="flex flex-col gap-1.5">
                <span className="text-[12px] text-ink-2">
                  {field.header}
                  {field.required && <span className="text-ink-4"> · required</span>}
                </span>
                <Select
                  variant="field"
                  label={field.label}
                  value={row.coding[field.key] ?? null}
                  options={field.options.map((option) => ({ value: option, label: option }))}
                  onChange={(value) => {
                    setCoding(row.id, field.key, value);
                    toast.show(`${field.label} updated`);
                  }}
                  placeholder={field.placeholder}
                />
              </label>
            ))}
          </div>

          <div className="mt-8 flex gap-2">
            {row.status === "needs_review" && (
              <Button
                variant="primary"
                disabled={missing.length > 0}
                onClick={() => {
                  onMove([row.id], "ready_to_sync", `${capitalize(config.noun.one)} marked ready to sync`);
                  onClose();
                }}
              >
                Mark ready to sync
              </Button>
            )}
            {row.status === "ready_to_sync" && (
              <Button
                variant="primary"
                onClick={() => {
                  onMove([row.id], "synced", `${capitalize(config.noun.one)} synced to ${config.syncTarget}`);
                  onClose();
                }}
              >
                Sync now
              </Button>
            )}
            <Button onClick={onClose}>Close</Button>
          </div>
          {row.status === "needs_review" && missing.length > 0 && (
            <p className="mt-3 text-[12px] text-ink-3">
              Add {missing.map((field) => field.label).join(" and ")} to mark this {config.noun.one} ready.
            </p>
          )}
        </div>
      )}
    </Drawer>
  );
}
