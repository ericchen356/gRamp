"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
};

/** 13px square checkbox matching Ramp's table selection control. */
export function Checkbox({ checked, indeterminate, onChange, label, className }: CheckboxProps) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "inline-flex size-[13px] shrink-0 items-center justify-center rounded-[2px] border transition-colors",
        on ? "border-ink bg-ink text-canvas" : "border-ink-3 bg-canvas hover:border-ink-1",
        className,
      )}
    >
      {indeterminate ? (
        <Minus className="size-2.5 stroke-[3]" />
      ) : (
        checked && <Check className="size-2.5 stroke-[3]" />
      )}
    </button>
  );
}

/** Pill switch for settings rows. */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-ink" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 size-4 rounded-full bg-canvas shadow-sm transition-transform",
          checked && "translate-x-4",
        )}
      />
    </button>
  );
}
