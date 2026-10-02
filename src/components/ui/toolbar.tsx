"use client";

import { Lock, Plus, Search, X } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Off-white band that hosts search, filters and view controls above tables. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  // -mt-px collapses the hairline into a bordered tab row directly above.
  return <div className={cn("-mt-px border-t border-line bg-subtle px-page", className)}>{children}</div>;
}

export function ToolbarRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex min-h-[52px] items-center gap-3", className)}>{children}</div>;
}

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  /** `bare` = borderless inline search; `pill` = outlined rounded field. */
  variant?: "bare" | "pill" | "underline";
};

export function SearchField({ value, onChange, variant = "bare", className, placeholder = "Search...", ...props }: SearchFieldProps) {
  return (
    <label
      className={cn(
        "group flex items-center gap-2 text-ink-1",
        variant === "bare" && "h-9 min-w-[280px] flex-1",
        variant === "pill" &&
          "h-8 w-[200px] rounded-full border border-line-strong bg-canvas px-3 focus-within:border-ink-3",
        variant === "underline" && "h-14 border-b border-line focus-within:border-ink-3",
        className,
      )}
    >
      {variant !== "underline" && <Search className="size-[13px] shrink-0 stroke-[1.75] text-ink-2" />}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full min-w-0 bg-transparent outline-none placeholder:text-ink-3",
          variant === "underline" ? "text-[20px] placeholder:text-ink-2" : "text-[13px]",
        )}
        {...props}
      />
      {value && variant !== "underline" && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="text-ink-3 hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
      {variant === "underline" && <Search className="size-5 shrink-0 stroke-[1.5] text-ink-2" />}
    </label>
  );
}

/** A locked, pre-applied filter: "🔒 Accounting status | Ready to sync". */
export function LockedFilter({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-chip py-0.5 pr-0.5 pl-2.5 text-[12px] text-ink-3">
      <Lock className="size-3 stroke-[1.75]" />
      {label}
      <span className="ml-1 inline-flex h-full items-center rounded-full bg-subtle px-2.5 text-ink-3">{value}</span>
    </span>
  );
}

/** Removable applied filter chip. */
export function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line-strong bg-canvas pr-1.5 pl-3 text-[12px] text-ink-2">
      {label}
      <span className="text-ink-1">{value}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`} className="rounded-full p-0.5 hover:bg-muted">
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

export function AddFilterButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 text-[12px] text-ink-1 hover:bg-muted"
    >
      <Plus className="size-3.5 stroke-[1.75]" />
      Filter
    </button>
  );
}
