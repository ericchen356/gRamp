"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Section with an 18px title and a disclosure chevron that hangs in the gutter
 * to the left of the title ("Requires your approval", "Accounts").
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="group -ml-[23px] flex items-center gap-[9px] text-left"
      >
        <ChevronDown
          className={cn(
            "size-3.5 stroke-[1.75] text-ink-1 transition-transform duration-150",
            !open && "-rotate-90",
          )}
        />
        <h2 className="text-[18px] leading-snug tracking-[-0.01em] text-ink">{title}</h2>
      </button>
      {open && (
        <div id={id} className="animate-fade-in">
          {children}
        </div>
      )}
    </section>
  );
}

/** Smaller grouping row inside a section ("⌄ Acme Corporation   $32,614,887.89"). */
export function CollapsibleGroup({
  label,
  meta,
  children,
  defaultOpen = true,
}: {
  label: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex h-[50px] w-full items-center gap-[11px] pr-[18px] pl-2 text-left text-[14px] text-ink-2 hover:text-ink-1"
      >
        <ChevronDown
          className={cn("size-3.5 stroke-[1.75] transition-transform duration-150", !open && "-rotate-90")}
        />
        <span className="flex-1 truncate">{label}</span>
        {meta && <span className="tabular">{meta}</span>}
      </button>
      {open && (
        <div id={id} className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
