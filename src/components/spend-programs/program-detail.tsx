"use client";

import { ArrowRight, Check, FilePenLine, MoreHorizontal, MoreVertical, Plus, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { MenuDivider, MenuItem, MenuLabel, Popover } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Stat } from "@/components/ui/stat";
import { EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { SpendMeter } from "@/components/cards/card-status";
import { CardVisual } from "@/components/cards/card-visual";
import { merchantCategories } from "@/data/cards";
import { people } from "@/data/people";
import {
  cardCount,
  memberCount,
  requestBehaviorLabels,
  type ProgramMember,
  type RequestBehavior,
  type SpendProgram,
} from "@/data/spend-programs";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { ProgramIcon } from "./program-icon";
import { usePrograms } from "./programs-store";

const behaviorOptions = (Object.keys(requestBehaviorLabels) as RequestBehavior[]).map((value) => ({
  value,
  label: requestBehaviorLabels[value],
}));
const cardTypeOptions = (["Virtual", "Physical", "Virtual or physical"] as const).map((value) => ({ value, label: value }));
const frequencyOptions = (["Monthly", "Quarterly", "Yearly", "One-time"] as const).map((value) => ({ value, label: value }));
const allCategories = [...new Set([...merchantCategories.map((c) => c.id), "Education", "Electronics", "Hardware", "Shipping", "Health & Fitness"])];

/** /spend-programs/[id] entry: resolves the program from the client store. */
export function ProgramDetail({ id }: { id: string }) {
  const { programs } = usePrograms();
  const program = programs.find((p) => p.id === id);
  if (!program) {
    return (
      <EmptyState
        icon={<FilePenLine />}
        title="Program not found"
        description="It may have been archived."
        action={
          <Link href="/spend-programs" className="text-[13px] text-ink underline underline-offset-2">
            Back to spend programs
          </Link>
        }
      />
    );
  }
  return <ProgramDetailView program={program} />;
}

function ProgramDetailView({ program }: { program: SpendProgram }) {
  const { updateProgram } = usePrograms();
  const toast = useToast();
  const [tab, setTab] = useState<"members" | "policy">("members");

  const update = (patch: Partial<SpendProgram>, message: string) => {
    updateProgram(program.id, { ...patch, updated: "2026-10-02" });
    toast.show(message);
  };

  const candidates = people.filter((p) => !program.members.some((m) => m.name === p.name));

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Spend programs"
        eyebrowHref="/spend-programs"
        title={program.name}
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
                  <MenuItem onSelect={() => { close(); toast.show(`${program.name} duplicated as a draft`); }}>Duplicate program</MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show("Request link copied", "neutral"); }}>Copy request link</MenuItem>
                  <MenuDivider />
                  <MenuItem destructive onSelect={() => { close(); toast.show(`${program.name} archived`, "neutral"); }}>
                    Archive program
                  </MenuItem>
                </>
              )}
            </Popover>
            {program.status === "draft" ? (
              <Button size="lg" variant="primary" onClick={() => update({ status: "active" }, `${program.name} published`)}>
                Publish program
              </Button>
            ) : (
              <Popover
                align="end"
                panelClassName="min-w-[240px] max-h-80 overflow-y-auto scrollbar-thin"
                trigger={({ toggle }) => (
                  <Button size="lg" variant="primary" onClick={toggle} className="gap-2">
                    <UserPlus className="size-4 stroke-[1.5]" />
                    Add members
                  </Button>
                )}
              >
                {(close) => (
                  <>
                    <MenuLabel>Invite to program</MenuLabel>
                    {candidates.map((person) => (
                      <MenuItem
                        key={person.id}
                        icon={<Avatar name={person.name} size={20} />}
                        hint={person.department}
                        onSelect={() => {
                          close();
                          update(
                            {
                              members: [
                                ...program.members,
                                { name: person.name, limit: program.memberLimit, spent: 0, joined: "2026-10-02", pending: true },
                              ],
                            },
                            `${person.name} invited to ${program.name}`,
                          );
                        }}
                      >
                        {person.name}
                      </MenuItem>
                    ))}
                  </>
                )}
              </Popover>
            )}
          </>
        }
      />
      <div className="mt-3 flex items-center gap-3 px-page text-[14px] text-ink-2">
        <ProgramIcon icon={program.icon} size={22} className="rounded-[4px]" />
        <span className="truncate">{program.description}</span>
        <span className="text-ink-4">·</span>
        {program.status === "draft" ? <Tag tone="outline">Draft</Tag> : <Status tone="success">Active</Status>}
        <span className="text-ink-4">·</span>
        <span className="shrink-0">Owned by {program.owner}</span>
      </div>

      <Tabs
        className="mt-7"
        value={tab}
        onChange={(value) => setTab(value as typeof tab)}
        items={[
          { label: "Members", value: "members", count: program.members.length },
          { label: "Policy settings", value: "policy" },
        ]}
      />

      {tab === "members" ? (
        <MembersTab program={program} update={update} />
      ) : (
        <PolicyTab program={program} update={update} />
      )}
    </div>
  );
}

