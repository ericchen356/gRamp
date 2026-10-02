import { Lock, Wifi } from "lucide-react";
import { RampLogo } from "@/components/shell/ramp-logo";
import type { MyCard } from "@/data/my-ramp";
import { cn } from "@/lib/cn";

const finishes: Record<MyCard["finish"], { face: string; ink: string; muted: string }> = {
  black: { face: "bg-[linear-gradient(135deg,#232120_0%,#0b090a_55%,#1a1817_100%)]", ink: "text-white", muted: "text-white/55" },
  sage: { face: "bg-[linear-gradient(135deg,#e4e8de_0%,#cfd6c7_100%)]", ink: "text-ink", muted: "text-ink/50" },
  stone: { face: "bg-[linear-gradient(135deg,#efebe7_0%,#e2ddd8_100%)]", ink: "text-ink", muted: "text-ink/50" },
};

/** Card face at ISO/IEC 7810 proportions (85.6 × 54mm). */
export function CardVisual({ card, revealed = false }: { card: MyCard; revealed?: boolean }) {
  const finish = finishes[card.finish];
  return (
    <div
      className={cn(
        "relative aspect-[1.586] w-full overflow-hidden rounded-[10px] p-4 shadow-[0_1px_2px_rgb(31_28_27/0.08),0_8px_20px_-8px_rgb(31_28_27/0.25)]",
        finish.face,
        finish.ink,
        card.kind === "Virtual" && "ring-1 ring-ink/5 ring-inset",
      )}
    >
      {card.finish === "black" && (
        <span className="pointer-events-none absolute -top-1/2 -right-1/4 size-[120%] rounded-full bg-white/[0.04]" />
      )}
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <RampLogo className={cn("size-6", finish.ink)} />
          <span className={cn("text-[11px] tracking-wide", finish.muted)}>{card.kind === "Virtual" ? "Virtual" : <Wifi className="size-4 rotate-90 stroke-[1.5]" />}</span>
        </div>
        {card.kind === "Physical" && (
          <span className="h-[26px] w-[34px] rounded-[5px] bg-[linear-gradient(135deg,#d9c48a,#b59a58)] opacity-90" aria-hidden />
        )}
        <div className="flex items-end justify-between">
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px]">{card.name}</div>
            <div className={cn("mt-1 text-[12px] tracking-[0.12em] tabular", finish.muted)}>
              {revealed ? `4821 6602 1193 ${card.last4}` : `•••• ${card.last4}`}
              <span className="ml-3 tracking-normal">{card.expires}</span>
            </div>
          </div>
          <span className="shrink-0 text-[17px] font-semibold tracking-[-0.02em] italic">VISA</span>
        </div>
      </div>
      {card.status === "Locked" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/45 text-white backdrop-blur-[1px]">
          <Lock className="size-5 stroke-[1.5]" />
        </div>
      )}
    </div>
  );
}
