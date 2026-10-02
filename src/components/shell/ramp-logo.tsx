import { cn } from "@/lib/cn";

/** The Ramp mark: a rising crescent over a small horizon dome. */
export function RampLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-label="Ramp" className={cn("size-5 text-ink", className)}>
      <path
        fill="currentColor"
        d="M2.4 15.2C8 14.4 12.9 10.4 16 3.2c1.4 6.3-2.4 12.5-12.4 15.4-1 .3-1.9-.4-1.9-1.5 0-.9.2-1.7.7-1.9Z"
      />
      <path fill="currentColor" d="M11.3 19.6c2.1-2.7 6.1-2.9 8.4 0Z" />
    </svg>
  );
}
