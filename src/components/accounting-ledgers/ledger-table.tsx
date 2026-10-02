"use client";

import { CalendarDays, ChevronDown, Columns3, FileWarning, ListFilter, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuItem, Popover } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { AddFilterButton, LockedFilter, SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import type { LedgerRowBase, LedgerStatus } from "@/data/ledgers";
import { cn } from "@/lib/cn";
import { formatMoney, pluralize } from "@/lib/format";
import { LedgerDrawer } from "./ledger-drawer";
import type { CodingField, LedgerConfig } from "./ledger-types";
import { capitalize, missingCoding, statusLabel } from "./ledger-utils";

const CHECKBOX_WIDTH = 52;

type MoveFn = (ids: string[], status: LedgerStatus, message: string) => void;

/**
 * Full-bleed coding table shared by the Reimbursements, Payments and Treasury
 * ledgers. Columns, coding fields and the waiting state come from `config`.
 */
export function LedgerTable<R extends LedgerRowBase>({ config, status }: { config: LedgerConfig<R>; status?: LedgerStatus }) {
  const { rows: all, setStatus, setCoding } = config.store.useLedger();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (row) =>
        (status ? row.status === status : row.status !== "synced") &&
        (!q || config.search(row).toLowerCase().includes(q)),
    );
  }, [all, status, query, config]);

  const total = rows.reduce((sum, row) => sum + Math.abs(row.amount), 0);
  const selectedRows = rows.filter((row) => selected.has(row.id));
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someSelected = selectedRows.length > 0;
  const openRow = all.find((row) => row.id === openId) ?? null;
  const primaryLeft = CHECKBOX_WIDTH;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const move: MoveFn = (ids, next, message) => {
    setStatus(ids, next);
    setSelected(new Set());
    toast.show(message);
  };

  const code = (row: R, field: CodingField, value: string) => {
    setCoding(row.id, field.key, value);
    toast.show(`${field.label} updated`);
  };

  const markSelectedReady = () => {
    const ready = selectedRows.filter((row) => missingCoding(row, config.coding).length === 0);
    const skipped = selectedRows.length - ready.length;
    setStatus(
      ready.map((row) => row.id),
      "ready_to_sync",
    );
    setSelected(new Set());
    toast.show(
      skipped
        ? `${pluralize(ready.length, config.noun.one, config.noun.other)} marked ready · ${skipped} still need coding`
        : `${pluralize(ready.length, config.noun.one, config.noun.other)} marked ready to sync`,
      skipped && !ready.length ? "danger" : "success",
    );
  };

  const stickyBg = (isSelected: boolean) => (isSelected ? "bg-subtle" : "bg-canvas group-hover/row:bg-subtle");

  return (
    <>
      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} />
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-chip text-[12px] text-ink-1 hover:bg-sidebar-group",
                status ? "px-3" : "w-8",
              )}
              aria-label={status ? "1 filter applied" : "No filters applied"}
            >
              <ListFilter className="size-3.5 stroke-[1.75]" />
              {status && 1}
            </button>
            <IconButton label="Date range">
              <CalendarDays />
            </IconButton>
            <IconButton label="Row density">
              <Rows3 />
            </IconButton>
            <IconButton label="Columns">
              <Columns3 />
            </IconButton>
            <Popover
              align="end"
              trigger={({ toggle: open }) => (
                <Button pill size="sm" onClick={open} className="h-8 gap-1 pr-2.5 pl-3 text-[12px]">
                  Options
                  <ChevronDown className="size-3.5 stroke-[1.5]" />
                </Button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem
                    onSelect={() => {
                      close();
                      toast.show(`${pluralize(rows.length, config.noun.one, config.noun.other)} exported to CSV`, "neutral");
                    }}
                  >
                    Export CSV
                  </MenuItem>
                  <MenuItem onSelect={close}>Accounting settings</MenuItem>
                  <MenuItem onSelect={close}>Manage accounting rules</MenuItem>
                  <MenuItem onSelect={close}>Sync history</MenuItem>
                </>
              )}
            </Popover>
          </div>
        </ToolbarRow>
        <ToolbarRow className="min-h-0 pb-3">
          {status && <LockedFilter label="Accounting status" value={statusLabel(config, status)} />}
          <AddFilterButton />
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line bg-canvas" minWidth={config.minWidth}>
        <THead>
          <tr>
            <Th align="center" className="sticky left-0 z-20 bg-canvas px-0!" style={{ width: CHECKBOX_WIDTH, minWidth: CHECKBOX_WIDTH }}>
              <Checkbox
                label="Select all"
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={(checked) => setSelected(checked ? new Set(rows.map((row) => row.id)) : new Set())}
              />
            </Th>
            <Th
              className="sticky z-20 bg-canvas shadow-[inset_-1px_0_0_var(--color-line)]"
              style={{ left: primaryLeft, width: config.primary.width, minWidth: config.primary.width }}
            >
              {config.primary.header}
            </Th>
            {config.columns.map((column) => (
              <Th key={column.id} align={column.align} style={{ width: column.width }}>
                {column.header}
              </Th>
            ))}
            {config.coding.map((field) => (
              <Th key={field.key} style={{ width: field.width }}>
                {field.header}
              </Th>
            ))}
            <Th className="sticky right-0 z-20 w-[180px] min-w-[180px] bg-canvas shadow-[inset_1px_0_0_var(--color-line)]">Actions</Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((row) => {
            const isSelected = selected.has(row.id);
            return (
              <Tr key={row.id} selected={isSelected} onClick={() => setOpenId(row.id)}>
                <Td className={cn("sticky left-0 z-10 px-0! text-center", stickyBg(isSelected))} style={{ width: CHECKBOX_WIDTH, minWidth: CHECKBOX_WIDTH }}>
                  <Checkbox label={`Select ${config.noun.one}`} checked={isSelected} onChange={() => toggle(row.id)} />
                </Td>
                <Td
                  className={cn("sticky z-10 border-r-0 pl-[14px]! shadow-[inset_-1px_0_0_var(--color-line)]", stickyBg(isSelected))}
                  style={{ left: primaryLeft, width: config.primary.width, minWidth: config.primary.width, maxWidth: config.primary.width }}
                >
                  {config.primary.render(row)}
                </Td>
                {config.columns.map((column) => (
                  <Td key={column.id} align={column.align} className={cn("whitespace-nowrap", column.className)}>
                    {column.render(row)}
                  </Td>
                ))}
                {config.coding.map((field) => (
                  <Td key={field.key} onClick={(event) => event.stopPropagation()}>
                    <Select
                      label={field.label}
                      value={row.coding[field.key] ?? null}
                      options={field.options.map((option) => ({ value: option, label: option }))}
                      onChange={(value) => code(row, field, value)}
                      placeholder={field.placeholder}
                      variant="cell"
                    />
                  </Td>
                ))}
                <Td
                  className={cn("sticky right-0 z-10 border-r-0 shadow-[inset_1px_0_0_var(--color-line)]", stickyBg(isSelected))}
                  onClick={(event) => event.stopPropagation()}
                >
                  <RowAction config={config} row={row} onMove={move} />
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <FileWarning className="size-7 stroke-[1.25] text-ink-4" />
          <p className="mt-3 text-[15px] text-ink">Nothing here</p>
          <p className="mt-1 text-[13px] text-ink-2">
            {query
              ? `No ${config.noun.other} match “${query}”.`
              : `No ${config.noun.other} in ${status ? `“${statusLabel(config, status)}”` : "this view"}.`}
          </p>
        </div>
      )}

      <div className="flex-1" />
      <TableFooter
        left={
          someSelected ? (
            <>
              <span className="text-ink-1">{selectedRows.length} selected</span>
              {status === "needs_review" && (
                <Button size="xs" variant="primary" onClick={markSelectedReady}>
                  Mark ready
                </Button>
              )}
              {status === "ready_to_sync" && (
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() =>
                    move(
                      selectedRows.map((row) => row.id),
                      "synced",
                      `${pluralize(selectedRows.length, config.noun.one, config.noun.other)} synced to ${config.syncTarget}`,
                    )
                  }
                >
                  Sync now
                </Button>
              )}
              <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </>
          ) : (
            <Popover
              trigger={({ toggle: open }) => (
                <button type="button" onClick={open} className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
                  Select
                  <ChevronDown className="size-3 stroke-[1.75]" />
                </button>
              )}
              panelClassName="top-auto bottom-full mt-0 mb-1.5"
            >
              {(close) => (
                <>
                  <MenuItem
                    onSelect={() => {
                      setSelected(new Set(rows.map((row) => row.id)));
                      close();
                    }}
                  >
                    Select all on this page
                  </MenuItem>
                  <MenuItem
                    onSelect={() => {
                      setSelected(new Set(rows.filter((row) => missingCoding(row, config.coding).length === 0).map((row) => row.id)));
                      close();
                    }}
                  >
                    Select fully coded
                  </MenuItem>
                </>
              )}
            </Popover>
          )
        }
        right={
          <>
            <span>
              {rows.length ? `1–${rows.length}` : "0"} of {pluralize(rows.length, config.noun.one, config.noun.other)}
            </span>
            <span>·</span>
            <span>{formatMoney(total)} USD</span>
          </>
        }
      />

      <LedgerDrawer config={config} row={openRow} onClose={() => setOpenId(null)} onMove={move} />
    </>
  );
}

