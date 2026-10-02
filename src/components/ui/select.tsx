"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MenuItem, Popover } from "./popover";

export type SelectOption = { value: string; label: string; description?: string };

type SelectProps = {
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder: string;
  /** Muted helper line below the value ("Suggested: Alexander Bass"). */
  hint?: ReactNode;
  /**
   * `inline` = borderless select; `cell` = table cell (13px, chevron on hover);
   * `field` = boxed form input; `underline` = large filter field.
   */
  variant?: "inline" | "cell" | "field" | "underline";
  disabled?: boolean;
  className?: string;
  label?: string;
};

export function Select({
  value,
  options,
  onChange,
  placeholder,
  hint,
  variant = "inline",
  disabled,
  className,
  label,
}: SelectProps) {
  const current = options.find((option) => option.value === value);

  return (
    <Popover
      className={cn("w-full", className)}
      panelClassName="w-full max-h-72 overflow-auto scrollbar-thin"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
          aria-label={label}
          aria-expanded={open}
          className={cn(
            "group/select flex w-full items-center gap-2 text-left",
            variant === "field" &&
              "h-10 rounded-[2px] border border-line-strong bg-canvas px-3 hover:border-ink-5",
            variant === "underline" && "h-14 border-b border-line text-[20px]",
            open && variant === "field" && "border-ink-3",
          )}
        >
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate",
                variant === "underline" ? "text-[20px]" : variant === "cell" ? "text-[13px]" : "text-[14px]",
                current ? (variant === "cell" ? "text-ink-1" : "text-ink") : disabled ? "text-ink-4" : "text-ink-2",
              )}
            >
              {current?.label ?? placeholder}
            </span>
            {hint && <span className="mt-1 block truncate text-[12px] text-ink-2">{hint}</span>}
          </span>
          {!disabled && (
            <ChevronDown
              className={cn(
                "shrink-0 stroke-[1.5] text-ink-2 transition-transform",
                variant === "underline" ? "size-5" : "size-3.5",
                variant === "cell" && !open && "opacity-0 group-hover/row:opacity-100 group-hover/select:opacity-100",
                open && "rotate-180",
              )}
            />
          )}
        </button>
      )}
    >
      {(close) =>
        options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            hint={option.description}
            onSelect={() => {
              onChange(option.value);
              close();
            }}
          >
            {option.label}
          </MenuItem>
        ))
      }
    </Popover>
  );
}
