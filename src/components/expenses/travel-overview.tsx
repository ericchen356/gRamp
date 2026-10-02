"use client";

import { ArrowRight, BedDouble, Car, Check, MoreHorizontal, Plane } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AvatarStack } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { SectionHeading } from "@/components/ui/page-header";
import { MenuItem, Popover } from "@/components/ui/popover";
import { Sparkline } from "@/components/ui/sparkline";
import { Card, Stat } from "@/components/ui/stat";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { travelSpendTrend, travelStats, trips as seed, type Trip, type TripLeg, type TripPolicy } from "@/data/expenses";
import { formatDate, formatMoney, formatMoneyWhole } from "@/lib/format";
import { useExpenses } from "./expenses-store";

const policyTag: Record<TripPolicy, { label: string; tone: "success" | "warning" | "danger" }> = {
  in_policy: { label: "In policy", tone: "success" },
  pending_approval: { label: "Pending approval", tone: "warning" },
  out_of_policy: { label: "Out of policy", tone: "danger" },
};

function nights(start: string, end: string) {
  return Math.round((new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime()) / 86_400_000);
}

function LegRow({ leg }: { leg: TripLeg }) {
  const Icon = leg.kind === "flight" ? Plane : leg.kind === "hotel" ? BedDouble : Car;
  const brand = leg.kind === "flight" ? leg.carrier : leg.kind === "hotel" ? leg.brand : leg.company;

  return (
    <div className="flex items-center gap-4 py-3.5">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-ink-1">
        <Icon className="size-[15px] stroke-[1.5]" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        {leg.kind === "flight" && (
          <>
            <div className="flex items-center gap-2 text-[14px] text-ink">
              {leg.from}
              <ArrowRight className="size-3.5 stroke-[1.5] text-ink-3" />
              {leg.to}
            </div>
            <div className="mt-1 truncate text-[12px] text-ink-2">
              {formatDate(leg.date)} · {leg.departs} – {leg.arrives} · {leg.flight} · {leg.cabin}
            </div>
          </>
        )}
        {leg.kind === "hotel" && (
          <>
            <div className="truncate text-[14px] text-ink">{leg.name}</div>
            <div className="mt-1 truncate text-[12px] text-ink-2">
              Check in {formatDate(leg.checkIn)} · {leg.nights} {leg.nights === 1 ? "night" : "nights"} · {leg.city}
            </div>
          </>
        )}
        {leg.kind === "car" && (
          <>
            <div className="truncate text-[14px] text-ink">{leg.company} rental car</div>
            <div className="mt-1 truncate text-[12px] text-ink-2">
              Pick up {formatDate(leg.pickUp)} at {leg.city} · {leg.days} days
            </div>
          </>
        )}
      </div>
      <MerchantLogo name={brand} size={22} />
      <span className="w-[88px] shrink-0 text-right text-[13px] text-ink-1 tabular">
        {leg.amount ? formatMoney(leg.amount) : <span className="text-ink-3">Included</span>}
      </span>
    </div>
  );
}