function RowAction<R extends LedgerRowBase>({ config, row, onMove }: { config: LedgerConfig<R>; row: R; onMove: MoveFn }) {
  switch (row.status) {
    case "ready_to_sync":
      return (
        <span className="text-[12px] whitespace-nowrap text-ink-3">
          Ready to sync.{" "}
          <button
            type="button"
            className="ml-1 text-ink underline underline-offset-2 hover:decoration-2"
            onClick={() => onMove([row.id], "needs_review", `${capitalize(config.noun.one)} moved back to Needs review`)}
          >
            Undo
          </button>
        </span>
      );
    case "needs_review": {
      const missing = missingCoding(row, config.coding);
      return (
        // Disabled buttons swallow pointer events, so the hint lives on a wrapper.
        <span title={missing.length ? `Add ${missing.map((field) => field.label).join(", ")} first` : undefined}>
          <Button
            size="xs"
            disabled={missing.length > 0}
            onClick={() => onMove([row.id], "ready_to_sync", `${capitalize(config.noun.one)} marked ready to sync`)}
          >
            Mark ready
          </Button>
        </span>
      );
    }
    case "waiting": {
      const state = config.waiting(row);
      return (
        <span className="flex items-center gap-2 text-[12px] whitespace-nowrap">
          <Tag tone="warning" className="h-[18px] text-[11px]">
            {state.tag}
          </Tag>
          {state.action && (
            <button
              type="button"
              className="text-ink underline underline-offset-2"
              onClick={() => onMove([row.id], "waiting", state.action!.message)}
            >
              {state.action.label}
            </button>
          )}
        </span>
      );
    }
    case "synced":
      return <Status tone="success">Synced</Status>;
  }
}
