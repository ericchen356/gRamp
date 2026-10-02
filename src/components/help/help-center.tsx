"use client";

import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CreditCard,
  FileText,
  Landmark,
  Phone,
  Plane,
  Plus,
  ReceiptText,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterChip, SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { helpArticles, helpCategories, tickets, type HelpCategoryId, type TicketStatus } from "@/data/help";
import { cn } from "@/lib/cn";
import { formatDate, formatDateLong } from "@/lib/format";
import { SupportChat } from "./support-chat";

const categoryIcons: Record<HelpCategoryId, LucideIcon> = {
  cards: CreditCard,
  "bill-pay": ReceiptText,
  reimbursements: WalletCards,
  accounting: BookOpen,
  treasury: Landmark,
  travel: Plane,
};

const ticketTones: Record<TicketStatus, "info" | "warning" | "success"> = {
  Open: "info",
  "Waiting on you": "warning",
  Resolved: "success",
};

const quickSearches = ["Card limits", "QuickBooks", "Reimbursement", "Wire"];

export function HelpCenter() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HelpCategoryId | null>(null);
  const [ticketFilter, setTicketFilter] = useState<"All" | "Open" | "Resolved">("All");
  const [chatOpen, setChatOpen] = useState(false);

  const articles = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return helpArticles.filter(
      (a) => (!category || a.category === category) && words.every((word) => a.title.toLowerCase().includes(word)),
    );
  }, [query, category]);

  const visibleTickets = tickets.filter(
    (t) => ticketFilter === "All" || (ticketFilter === "Resolved" ? t.status === "Resolved" : t.status !== "Resolved"),
  );
  const awaiting = visibleTickets.filter((t) => t.status === "Waiting on you");
  const categoryName = helpCategories.find((c) => c.id === category)?.name;
  const searching = !!query.trim() || !!category;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-page pt-6">
        <p className="text-[15px] text-ink-2">Help center</p>
        <h1 className="mt-3 text-[52px] leading-[1.05] font-normal tracking-[-0.03em] text-ink">How can we help?</h1>
        <SearchField
          variant="underline"
          value={query}
          onChange={setQuery}
          placeholder="Search articles, e.g. “set a card limit”"
          className="mt-8 max-w-[760px]"
        />
        <div className="mt-4 flex items-center gap-2 text-[13px] text-ink-3">
          Popular:
          {quickSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="text-ink-2 underline decoration-ink-5 underline-offset-2 hover:text-ink hover:decoration-ink"
            >
              {term}
            </button>
          ))}
        </div>
      </header>

      <section className="mt-14 px-page">
        <div className="grid grid-cols-3 border-t border-l border-line">
          {helpCategories.map((c) => {
            const Icon = categoryIcons[c.id];
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(active ? null : c.id)}
                aria-pressed={active}
                className={cn(
                  "group relative flex flex-col items-start border-r border-b border-line p-6 text-left transition-colors",
                  active ? "bg-subtle" : "hover:bg-subtle",
                )}
              >
                {active && <span className="absolute inset-x-0 top-0 h-[2px] bg-ink" />}
                <Icon className="size-5 stroke-[1.25] text-ink-1" />
                <span className="mt-8 text-[18px] leading-snug tracking-[-0.01em] text-ink">{c.name}</span>
                <span className="mt-1 text-[13px] text-ink-2">{c.description}</span>
                <span className="mt-4 flex w-full items-center justify-between text-[12px] text-ink-3">
                  {c.articles} articles
                  <ArrowRight className="size-3.5 stroke-[1.5] opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-14 grid grid-cols-[minmax(0,1fr)_360px] gap-14 px-page">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4 pb-3">
            <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">
              {query.trim() ? `Results for “${query.trim()}”` : "Popular articles"}
            </h2>
            {category && <FilterChip label="Category" value={categoryName ?? ""} onRemove={() => setCategory(null)} />}
          </div>
          <ul className="border-t border-line">
            {articles.map((a) => {
              const Icon = categoryIcons[a.category];
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => toast.show(`Opening “${a.title}”`, "neutral")}
                    className="group flex w-full items-center gap-4 border-b border-line-soft py-3.5 text-left"
                  >
                    <FileText className="size-4 shrink-0 stroke-[1.5] text-ink-3" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-ink group-hover:underline group-hover:decoration-ink-4 group-hover:underline-offset-2">
                        {a.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-2">
                        <Icon className="size-3 stroke-[1.5]" />
                        {helpCategories.find((c) => c.id === a.category)?.name} · {a.readMinutes} min read · Updated {formatDate(a.updated)}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 stroke-[1.5] text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-2" />
                  </button>
                </li>
              );
            })}
          </ul>
          {!articles.length && (
            <div className="border-b border-line-soft py-10 text-center">
              <p className="text-[14px] text-ink">No articles found</p>
              <p className="mt-1 text-[13px] text-ink-2">Try different words, or ask our support team.</p>
            </div>
          )}
          {searching && articles.length > 0 && (
            <p className="mt-3 text-[12px] text-ink-3">
              Showing {articles.length} of {helpArticles.length} articles
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="border border-line bg-subtle p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">Chat with support</h3>
              <Status tone="success">Online</Status>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
              Our team typically replies in under 2 minutes. Plus customers are routed to a dedicated specialist.
            </p>
            <Button variant="primary" className="mt-5 w-full" onClick={() => setChatOpen(true)}>
              Start a chat
            </Button>
          </div>
          <div className="border border-line">
            <div className="flex items-center gap-3 border-b border-line px-6 py-4">
              <Phone className="size-4 stroke-[1.5] text-ink-2" />
              <div className="leading-tight">
                <div className="text-[14px] text-ink">(855) 206-7283</div>
                <div className="mt-0.5 text-[12px] text-ink-2">Mon–Fri, 8 AM – 8 PM ET</div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-[13px] text-ink-2">System status</span>
              <Status tone="success">All systems operational</Status>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-16 flex flex-col pb-10">
        <div className="flex items-center justify-between px-page pb-5">
          <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">Recent tickets</h2>
          <Button size="sm" onClick={() => toast.show("New ticket form opened", "neutral")}>
            <Plus className="size-3.5 stroke-[1.75]" />
            New ticket
          </Button>
        </div>
        <Toolbar>
          <ToolbarRow className="min-h-[46px] gap-1.5">
            {(["All", "Open", "Resolved"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTicketFilter(value)}
                className={cn(
                  "inline-flex h-7 items-center rounded-full px-3 text-[12px] transition-colors",
                  ticketFilter === value ? "bg-chip text-ink" : "text-ink-2 hover:bg-muted hover:text-ink",
                )}
              >
                {value}
              </button>
            ))}
          </ToolbarRow>
        </Toolbar>
        <Table className="border-t border-line" minWidth={980}>
          <THead>
            <tr>
              <Th className="w-[110px]">Ticket</Th>
              <Th>Subject</Th>
              <Th className="w-[150px]">Category</Th>
              <Th className="w-[170px]">Status</Th>
              <Th className="w-[150px]">Assigned to</Th>
              <Th className="w-[150px]" sort="desc">
                Last updated
              </Th>
            </tr>
          </THead>
          <TBody>
            {visibleTickets.map((t) => (
              <Tr key={t.id} onClick={() => toast.show(`Opening ticket ${t.id}`, "neutral")} className="[&>td]:h-[52px]">
                <Td className="text-ink-2 tabular">{t.id}</Td>
                <Td className="text-ink">{t.subject}</Td>
                <Td>{t.category}</Td>
                <Td>
                  <Status tone={ticketTones[t.status]}>{t.status}</Status>
                </Td>
                <Td>{t.agent}</Td>
                <Td className="text-ink-2">{formatDateLong(t.updated)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        {awaiting.length > 0 && (
          <p className="mt-4 flex items-center gap-2 px-page text-[12px] text-ink-2">
            <Tag tone="warning" className="h-[18px] text-[11px]">
              {awaiting.length} awaiting reply
            </Tag>
            Support is waiting on you for {awaiting.map((t) => `ticket ${t.id}`).join(", ")}.
          </p>
        )}
      </section>

      <SupportChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
