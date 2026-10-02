"use client";

import { ArrowDownUp, Inbox as InboxIcon, MoreVertical } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { MenuItem, MenuLabel, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { inboxItems, inboxTabs, type InboxItem, type InboxType } from "@/data/inbox";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { InboxDetail } from "./inbox-detail";
import { ItemIcon, itemMeta, itemTiming, itemTitle } from "./inbox-helpers";
import { TextArea } from "@/components/ui/field";

type Tab = "all" | InboxType;
type Sort = "newest" | "oldest" | "amount" | "due";

const sortLabels: Record<Sort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  amount: "Largest amount",
  due: "Due soonest",
};

const EXIT_MS = 220;

function InboxRow({
  item,
  selected,
  leaving,
  onSelect,
  onApprove,
  onDecline,
  onUpload,
  onRemind,
}: {
  item: InboxItem;
  selected: boolean;
  leaving: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onDecline: () => void;
  onUpload: () => void;
  onRemind: () => void;
}) {
  const timing = itemTiming(item);
  const stop = (fn: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    fn();
  };
  return (
    <li
      data-inbox-id={item.id}
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group/row relative flex cursor-pointer items-center gap-4 border-b border-line-soft py-3.5 pr-6 pl-page transition-[background-color,opacity,transform] duration-200",
        selected ? "bg-subtle" : "hover:bg-subtle/70",
        leaving && "pointer-events-none translate-x-3 opacity-0",
      )}
    >
      {selected && <span className="absolute inset-y-0 left-0 w-[3px] bg-ink" />}
      <ItemIcon item={item} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[14px] text-ink">{itemTitle(item)}</div>
        <div className="mt-1 truncate text-[12px] text-ink-2">{itemMeta(item)}</div>
        {item.warning && <div className="mt-1 truncate text-[12px] text-warning">{item.warning}</div>}
      </div>
      <span className={cn("w-[76px] shrink-0 text-right text-[12px] tabular", timing.overdue ? "text-warning" : "text-ink-3")}>
        {timing.label}
      </span>
      <div className="flex w-[154px] shrink-0 justify-end gap-2">
        {item.type === "missing" ? (
          <>
            <Button size="xs" className="w-[66px]" onClick={stop(onRemind)}>
              Remind
            </Button>
            <Button size="xs" variant="approve" className="w-[70px]" onClick={stop(onUpload)}>
              {item.missing?.includes("receipt") ? "Upload" : "Resolve"}
            </Button>
          </>
        ) : (
          <>
            <Button size="xs" className="w-[66px]" onClick={stop(onDecline)}>
              Decline
            </Button>
            <Button size="xs" variant="approve" className="w-[70px]" onClick={stop(onApprove)}>
              Approve
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

function DeclineDialog({ item, onClose, onConfirm }: { item: InboxItem | null; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={!!item} onClose={onClose}>
      {item && (
        <>
          <DialogHeader
            title="Decline request"
            description={`${item.requester} will be notified with your reason.`}
            onClose={onClose}
          />
          <div className="px-6 pt-3 pb-6">
            <div className="mb-4 flex items-center justify-between border border-line bg-subtle px-3.5 py-3 text-[13px]">
              <span className="truncate text-ink-1">{itemTitle(item).replace(/^Approve /, "")}</span>
              <span className="ml-4 shrink-0 text-ink tabular">{formatMoney(item.amount)}</span>
            </div>
            <label className="mb-1.5 block text-[12px] text-ink-2" htmlFor="decline-reason">
              Reason
            </label>
            <TextArea
              id="decline-reason"
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Please split this across the two cost centers and resubmit."
            />
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                onConfirm(reason);
                setReason("");
              }}
            >
              Decline
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}

/** Inbox: tabbed task list with a split-view detail pane. */
export function InboxView({ initialTab }: { initialTab: Tab }) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [declining, setDeclining] = useState<InboxItem | null>(null);

  const open = useMemo(() => inboxItems.filter((item) => !resolved.has(item.id)), [resolved]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = open.filter(
      (item) =>
        (tab === "all" || item.type === tab) &&
        (!q || `${itemTitle(item)} ${itemMeta(item)} ${item.category}`.toLowerCase().includes(q)),
    );
    const sorted = [...filtered];
    if (sort === "newest") sorted.sort((a, b) => b.submitted.localeCompare(a.submitted));
    if (sort === "oldest") sorted.sort((a, b) => a.submitted.localeCompare(b.submitted));
    if (sort === "amount") sorted.sort((a, b) => b.amount - a.amount);
    if (sort === "due") sorted.sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
    return sorted;
  }, [open, tab, query, sort]);

  const selectedIndex = rows.findIndex((item) => item.id === selectedId);
  const activeIndex = selectedIndex === -1 ? 0 : selectedIndex;
  const selected = rows[activeIndex] ?? null;

  const counts = useMemo(() => {
    const removed = inboxItems.filter((item) => resolved.has(item.id));
    return Object.fromEntries(
      inboxTabs.map((t) => [t.value, t.count - removed.filter((item) => t.value === "all" || item.type === t.value).length]),
    ) as Record<Tab, number>;
  }, [resolved]);

  const changeTab = (next: string) => {
    setTab(next as Tab);
    setSelectedId(null);
    const alias = next === "all" ? "" : `?tab=${{ approval: "approvals", missing: "missing", reimbursement: "reimbursements", bill: "bills", card: "cards" }[next as InboxType]}`;
    window.history.replaceState(null, "", `/inbox${alias}`);
  };

  const move = useCallback(
    (delta: number) => {
      const next = rows[Math.min(rows.length - 1, Math.max(0, activeIndex + delta))];
      if (!next) return;
      setSelectedId(next.id);
      document.querySelector(`[data-inbox-id="${next.id}"]`)?.scrollIntoView({ block: "nearest" });
    },
    [rows, activeIndex],
  );

  const resolve = (item: InboxItem, message: string, tone: "success" | "neutral" = "success") => {
    const index = rows.findIndex((r) => r.id === item.id);
    const successor = rows[index + 1] ?? rows[index - 1];
    setLeaving((current) => new Set(current).add(item.id));
    window.setTimeout(() => {
      setResolved((current) => new Set(current).add(item.id));
      setLeaving((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
      if (item.id === selected?.id) setSelectedId(successor?.id ?? null);
    }, EXIT_MS);
    toast.show(message, tone);
  };

  const approve = (item: InboxItem) => resolve(item, `${itemTitle(item).replace(/^Approve/, "Approved")}`);
  const upload = (item: InboxItem) =>
    resolve(item, item.missing?.includes("receipt") ? `Receipt uploaded for ${item.merchant} · ${formatMoney(item.amount)}` : `Memo resolved for ${item.merchant}`);
  const remind = (item: InboxItem) => toast.show(`Reminder sent to ${item.requester}`, "neutral");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, [role=dialog]") || event.metaKey || event.ctrlKey) return;
      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        move(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Inbox"
        actions={
          <>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <IconButton variant="bare" label="Inbox options" onClick={toggle} className="mr-1 [&_svg]:size-[18px]">
                  <MoreVertical />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={() => { close(); toast.show("Approvals delegated to Tina Cruz until Oct 9", "neutral"); }}>Delegate approvals</MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show("Notification settings saved", "neutral"); }}>Notification settings</MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show("Exporting inbox (CSV)", "neutral"); }}>Export</MenuItem>
                </>
              )}
            </Popover>
            <Button size="lg" onClick={() => toast.show(`Reminders sent for ${counts.missing} missing items`, "neutral")}>
              Remind all
            </Button>
          </>
        }
      />
      <Tabs
        className="mt-[30px] shrink-0"
        value={tab}
        onChange={changeTab}
        items={inboxTabs.map((t, i) => ({ label: t.label, value: t.value, count: counts[t.value], separatorBefore: i === 1 }))}
      />
      <Toolbar className="shrink-0 border-t-0 border-b border-line">
        <ToolbarRow className="min-h-[50px]">
          <SearchField value={query} onChange={setQuery} placeholder="Search inbox..." />
          <Popover
            align="end"
            trigger={({ toggle }) => (
              <Button pill size="sm" onClick={toggle} className="h-8 gap-1.5 px-3 text-[12px]">
                <ArrowDownUp className="size-3.5 stroke-[1.75]" />
                {sortLabels[sort]}
              </Button>
            )}
          >
            {(close) => (
              <>
                <MenuLabel>Sort by</MenuLabel>
                {(Object.keys(sortLabels) as Sort[]).map((key) => (
                  <MenuItem key={key} selected={key === sort} onSelect={() => { setSort(key); close(); }}>
                    {sortLabels[key]}
                  </MenuItem>
                ))}
              </>
            )}
          </Popover>
        </ToolbarRow>
      </Toolbar>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
          {rows.length === 0 ? (
            <EmptyState
              icon={<InboxIcon />}
              title={query ? "No matching tasks" : "You’re all caught up"}
              description={query ? `Nothing in this view matches “${query}”.` : "New approvals and missing items will show up here."}
            />
          ) : (
            <ul>
              {rows.map((item) => (
                <InboxRow
                  key={item.id}
                  item={item}
                  selected={item.id === selected?.id}
                  leaving={leaving.has(item.id)}
                  onSelect={() => setSelectedId(item.id)}
                  onApprove={() => approve(item)}
                  onDecline={() => setDeclining(item)}
                  onUpload={() => upload(item)}
                  onRemind={() => remind(item)}
                />
              ))}
            </ul>
          )}
          {rows.length > 0 && (
            <p className="px-page py-5 text-[12px] text-ink-3">
              Showing {rows.length} of {counts[tab]} · Use ↑ ↓ to move between tasks
            </p>
          )}
        </div>
        <aside className="w-[440px] shrink-0 border-l border-line bg-canvas">
          {selected ? (
            <InboxDetail
              key={selected.id}
              item={selected}
              index={activeIndex}
              total={rows.length}
              onMove={move}
              onApprove={approve}
              onDecline={setDeclining}
              onUpload={upload}
              onRemind={remind}
            />
          ) : (
            <EmptyState icon={<InboxIcon />} title="Nothing selected" description="Pick a task to see its details." />
          )}
        </aside>
      </div>

      <DeclineDialog
        item={declining}
        onClose={() => setDeclining(null)}
        onConfirm={(reason) => {
          if (!declining) return;
          resolve(declining, `Declined · ${declining.requester} was notified${reason ? " with your note" : ""}`, "neutral");
          setDeclining(null);
        }}
      />
    </div>
  );
}
