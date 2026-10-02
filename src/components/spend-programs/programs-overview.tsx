"use client";

import { LayoutGrid, List, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { MenuItem, Popover } from "@/components/ui/popover";
import { Card, Stat } from "@/components/ui/stat";
import { CellStack, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { SpendMeter } from "@/components/cards/card-status";
import { cardCount, memberCount, requestBehaviorLabels, requestBehaviorShort, type SpendProgram } from "@/data/spend-programs";
import { cn } from "@/lib/cn";
import { formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { NewProgramDialog } from "./new-program-dialog";
import { ProgramIcon, RequestBehaviorIcon } from "./program-icon";
import { usePrograms } from "./programs-store";

type Filter = "all" | "active" | "draft";

function ProgramCard({ program }: { program: SpendProgram }) {
  const toast = useToast();
  return (
    <Card className="group relative flex flex-col transition-colors hover:border-line-strong">
      <Link href={`/spend-programs/${program.id}`} className="absolute inset-0 z-0" aria-label={program.name} />
      <div className="pointer-events-none relative flex flex-1 flex-col px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <ProgramIcon icon={program.icon} />
          {program.status === "draft" && <Tag tone="outline">Draft</Tag>}
        </div>
        <h3 className="mt-4 text-[18px] leading-snug tracking-[-0.01em] text-ink">{program.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-[40px] text-[13px] leading-[20px] text-ink-2">{program.description}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <div>
            <div className="text-[12px] text-ink-2">Members</div>
            <div className="mt-0.5 text-[15px] text-ink tabular">{memberCount(program)}</div>
          </div>
          <div>
            <div className="text-[12px] text-ink-2">Cards</div>
            <div className="mt-0.5 text-[15px] text-ink tabular">{cardCount(program)}</div>
          </div>
          <div>
            <div className="text-[12px] text-ink-2">Monthly limit</div>
            <div className="mt-0.5 text-[15px] text-ink tabular">{formatMoneyWhole(program.monthlyLimit)}</div>
          </div>
        </div>
        <SpendMeter className="mt-4" spent={program.spentThisMonth} limit={program.monthlyLimit} caption="this month" />
      </div>
      <div className="pointer-events-none relative flex items-center gap-2 border-t border-line px-5 py-3 text-[12px] text-ink-2">
        <RequestBehaviorIcon behavior={program.request} />
        <span className="min-w-0 flex-1 truncate">{requestBehaviorShort[program.request]}</span>
        <Button
          size="xs"
          className="pointer-events-auto"
          onClick={() =>
            toast.show(
              program.request === "admin"
                ? `${program.name} cards are issued by admins`
                : `Request link for ${program.name} copied`,
              "neutral",
            )
          }
        >
          {program.request === "admin" ? "Issue card" : "Copy request link"}
        </Button>
      </div>
    </Card>
  );
}

/** /spend-programs: program templates as a card grid or a table. */
export function ProgramsOverview() {
  const { programs } = usePrograms();
  const toast = useToast();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter(
      (p) => (filter === "all" || p.status === filter) && (!q || `${p.name} ${p.description} ${p.owner}`.toLowerCase().includes(q)),
    );
  }, [programs, filter, query]);

  const active = programs.filter((p) => p.status === "active");
  const totalLimit = active.reduce((sum, p) => sum + p.monthlyLimit, 0);
  const totalSpent = active.reduce((sum, p) => sum + p.spentThisMonth, 0);
  const totalCards = active.reduce((sum, p) => sum + cardCount(p), 0);
  const drafts = programs.length - active.length;

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Spend programs"
        count={programs.length}
        actions={
          <>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <IconButton variant="bare" label="More actions" onClick={toggle} className="mr-1.5 [&_svg]:size-[18px]">
                  <MoreVertical />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={() => { close(); toast.show("Programs exported to CSV", "neutral"); }}>Export programs</MenuItem>
                  <MenuItem onSelect={() => { close(); router.push("/expenses/policy"); }}>Company expense policy</MenuItem>
                </>
              )}
            </Popover>
            <Button size="lg" onClick={() => toast.show("Template gallery: Software, Travel, Meals, Events, Stipends", "neutral")}>
              Browse templates
            </Button>
            <Button size="lg" variant="primary" onClick={() => setCreating(true)}>
              New program
            </Button>
          </>
        }
      />
      <Tabs
        className="mt-7"
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
        items={[
          { label: "All programs", value: "all", count: programs.length },
          { label: "Active", value: "active", count: active.length },
          { label: "Drafts", value: "draft", count: drafts },
        ]}
      />

      <section className="flex gap-[66px] px-page pt-9 pb-10">
        <Stat label="Spent through programs this month" value={formatMoney(totalSpent)} size="lg" />
        <Stat label="Combined monthly limit" value={formatMoneyWhole(totalLimit)} caption={`${Math.round((totalSpent / totalLimit) * 100)}% used`} size="lg" />
        <Stat label="Cards issued from programs" value={totalCards} caption={pluralize(active.length, "active program")} size="lg" />
      </section>

      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} placeholder="Search programs..." />
          <div className="ml-auto flex items-center gap-2">
            <IconButton
              label="Grid view"
              onClick={() => setView("grid")}
              className={cn(view === "grid" && "border-ink-3 bg-muted")}
            >
              <LayoutGrid />
            </IconButton>
            <IconButton label="List view" onClick={() => setView("list")} className={cn(view === "list" && "border-ink-3 bg-muted")}>
              <List />
            </IconButton>
          </div>
        </ToolbarRow>
      </Toolbar>

      {view === "grid" ? (
        <div className="grid grid-cols-3 gap-5 border-t border-line px-page pt-8 pb-14">
          {visible.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex min-h-[300px] flex-col items-center justify-center gap-3 border border-dashed border-line-strong text-[14px] text-ink-2 transition-colors hover:border-ink-5 hover:bg-subtle hover:text-ink"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-canvas">
              <Plus className="size-4 stroke-[1.5]" />
            </span>
            New program
          </button>
        </div>
      ) : (
        <>
          <Table className="border-t border-line" minWidth={1180}>
            <THead>
              <tr>
                <Th>Program</Th>
                <Th className="w-[180px]">Owner</Th>
                <Th className="w-[96px]" align="right">
                  Members
                </Th>
                <Th className="w-[80px]" align="right">
                  Cards
                </Th>
                <Th className="w-[240px]">Spent this month</Th>
                <Th className="w-[250px]">Who can get a card</Th>
              </tr>
            </THead>
            <TBody>
              {visible.map((program) => (
                <Tr key={program.id} onClick={() => router.push(`/spend-programs/${program.id}`)}>
                  <Td className="h-[62px]">
                    <div className="flex items-center gap-3">
                      <ProgramIcon icon={program.icon} size={30} />
                      <CellStack
                        primary={
                          <span className="flex items-center gap-2 text-[13px]">
                            {program.name}
                            {program.status === "draft" && (
                              <Tag tone="outline" className="h-[18px] text-[11px]">
                                Draft
                              </Tag>
                            )}
                          </span>
                        }
                        secondary={program.description}
                      />
                    </div>
                  </Td>
                  <Td>
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar name={program.owner} size={22} />
                      <span className="truncate">{program.owner}</span>
                    </span>
                  </Td>
                  <Td align="right">{memberCount(program)}</Td>
                  <Td align="right">{cardCount(program)}</Td>
                  <Td>
                    <SpendMeter spent={program.spentThisMonth} limit={program.monthlyLimit} />
                  </Td>
                  <Td>
                    <span className="flex items-center gap-2 text-[13px]">
                      <RequestBehaviorIcon behavior={program.request} />
                      <span className="truncate">{requestBehaviorLabels[program.request]}</span>
                    </span>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <div className="flex-1" />
          <TableFooter right={<span>{pluralize(visible.length, "program")}</span>} />
        </>
      )}

      <NewProgramDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
