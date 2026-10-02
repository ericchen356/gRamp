"use client";

import { ArrowDownToLine, ArrowRight, ChevronDown, Columns3, MoreHorizontal, Plus, Repeat2, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { Stat } from "@/components/ui/stat";
import { EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { automations as seed, type Automation, type AutomationKind } from "@/data/treasury";
import { cn } from "@/lib/cn";
import { formatDate, formatMoneyWhole, pluralize } from "@/lib/format";
import { AutomationDialog } from "./automation-dialog";

const noopSubscribe = () => () => {};

/** False during SSR/hydration: the shared Dialog portals into `document.body`. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

const kindFilters: { value: AutomationKind | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "sweep", label: "Sweeps" },
  { value: "deposit", label: "Deposits" },
];

function ruleText(automation: Automation) {
  return automation.kind === "sweep"
    ? `Keep ${formatMoneyWhole(automation.amount)}, sweep the rest`
    : `Deposit ${formatMoneyWhole(automation.amount)}`;
}

function KindIcon({ kind }: { kind: AutomationKind }) {
  const Icon = kind === "sweep" ? Repeat2 : ArrowDownToLine;
  return (
    <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full bg-muted text-ink-1">
      <Icon className="size-[15px] stroke-[1.5]" />
    </span>
  );
}

/** Cash & Treasury › Automations: sweep and deposit rules with on/off switches. */
export function AutomationsView({ openNew = false }: { openNew?: boolean }) {
  const toast = useToast();
  const [rows, setRows] = useState(seed);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<AutomationKind | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(openNew);
  const router = useRouter();
  const hydrated = useHydrated();

  // "New › Automated transfer" in the header links here with ?new=1; open the
  // dialog whenever that flag turns on, without remounting (keeps local rows).
  const [lastOpenNew, setLastOpenNew] = useState(openNew);
  if (openNew !== lastOpenNew) {
    setLastOpenNew(openNew);
    if (openNew) setDialogOpen(true);
  }

  const closeDialog = () => {
    setDialogOpen(false);
    if (openNew) router.replace("/treasury/automations", { scroll: false });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (kind === "all" || row.kind === kind) &&
        (!q || `${row.name} ${row.from} ${row.to} ${row.createdBy}`.toLowerCase().includes(q)),
    );
  }, [rows, query, kind]);

  const active = rows.filter((row) => row.enabled);
  const nextUp = [...active].sort((a, b) => a.nextRun.localeCompare(b.nextRun))[0];

  const setEnabled = (row: Automation, enabled: boolean) => {
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, enabled } : r)));
    toast.show(enabled ? `“${row.name}” turned on` : `“${row.name}” paused`, enabled ? "success" : "neutral");
  };

  const remove = (row: Automation) => {
    setRows((current) => current.filter((r) => r.id !== row.id));
    toast.show(`“${row.name}” deleted`, "neutral");
  };

  const create = (automation: Automation) => {
    setRows((current) => [automation, ...current]);
    closeDialog();
    toast.show("Automation created and sent for approval");
  };

  return (
    <>
      <section className="flex gap-[66px] px-page pt-[38px] pb-10">
        <Stat label="Active automations" value={active.length} size="md" caption={`${rows.length - active.length} paused`} />
        <Stat label="Moved in the last 30 days" value="$2,418,250.00" size="md" caption="14 transfers" />
        <Stat
          label="Next transfer"
          value={nextUp ? formatDate(nextUp.nextRun) : "—"}
          size="md"
          caption={nextUp ? nextUp.name : "No active automations"}
        />
      </section>

      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} placeholder="Search automations..." />
          <div className="ml-auto flex items-center gap-2">
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <Button pill size="sm" onClick={toggle} className="h-8 gap-1 pr-2.5 pl-3 text-[12px]">
                  {kindFilters.find((option) => option.value === kind)?.label}
                  <ChevronDown className="size-3.5 stroke-[1.5]" />
                </Button>
              )}
            >
              {(close) =>
                kindFilters.map((option) => (
                  <MenuItem
                    key={option.value}
                    selected={option.value === kind}
                    onSelect={() => {
                      setKind(option.value);
                      close();
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))
              }
            </Popover>
            <IconButton label="Columns">
              <Columns3 />
            </IconButton>
            <Button size="sm" variant="primary" className="ml-1 h-8" onClick={() => setDialogOpen(true)}>
              <Plus className="size-3.5 stroke-[1.75]" />
              New automation
            </Button>
          </div>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1180}>
        <THead>
          <tr>
            <Th className="w-[26%]">Automation</Th>
            <Th className="w-[22%]">Accounts</Th>
            <Th>Rule</Th>
            <Th className="w-[9%]">Last run</Th>
            <Th className="w-[9%]">Next run</Th>
            <Th className="w-[13%]">Created by</Th>
            <Th className="w-[120px]">Status</Th>
          </tr>
        </THead>
        <TBody>
          {visible.map((row) => (
            <Tr key={row.id} interactive={false} className="hover:bg-subtle">
              <Td>
                <div className="flex items-center gap-3">
                  <KindIcon kind={row.kind} />
                  <div className="min-w-0 leading-tight">
                    <div className={cn("truncate text-[14px]", row.enabled ? "text-ink" : "text-ink-2")}>{row.name}</div>
                    <div className="mt-0.5 truncate text-[12px] text-ink-2">
                      <span className="capitalize">{row.kind}</span> · {row.frequency}
                    </div>
                  </div>
                </div>
              </Td>
              <Td>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  {row.from}
                  <ArrowRight className="size-3 shrink-0 stroke-[1.75] text-ink-3" />
                  {row.to}
                </span>
              </Td>
              <Td className="whitespace-nowrap tabular">{ruleText(row)}</Td>
              <Td className="text-ink-2">{row.lastRun ? formatDate(row.lastRun) : "Never"}</Td>
              <Td className={row.enabled ? "text-ink-1" : "text-ink-4"}>{row.enabled ? formatDate(row.nextRun) : "Paused"}</Td>
              <Td>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <Avatar name={row.createdBy} size={22} />
                  {row.createdBy}
                </span>
              </Td>
              <Td>
                <span className="flex items-center justify-between gap-3">
                  <Switch label={`${row.enabled ? "Pause" : "Turn on"} ${row.name}`} checked={row.enabled} onChange={(next) => setEnabled(row, next)} />
                  <Popover
                    align="end"
                    trigger={({ toggle }) => (
                      <IconButton variant="bare" size="sm" label={`${row.name} options`} onClick={toggle} className="[&_svg]:size-4">
                        <MoreHorizontal />
                      </IconButton>
                    )}
                  >
                    {(close) => (
                      <>
                        <MenuItem
                          onSelect={() => {
                            close();
                            toast.show(`Running “${row.name}” now`, "neutral");
                          }}
                        >
                          Run now
                        </MenuItem>
                        <MenuItem
                          onSelect={() => {
                            close();
                            toast.show("Opened run history", "neutral");
                          }}
                        >
                          View history
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem
                          destructive
                          onSelect={() => {
                            close();
                            remove(row);
                          }}
                        >
                          Delete
                        </MenuItem>
                      </>
                    )}
                  </Popover>
                </span>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      {visible.length === 0 && (
        <EmptyState
          icon={<Workflow />}
          title="No automations found"
          description="Try a different search, or set up a sweep to put idle cash to work."
          action={
            <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
              New automation
            </Button>
          }
        />
      )}

      <div className="flex-1" />
      <TableFooter right={<span>{pluralize(visible.length, "automation")}</span>} />

      <AutomationDialog open={dialogOpen && hydrated} onClose={closeDialog} onCreate={create} />
    </>
  );
}