type Update = (patch: Partial<SpendProgram>, message: string) => void;

function MembersTab({ program, update }: { program: SpendProgram; update: Update }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = program.members.filter((m) => !q || m.name.toLowerCase().includes(q));
  const issued = program.members.filter((m) => !m.pending);
  const spent = issued.reduce((sum, m) => sum + m.spent, 0);

  const setMember = (member: ProgramMember, patch: Partial<ProgramMember> | null, message: string) =>
    update(
      {
        members: patch
          ? program.members.map((m) => (m === member ? { ...m, ...patch } : m))
          : program.members.filter((m) => m !== member),
      },
      message,
    );

  return (
    <>
      <section className="flex gap-[66px] px-page pt-9 pb-10">
        <Stat label="Spent this month" value={formatMoney(program.spentThisMonth || spent)} size="lg" />
        <Stat
          label="Program limit"
          value={formatMoneyWhole(program.monthlyLimit)}
          caption={`${Math.round(((program.spentThisMonth || spent) / program.monthlyLimit) * 100)}% used · monthly`}
          size="lg"
        />
        <Stat label="Members" value={memberCount(program)} caption={pluralize(program.members.filter((m) => m.pending).length, "pending request")} size="lg" />
        <Stat label="Cards" value={cardCount(program)} caption={`${program.cardType} · ${formatMoneyWhole(program.memberLimit)} default`} size="lg" />
      </section>

      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} placeholder="Search members..." />
        </ToolbarRow>
      </Toolbar>

      {rows.length ? (
        <Table className="border-t border-line" minWidth={1100}>
          <THead>
            <tr>
              <Th>Member</Th>
              <Th className="w-[240px]">Card</Th>
              <Th className="w-[140px]" align="right">
                Limit
              </Th>
              <Th className="w-[240px]">Spent</Th>
              <Th className="w-[110px]">Joined</Th>
              <Th className="w-[170px]">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </THead>
          <TBody>
            {rows.map((member, index) => {
              const person = people.find((p) => p.name === member.name);
              return (
                <Tr key={`${member.name}-${member.cardLast4 ?? index}`} interactive={false} className="hover:bg-subtle">
                  <Td className="h-[60px]">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size={28} />
                      <div className="min-w-0 leading-tight">
                        <div className="truncate text-[13px] text-ink">{member.name}</div>
                        <div className="mt-0.5 truncate text-[12px] text-ink-2">{person?.title}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {member.cardLast4 ? (
                      <span className="flex items-center gap-2.5">
                        <CardVisual type={program.cardType === "Physical" ? "physical" : "virtual"} last4={member.cardLast4} />
                        <span className="text-ink-2 tabular">···· {member.cardLast4}</span>
                      </span>
                    ) : (
                      <Tag tone="warning">{member.pending ? "Requested" : "No card"}</Tag>
                    )}
                  </Td>
                  <Td align="right">
                    {formatMoneyWhole(member.limit)}
                    <span className="text-ink-3"> / {program.frequency === "One-time" ? "total" : program.frequency.replace("ly", "").toLowerCase()}</span>
                  </Td>
                  <Td>{member.pending ? <span className="text-ink-4">—</span> : <SpendMeter spent={member.spent} limit={member.limit} />}</Td>
                  <Td className="text-ink-2">{formatDate(member.joined)}</Td>
                  <Td>
                    {member.pending ? (
                      <span className="flex items-center gap-1.5">
                        <Button
                          size="xs"
                          variant="approve"
                          className="gap-1"
                          onClick={() =>
                            setMember(
                              member,
                              { pending: false, cardLast4: String(1000 + ((member.name.length * 937) % 8999)) },
                              `Card issued to ${member.name}`,
                            )
                          }
                        >
                          <Check className="size-3 stroke-[2]" />
                          Approve
                        </Button>
                        <IconButton size="sm" variant="bare" label="Decline request" onClick={() => setMember(member, null, `Request from ${member.name} declined`)}>
                          <X />
                        </IconButton>
                      </span>
                    ) : (
                      <span className="flex justify-end">
                        <Popover
                          align="end"
                          trigger={({ toggle }) => (
                            <IconButton variant="bare" label={`Actions for ${member.name}`} onClick={toggle}>
                              <MoreHorizontal />
                            </IconButton>
                          )}
                        >
                          {(close) => (
                            <>
                              <MenuItem onSelect={() => { close(); setMember(member, { limit: member.limit * 1.5 }, `Limit raised to ${formatMoneyWhole(member.limit * 1.5)}`); }}>
                                Raise limit 50%
                              </MenuItem>
                              <MenuItem onSelect={() => { close(); setMember(member, { limit: program.memberLimit }, "Limit reset to program default"); }}>
                                Reset to default limit
                              </MenuItem>
                              <MenuDivider />
                              <MenuItem destructive onSelect={() => { close(); setMember(member, null, `${member.name} removed from ${program.name}`); }}>
                                Remove from program
                              </MenuItem>
                            </>
                          )}
                        </Popover>
                      </span>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      ) : (
        <EmptyState
          icon={<UserPlus />}
          title={program.members.length ? "No matching members" : `${memberCount(program)} employees eligible`}
          description={
            program.members.length
              ? "Try a different search."
              : "Everyone in the eligible group can request a card. Requests will appear here."
          }
        />
      )}
      <div className="flex-1" />
      <TableFooter right={<span>{pluralize(rows.length, "member")} · {formatMoney(spent)} spent</span>} />
    </>
  );
}

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[72px] items-center gap-8 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] text-ink">{title}</div>
        <div className="mt-0.5 text-[12px] text-ink-2">{description}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

const grouped = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

function MoneyField({ value, onCommit, label, suffix }: { value: number; onCommit: (value: number) => void; label: string; suffix?: string }) {
  const [draft, setDraft] = useState(grouped(value));
  return (
    <label className="flex h-9 w-[150px] items-center gap-1 rounded-[2px] border border-line-strong bg-canvas px-2.5 text-[13px] text-ink hover:border-ink-5 focus-within:border-ink-3">
      <span className="text-ink-3">{suffix === "days" ? "" : "$"}</span>
      <input
        aria-label={label}
        value={draft}
        inputMode="decimal"
        onChange={(event) => setDraft(event.target.value.replace(/[^\d.,]/g, ""))}
        onBlur={() => {
          const next = Number(draft.replace(/,/g, ""));
          if (draft === "" || !Number.isFinite(next)) return setDraft(grouped(value));
          if (next !== value) onCommit(next);
          else setDraft(grouped(value));
        }}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        className="w-full min-w-0 bg-transparent tabular outline-none"
      />
      {suffix && <span className="shrink-0 text-[12px] text-ink-3">{suffix}</span>}
    </label>
  );
}

function PolicyTab({ program, update }: { program: SpendProgram; update: Update }) {
  const remaining = allCategories.filter((c) => !program.categories.includes(c));
  const approvalSteps = program.request === "approval" ? program.approvers : [];

  return (
    <div className="pb-16">
      <section className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 border-b border-line px-page py-9">
        <div>
          <SectionHeading size="md">Access</SectionHeading>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">Who can get a card from this program and what kind of card they receive.</p>
        </div>
        <div className="divide-y divide-line-soft border-y border-line">
          <SettingRow title="Who can get a card" description="Requests from eligible employees follow the approval chain below.">
            <Select
              variant="field"
              className="w-[300px]"
              label="Request behavior"
              value={program.request}
              options={behaviorOptions}
              onChange={(v) => update({ request: v as RequestBehavior }, "Request behavior updated")}
              placeholder="Choose"
            />
          </SettingRow>
          <SettingRow title="Card type" description="Physical cards ship to the employee’s address on file.">
            <Select
              variant="field"
              className="w-[200px]"
              label="Card type"
              value={program.cardType}
              options={cardTypeOptions}
              onChange={(v) => update({ cardType: v as SpendProgram["cardType"] }, "Card type updated")}
              placeholder="Card type"
            />
          </SettingRow>
          <SettingRow title="Approval chain" description="Each step must approve before the card is issued.">
            <div className="flex items-center gap-2 text-[13px] text-ink-1">
              <span className="text-ink-2">Request</span>
              {approvalSteps.length === 0 && (
                <>
                  <ArrowRight className="size-3.5 stroke-[1.5] text-ink-4" />
                  <Tag tone="success">Auto-approved</Tag>
                </>
              )}
              {approvalSteps.map((step) => (
                <span key={step} className="flex items-center gap-2">
                  <ArrowRight className="size-3.5 stroke-[1.5] text-ink-4" />
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line-strong pr-2.5 pl-1 text-[12px]">
                    {step === "Manager" ? (
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-chip text-[10px] text-ink-2">M</span>
                    ) : (
                      <Avatar name={step} size={20} />
                    )}
                    {step === "Manager" ? "Their manager" : step}
                  </span>
                </span>
              ))}
              <ArrowRight className="size-3.5 stroke-[1.5] text-ink-4" />
              <span className="text-ink-2">Card issued</span>
            </div>
          </SettingRow>
        </div>
      </section>

      <section className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 border-b border-line px-page py-9">
        <div>
          <SectionHeading size="md">Limits</SectionHeading>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">Default limits for new cards. Existing cards keep their current limit unless reset.</p>
        </div>
        <div className="divide-y divide-line-soft border-y border-line">
          <SettingRow title="Default limit per member" description="Applied when a request is approved.">
            <MoneyField
              key={`member-${program.memberLimit}`}
              label="Default limit"
              value={program.memberLimit}
              onCommit={(memberLimit) => update({ memberLimit }, `Default limit set to ${formatMoney(memberLimit)}`)}
            />
            <Select
              variant="field"
              className="w-[140px]"
              label="Resets"
              value={program.frequency}
              options={frequencyOptions}
              onChange={(v) => update({ frequency: v as SpendProgram["frequency"] }, "Limit frequency updated")}
              placeholder="Frequency"
            />
          </SettingRow>
          <SettingRow title="Program monthly limit" description="Cards decline once the whole program reaches this amount.">
            <MoneyField
              key={`program-${program.monthlyLimit}`}
              label="Program limit"
              value={program.monthlyLimit}
              onCommit={(monthlyLimit) => update({ monthlyLimit }, `Program limit set to ${formatMoney(monthlyLimit)}`)}
            />
          </SettingRow>
        </div>
      </section>

      <section className="grid grid-cols-[300px_minmax(0,1fr)] gap-12 border-b border-line px-page py-9">
        <div>
          <SectionHeading size="md">Controls</SectionHeading>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-2">Where cards work and what employees need to submit.</p>
        </div>
        <div className="divide-y divide-line-soft border-y border-line">
          <div className="py-4">
            <div className="text-[14px] text-ink">Allowed merchant categories</div>
            <div className="mt-0.5 text-[12px] text-ink-2">
              {program.categories.length ? "Purchases outside these categories are declined." : "All categories are allowed."}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {program.categories.map((category) => (
                <span key={category} className="inline-flex h-7 items-center gap-1 rounded-full border border-line-strong bg-canvas pr-1.5 pl-3 text-[12px] text-ink-1">
                  {category}
                  <button
                    type="button"
                    aria-label={`Remove ${category}`}
                    onClick={() => update({ categories: program.categories.filter((c) => c !== category) }, `${category} removed`)}
                    className="rounded-full p-0.5 text-ink-3 hover:bg-muted hover:text-ink"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <Popover
                panelClassName="max-h-72 overflow-y-auto scrollbar-thin"
                trigger={({ toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 text-[12px] text-ink-2 hover:border-ink-5 hover:text-ink"
                  >
                    <Plus className="size-3.5 stroke-[1.75]" />
                    Add category
                  </button>
                )}
              >
                {(close) =>
                  remaining.map((category) => (
                    <MenuItem
                      key={category}
                      onSelect={() => {
                        close();
                        update({ categories: [...program.categories, category] }, `${category} allowed`);
                      }}
                    >
                      {category}
                    </MenuItem>
                  ))
                }
              </Popover>
            </div>
          </div>
          <SettingRow title="Require a receipt over" description="Set to $0 to require receipts on every purchase.">
            <MoneyField
              key={`receipt-${program.receiptThreshold}`}
              label="Receipt threshold"
              value={program.receiptThreshold}
              onCommit={(receiptThreshold) => update({ receiptThreshold }, "Receipt rule updated")}
            />
          </SettingRow>
          <SettingRow title="Auto-lock unused cards" description="Lock cards with no transactions after this many days.">
            <span className={cn(!program.autoLockDays && "pointer-events-none opacity-50")}>
              <MoneyField
                key={`lock-${program.autoLockDays ?? 30}`}
                label="Auto-lock days"
                suffix="days"
                value={program.autoLockDays ?? 30}
                onCommit={(autoLockDays) => update({ autoLockDays }, `Unused cards lock after ${autoLockDays} days`)}
              />
            </span>
            <Switch
              label="Auto-lock unused cards"
              checked={!!program.autoLockDays}
              onChange={(on) => update({ autoLockDays: on ? 30 : undefined }, on ? "Auto-lock turned on" : "Auto-lock turned off")}
            />
          </SettingRow>
        </div>
      </section>
    </div>
  );
}
