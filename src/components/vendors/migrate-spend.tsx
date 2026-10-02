"use client";

import { Columns3, MoreVertical, Rows3, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuItem, Popover } from "@/components/ui/popover";
import { SectionHeading } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Stat } from "@/components/ui/stat";
import { CellStack, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { company, currentUser, people } from "@/data/people";
import { migrationCandidates, migrationSummary, paymentCards, type MigrationCandidate } from "@/data/vendors";
import { formatMoney, pluralize } from "@/lib/format";

type RowState = { cardholder: string | null; card: string | null };

const cardholderOptions = people.map((person) => ({
  value: person.name,
  label: person.id === currentUser.id ? `${person.name} (You)` : person.name,
}));

export function MigrateSpend() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(migrationCandidates);
  const [state, setState] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(migrationCandidates.map((c) => [c.id, { cardholder: c.cardholder ?? null, card: null }])),
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => `${r.merchant} ${r.category}`.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const patch = (id: string, next: Partial<RowState>) =>
    setState((current) => ({ ...current, [id]: { ...current[id], ...next } }));

  const remove = (candidate: MigrationCandidate, message: string) => {
    setRows((current) => current.filter((r) => r.id !== candidate.id));
    toast.show(message);
  };

  return (
    <>
      <section className="px-page pt-[66px] pb-14">
        <SectionHeading
          actions={
            <Popover
              trigger={({ toggle }) => (
                <IconButton variant="bare" label="Migration options" onClick={toggle} className="ml-3 [&_svg]:size-[18px]">
                  <MoreVertical />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={close}>Upload another statement</MenuItem>
                  <MenuItem onSelect={close}>Show dismissed merchants</MenuItem>
                  <MenuItem onSelect={close}>How migration works</MenuItem>
                </>
              )}
            </Popover>
          }
        >
          Migrate your spend
        </SectionHeading>
        <p className="mt-5 text-[14px] text-ink-2">
          We’ve generated this list from your past transactions on your credit card statement.
        </p>
        <div className="mt-8 flex gap-[66px]">
          <Stat label="Estimated cashback" value={formatMoney(migrationSummary.estimatedCashback)} tone="money" size="lg" />
          <Stat label="Total identified spend" value={formatMoney(migrationSummary.totalIdentifiedSpend)} size="lg" />
        </div>
      </section>

      <Toolbar>
        <ToolbarRow className="min-h-[50px]">
          <SearchField variant="pill" value={query} onChange={setQuery} placeholder="Search or add filter..." />
          <div className="ml-auto flex gap-2.5">
            <IconButton label="Row density">
              <Rows3 />
            </IconButton>
            <IconButton label="Columns">
              <Columns3 />
            </IconButton>
          </div>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1180}>
        <THead>
          <tr>
            <Th className="w-[22%]">Merchant name</Th>
            <Th className="w-[19%]" sort="desc">
              Detected spend
            </Th>
            <Th className="w-[19%]">Cardholder</Th>
            <Th className="w-[19%]">Payment card</Th>
            <Th>Next step</Th>
          </tr>
        </THead>
        <TBody>
          {visible.map((candidate) => {
            const row = state[candidate.id];
            const ready = !!row.cardholder && !!row.card;
            const isYou = row.cardholder === currentUser.name;
            return (
              <Tr key={candidate.id} interactive={false} className="hover:bg-subtle/60">
                <Td className="h-[65px]">
                  <div className="flex items-center gap-[25px]">
                    <MerchantLogo name={candidate.merchant} size={33} />
                    <CellStack
                      primary={<span className="text-[16px]">{candidate.merchant}</span>}
                      secondary={<span className="text-[12.5px]">{candidate.category}</span>}
                    />
                  </div>
                </Td>
                <Td>
                  <CellStack
                    primary={<span className="text-[14.5px] tabular">{formatMoney(candidate.detectedSpend)}</span>}
                    secondary={<span className="text-[12.5px]">{pluralize(candidate.transactionCount, "transaction")}</span>}
                  />
                </Td>
                <Td className="pr-5">
                  <Select
                    label="Cardholder"
                    value={row.cardholder}
                    options={cardholderOptions}
                    onChange={(cardholder) => patch(candidate.id, { cardholder })}
                    placeholder="Choose cardholder"
                    hint={
                      row.cardholder
                        ? `${company.name} · ${people.find((p) => p.name === row.cardholder)?.location ?? company.location}`
                        : `Suggested: ${candidate.suggestedCardholder}`
                    }
                  />
                </Td>
                <Td className="pr-5">
                  <Select
                    label="Payment card"
                    value={row.card}
                    disabled={!row.cardholder}
                    options={paymentCards}
                    onChange={(card) => patch(candidate.id, { card })}
                    placeholder="Choose card"
                    hint={row.cardholder && !row.card ? `Suggested: ${candidate.suggestedCard ?? `${candidate.merchant} card`}` : undefined}
                  />
                </Td>
                <Td>
                  <div className="flex items-center gap-[22px]">
                    <Button
                      size="sm"
                      variant={ready ? "primary" : "muted"}
                      className="h-8 min-w-[63px] px-3 text-[13px]"
                      onClick={() =>
                        ready
                          ? remove(candidate, `${candidate.merchant} ${isYou ? "migrated" : "assigned"} to ${row.card === "new" ? "a new virtual card" : paymentCards.find((c) => c.value === row.card)?.label}`)
                          : toast.show(`Choose a ${row.cardholder ? "payment card" : "cardholder"} for ${candidate.merchant} first`, "neutral")
                      }
                    >
                      {row.cardholder === currentUser.name ? "Migrate" : "Assign"}
                    </Button>
                    <IconButton
                      variant="bare"
                      label={`Dismiss ${candidate.merchant}`}
                      onClick={() => remove(candidate, `${candidate.merchant} removed from your migration list`)}
                      className="text-ink [&_svg]:size-[17px]"
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
      <div className="flex-1" />
      <TableFooter
        right={
          <span>
            {pluralize(visible.length, "merchant")} · {formatMoney(visible.reduce((sum, r) => sum + r.detectedSpend, 0))} detected
          </span>
        }
      />
    </>
  );
}