function TripCard({ trip, onApprove }: { trip: Trip; onApprove: () => void }) {
  const toast = useToast();
  const total = trip.legs.reduce((sum, leg) => sum + leg.amount, 0);
  const policy = policyTag[trip.policy];

  return (
    <Card className="px-6 pt-5 pb-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h3 className="truncate text-[18px] leading-snug tracking-[-0.01em] text-ink">{trip.name}</h3>
            <Tag tone={policy.tone}>{policy.label}</Tag>
          </div>
          <p className="mt-1 text-[13px] text-ink-2">
            {trip.destination} · {formatDate(trip.start)} – {formatDate(trip.end)} · {nights(trip.start, trip.end)} nights ·{" "}
            {trip.purpose}
          </p>
        </div>
        <Popover
          align="end"
          trigger={({ toggle }) => (
            <IconButton variant="bare" label="Trip actions" onClick={toggle} className="-mr-2">
              <MoreHorizontal />
            </IconButton>
          )}
        >
          {(close) => (
            <>
              <MenuItem onSelect={() => { close(); toast.show("Opening booking in Ramp Travel", "neutral"); }}>Change booking</MenuItem>
              <MenuItem onSelect={() => { close(); toast.show(`Itinerary sent to ${trip.travelers.length} travelers`); }}>Email itinerary</MenuItem>
              <MenuItem destructive onSelect={() => { close(); toast.show(`Cancellation requested for ${trip.name}`, "neutral"); }}>
                Cancel trip
              </MenuItem>
            </>
          )}
        </Popover>
      </div>

      <div className="mt-3 divide-y divide-line-soft border-t border-line">
        {trip.legs.map((leg, index) => (
          <LegRow key={index} leg={leg} />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-4">
        <AvatarStack names={trip.travelers} size={26} />
        <span className="min-w-0 truncate text-[13px] text-ink-2">{trip.travelers.join(", ")}</span>
        <div className="ml-auto flex shrink-0 items-center gap-4">
          {trip.policyNote && (
            <span className={trip.policy === "out_of_policy" ? "text-[12px] text-flag" : "text-[12px] text-caution"}>
              {trip.policyNote}
            </span>
          )}
          <span className="text-[14px] text-ink tabular">{formatMoney(total)}</span>
          {trip.policy !== "in_policy" && (
            <Button size="xs" variant="approve" onClick={onApprove} className="gap-1">
              <Check className="size-3 stroke-[2]" />
              Approve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Expenses › Travel: upcoming trips booked through Ramp Travel and travel KPIs. */
export function TravelOverview() {
  const toast = useToast();
  const { policy } = useExpenses();
  const [trips, setTrips] = useState(seed);
  const [view, setView] = useState<"upcoming" | "attention">("upcoming");

  const travelRules = policy.find((section) => section.id === "travel")?.rules ?? [];
  const hotelCap = travelRules.find((rule) => rule.id === "hotel_cap")?.value ?? 300;
  const visible = view === "upcoming" ? trips : trips.filter((t) => t.policy !== "in_policy");
  const attention = trips.filter((t) => t.policy !== "in_policy").length;

  return (
    <div className="px-page pt-9 pb-16">
      <div className="flex items-end justify-between gap-10">
        <div className="flex gap-[66px]">
          <Stat
            label="Travel spend this quarter"
            value={formatMoney(travelStats.quarterSpend)}
            caption={<span className="text-warning">↑ {Math.round(travelStats.quarterChange * 100)}% vs last quarter</span>}
            size="lg"
          />
          <Stat label="Average flight" value={formatMoney(travelStats.avgFlight)} caption="Round trip, economy" size="lg" />
          <Stat label="Average nightly rate" value={formatMoney(travelStats.avgNightly)} caption={`Policy cap ${formatMoneyWhole(hotelCap)}`} size="lg" />
          <Stat label="Booked in policy" value={`${Math.round(travelStats.inPolicyRate * 100)}%`} caption="Last 90 days" size="lg" tone="money" />
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 xl:flex">
          <Sparkline data={travelSpendTrend} width={168} height={44} />
          <span className="text-[11px] text-ink-3">Apr – Sep</span>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)_300px] gap-8">
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeading size="md">Upcoming trips</SectionHeading>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: "upcoming", label: `All ${trips.length}` },
                { value: "attention", label: `Needs attention ${attention}` },
              ]}
              className="gap-2 [&_button]:h-8 [&_button]:text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-4">
            {visible.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onApprove={() => {
                  setTrips((list) => list.map((t) => (t.id === trip.id ? { ...t, policy: "in_policy", policyNote: undefined } : t)));
                  toast.show(`${trip.name} approved`);
                }}
              />
            ))}
            {visible.length === 0 && (
              <Card tone="subtle" className="py-14 text-center text-[13px] text-ink-2">
                Every upcoming trip is in policy.
              </Card>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card tone="subtle" className="p-5">
            <div className="flex items-center gap-2">
              <Tag tone="plus" className="h-5">
                Plus
              </Tag>
              <span className="text-[14px] text-ink">Ramp Travel</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
              Earn 5% back on hotels and flights booked through Ramp. Bookings are paid with the traveler’s card and matched to
              receipts automatically.
            </p>
            <Button size="sm" className="mt-4" onClick={() => toast.show("Opening Ramp Travel in a new tab", "neutral")}>
              Book a trip
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-ink">Travel policy</span>
              <Link href="/expenses/policy" className="text-[12px] text-ink-2 underline underline-offset-2 hover:text-ink">
                Edit
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line-soft text-[13px]">
              {travelRules.map((rule) => (
                <li key={rule.id} className="flex items-start justify-between gap-3 py-2.5">
                  <span className={rule.enabled ? "text-ink-1" : "text-ink-4 line-through"}>{rule.title}</span>
                  {rule.value !== undefined && (
                    <span className="shrink-0 text-ink-2 tabular">
                      {rule.unit === "days" ? `${rule.value} days` : formatMoneyWhole(rule.value)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <span className="text-[14px] text-ink">Travelers this month</span>
            <div className="mt-3 flex items-center justify-between">
              <AvatarStack names={[...new Set(trips.flatMap((t) => t.travelers))]} size={28} max={5} />
              <span className="text-[26px] leading-none tracking-[-0.02em] text-ink tabular">{travelStats.travelersThisMonth}</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
