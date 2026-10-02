"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MenuDivider, MenuItem, MenuLabel } from "@/components/ui/popover";
import { Stat } from "@/components/ui/stat";
import { Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { FilterChip } from "@/components/ui/toolbar";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { cardStatusLabels, type CardStatus, type CardType, type RampCard } from "@/data/cards";
import { cn } from "@/lib/cn";
import { formatMoney, formatMoneyWhole, pluralize } from "@/lib/format";
import { CardRowMenu } from "./card-actions";
import { CardStatusDot, SpendMeter } from "./card-status";
import { CardVisual } from "./card-visual";
import { useCards } from "./cards-store";
import { EditLimitDialog } from "./edit-limit-dialog";

const statuses: CardStatus[] = ["active", "locked", "not_activated", "terminated"];

/** Funds & cards › Cards: KPI strip and the full card inventory. */
export function CardsTable() {
  const { cards } = useCards();
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<CardType | null>(null);
  const [status, setStatus] = useState<CardStatus | null>(null);
  const [dense, setDense] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const live = cards.filter((c) => c.status !== "terminated");
  const totalLimit = live.reduce((sum, c) => sum + (c.frequency === "Monthly" ? c.limit : 0), 0);
  const spent = live.reduce((sum, c) => sum + c.spent, 0);
  const active = live.filter((c) => c.status === "active").length;
  const locked = live.filter((c) => c.status === "locked").length;
  const pending = live.filter((c) => c.status === "not_activated").length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (!type || c.type === type) &&
        (status ? c.status === status : c.status !== "terminated") &&
        (!q || `${c.name} ${c.cardholder} ${c.last4} ${c.program ?? ""}`.toLowerCase().includes(q)),
    );
  }, [cards, type, status, query]);

  const editingCard = cards.find((c) => c.id === editing) ?? null;
  const cellHeight = dense ? "h-[48px]" : "h-[62px]";

  return (
    <>
      <section className="flex gap-[66px] px-page pt-9 pb-10">
        <Stat label="Monthly limits" value={formatMoneyWhole(totalLimit)} caption="Across recurring monthly cards" size="lg" />
        <Stat label="Spent this month" value={formatMoney(spent)} caption={`${Math.round((spent / totalLimit) * 100)}% of monthly limits`} size="lg" />
        <Stat label="Active cards" value={active} caption={`${locked} locked · ${pending} not activated`} size="lg" />
        <Stat label="Cashback this month" value={formatMoney(spent * 0.015)} caption="1.5% on all card spend" size="lg" tone="money" />
      </section>

      <DataToolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search cards, cardholders, last 4..."
        filterCount={(type ? 1 : 0) + (status ? 1 : 0)}
        onClearFilters={() => {
          setType(null);
          setStatus(null);
        }}
        dense={{ value: dense, onChange: setDense }}
        options={[
          { label: "Export CSV", onSelect: () => toast.show("Card export started. We'll email you the CSV.", "neutral") },
          { label: "Lock all inactive cards", onSelect: () => toast.show("3 inactive cards locked", "neutral") },
          { label: "Card settings", onSelect: () => toast.show("Opening card settings", "neutral") },
        ]}
        chips={
          <>
            {type && <FilterChip label="Type" value={type === "virtual" ? "Virtual" : "Physical"} onRemove={() => setType(null)} />}
            {status && <FilterChip label="Status" value={cardStatusLabels[status]} onRemove={() => setStatus(null)} />}
          </>
        }
        filterMenu={(close) => (
          <>
            <MenuLabel>Card type</MenuLabel>
            {(["virtual", "physical"] as CardType[]).map((value) => (
              <MenuItem key={value} selected={type === value} onSelect={() => { setType(value); close(); }}>
                {value === "virtual" ? "Virtual" : "Physical"}
              </MenuItem>
            ))}
            <MenuDivider />
            <MenuLabel>Status</MenuLabel>
            {statuses.map((value) => (
              <MenuItem key={value} selected={status === value} onSelect={() => { setStatus(value); close(); }}>
                {cardStatusLabels[value]}
              </MenuItem>
            ))}
          </>
        )}
      />

      <Table className="border-t border-line" minWidth={1220}>
        <THead>
          <tr>
            <Th>Card</Th>
            <Th className="w-[200px]">Cardholder</Th>
            <Th className="w-[104px]">Type</Th>
            <Th className="w-[232px]">Spent</Th>
            <Th className="w-[112px]">Resets</Th>
            <Th className="w-[180px]">Spend program</Th>
            <Th className="w-[136px]">Status</Th>
            <Th className="w-[60px]" align="center">
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              cellHeight={cellHeight}
              onOpen={() => router.push(`/cards/${card.id}`)}
              onEditLimit={() => setEditing(card.id)}
            />
          ))}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <CreditCard className="size-7 stroke-[1.25] text-ink-4" />
          <p className="mt-3 text-[15px] text-ink">No cards found</p>
          <p className="mt-1 text-[13px] text-ink-2">Try another search or clear your filters.</p>
        </div>
      )}

      <div className="flex-1" />
      <TableFooter
        right={
          <>
            <span>{pluralize(rows.length, "card")}</span>
            <span>·</span>
            <span>{formatMoney(rows.reduce((sum, c) => sum + c.spent, 0))} spent</span>
          </>
        }
      />

      <EditLimitDialog card={editingCard} onClose={() => setEditing(null)} />
    </>
  );
}

function CardRow({
  card,
  cellHeight,
  onOpen,
  onEditLimit,
}: {
  card: RampCard;
  cellHeight: string;
  onOpen: () => void;
  onEditLimit: () => void;
}) {
  const muted = card.status === "terminated";
  return (
    <Tr onClick={onOpen} className={cn(muted && "text-ink-4 [&_*]:text-ink-4")}>
      <Td className={cellHeight}>
        <div className="flex items-center gap-3.5">
          <CardVisual type={card.type} last4={card.last4} locked={card.status === "locked"} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] text-ink">{card.name}</div>
            <div className="mt-0.5 text-[11px] text-ink-2 tabular">···· {card.last4}</div>
          </div>
        </div>
      </Td>
      <Td className={cellHeight}>
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={card.cardholder} size={22} />
          <span className="truncate">{card.cardholder}</span>
        </span>
      </Td>
      <Td className={cellHeight}>{card.type === "virtual" ? "Virtual" : "Physical"}</Td>
      <Td className={cellHeight}>
        <SpendMeter spent={card.spent} limit={card.limit} />
      </Td>
      <Td className={cn("text-ink-2", cellHeight)}>{card.frequency}</Td>
      <Td className={cn("truncate", cellHeight)}>{card.program ?? <span className="text-ink-4">None</span>}</Td>
      <Td className={cellHeight}>
        <CardStatusDot status={card.status} />
      </Td>
      <Td align="center" className={cellHeight} onClick={(event) => event.stopPropagation()}>
        <CardRowMenu card={card} onEditLimit={onEditLimit} />
      </Td>
    </Tr>
  );
}
