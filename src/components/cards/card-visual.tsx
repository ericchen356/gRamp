import { Lock } from "lucide-react";
import { RampLogo } from "@/components/shell/ramp-logo";
import type { CardType } from "@/data/cards";
import { cn } from "@/lib/cn";

type CardVisualProps = {
  type: CardType;
  last4: string;
  cardholder?: string;
  name?: string;
  expires?: string;
  locked?: boolean;
  /** `sm` = 40px table thumbnail, `md` = 168px tile, `lg` = 344px hero card. */
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Visa wordmark approximation (white on physical, ink on virtual). */
function VisaMark({ className }: { className?: string }) {
  return <span className={cn("font-sans leading-none font-bold tracking-[-0.04em] italic", className)}>VISA</span>;
}

/** Contactless waves. */
function Contactless({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      <path d="M5 4.5a5 5 0 0 1 0 7" />
      <path d="M8 3a7.5 7.5 0 0 1 0 10" />
      <path d="M11 1.5a10 10 0 0 1 0 13" />
    </svg>
  );
}

/** EMV chip. */
function Chip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 22" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="29" height="21" rx="4" fill="#cfc6b3" stroke="#b6ac97" />
      <path d="M10 0.5v21M20 0.5v21M0.5 7.5H10M20 7.5h9.5M0.5 14.5H10M20 14.5h9.5" stroke="#a69d88" strokeWidth="0.8" fill="none" />
      <rect x="10" y="5" width="10" height="12" rx="2" fill="none" stroke="#a69d88" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * Ramp card art. Physical cards are matte black with the Ramp mark; virtual
 * cards are a warm off-white with a hairline edge.
 */
export function CardVisual({ type, last4, cardholder, name, expires, locked, size = "sm", className }: CardVisualProps) {
  const physical = type === "physical";

  if (size === "sm") {
    return (
      <span
        className={cn(
          "relative inline-flex h-[26px] w-[40px] shrink-0 flex-col justify-between overflow-hidden rounded-[3px] px-[4px] py-[3px]",
          physical ? "bg-[#151312] text-white" : "border border-line-strong bg-[#faf9f7] text-ink",
          className,
        )}
        aria-hidden
      >
        <RampLogo className={cn("size-[9px]", physical ? "text-white" : "text-ink")} />
        <span className={cn("self-end text-[7px] leading-none tracking-[0.02em] tabular", physical ? "text-white/80" : "text-ink-2")}>
          {last4}
        </span>
        {locked && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/45">
            <Lock className="size-[11px] stroke-[2] text-white" />
          </span>
        )}
      </span>
    );
  }

  const lg = size === "lg";

  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col justify-between overflow-hidden",
        lg ? "h-[216px] w-[344px] rounded-[14px] p-[22px]" : "h-[106px] w-[168px] rounded-[8px] p-3",
        physical
          ? "bg-[linear-gradient(135deg,#2a2725_0%,#141211_55%,#0b090a_100%)] text-white shadow-[0_18px_40px_-18px_rgb(11_9_10/0.55)]"
          : "border border-line-strong bg-[linear-gradient(135deg,#ffffff_0%,#f7f5f2_60%,#efece8_100%)] text-ink shadow-[0_18px_40px_-22px_rgb(11_9_10/0.25)]",
        className,
      )}
      aria-label={`${physical ? "Physical" : "Virtual"} card ending in ${last4}`}
    >
      {/* Subtle sheen */}
      <span
        className={cn(
          "pointer-events-none absolute -top-1/2 -right-1/4 h-[140%] w-[70%] rotate-[18deg]",
          physical ? "bg-white/[0.035]" : "bg-white/50",
        )}
      />

      <div className="relative flex items-start justify-between">
        <RampLogo className={cn(lg ? "size-7" : "size-4", physical ? "text-white" : "text-ink")} />
        <span className={cn("leading-none", lg ? "text-[12px]" : "text-[9px]", physical ? "text-white/60" : "text-ink-3")}>
          {physical ? "Physical" : "Virtual"}
        </span>
      </div>

      {lg && physical && (
        <div className="relative flex items-center gap-3">
          <Chip className="h-[26px] w-[36px]" />
          <Contactless className="size-[18px] text-white/70" />
        </div>
      )}
      {lg && !physical && name && <div className="relative truncate text-[15px] text-ink-1">{name}</div>}

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          {lg && cardholder && (
            <div className={cn("truncate text-[12px] uppercase tracking-[0.08em]", physical ? "text-white/70" : "text-ink-2")}>
              {cardholder}
            </div>
          )}
          <div className={cn("tabular", lg ? "mt-1.5 text-[17px] tracking-[0.12em]" : "text-[11px] tracking-[0.08em]")}>
            •••• {last4}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {lg && expires && (
            <span className={cn("text-[11px] tabular", physical ? "text-white/60" : "text-ink-3")}>{expires}</span>
          )}
          <VisaMark className={cn(lg ? "text-[22px]" : "text-[12px]", physical ? "text-white" : "text-[#1a1f71]")} />
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/40 backdrop-blur-[1px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-[12px] text-ink">
            <Lock className="size-3 stroke-[1.75]" /> Locked
          </span>
        </div>
      )}
    </div>
  );
}
