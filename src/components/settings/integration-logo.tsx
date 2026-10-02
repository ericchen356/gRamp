import type { ReactNode } from "react";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { cn } from "@/lib/cn";

/**
 * Brand marks for integrations the shared MerchantLogo doesn't know yet
 * (accounting and HR systems). Everything else falls through to MerchantLogo.
 * Brand hex values are allowed here per CONVENTIONS (brand marks).
 */
const marks: Record<string, { bg: string; rounded?: boolean; mark: ReactNode }> = {
  quickbooks: {
    bg: "#2ca01c",
    mark: (
      <svg viewBox="0 0 32 32" className="size-[78%]" aria-hidden>
        <path d="M12.5 10.5h-1a5.5 5.5 0 0 0 0 11h1.5v-2.2h-1.5a3.3 3.3 0 0 1 0-6.6h1v11.3h2.2V10.5z" fill="#fff" />
        <path d="M19.5 21.5h1a5.5 5.5 0 0 0 0-11H19v2.2h1.5a3.3 3.3 0 0 1 0 6.6h-1V8H17.3v13.5z" fill="#fff" />
      </svg>
    ),
  },
  netsuite: {
    bg: "#1f3a5f",
    rounded: true,
    mark: (
      <svg viewBox="0 0 32 32" className="size-[64%]" aria-hidden>
        <path d="M8 7h5v13h-5zM19 12h5v13h-5z" fill="#fff" />
        <path d="M8 7h5l11 18h-5z" fill="#b8c7da" />
      </svg>
    ),
  },
  xero: {
    bg: "#13b5ea",
    mark: <span className="text-[11px] leading-none font-semibold tracking-tight text-white">xero</span>,
  },
  "sage intacct": {
    bg: "#00d639",
    mark: <span className="text-[10px] leading-none font-bold tracking-tight text-[#0b090a]">sage</span>,
  },
  bamboohr: {
    bg: "#73c41d",
    mark: <span className="font-serif text-[13px] leading-none font-bold text-white italic">b</span>,
  },
  "microsoft teams": {
    bg: "#4b53bc",
    rounded: true,
    mark: <span className="text-[13px] leading-none font-bold text-white">T</span>,
  },
  okta: {
    bg: "#000000",
    mark: <span className="block size-[42%] rounded-full border-[3px] border-white" />,
  },
};

export function IntegrationLogo({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const brand = marks[name.toLowerCase()];
  if (!brand) return <MerchantLogo name={name} size={size} className={className} />;
  return (
    <span
      style={{ width: size, height: size, background: brand.bg }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        brand.rounded ? "rounded-[6px]" : "rounded-full",
        className,
      )}
      aria-hidden
    >
      {brand.mark}
    </span>
  );
}
