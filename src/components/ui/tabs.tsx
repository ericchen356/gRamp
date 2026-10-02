"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Count } from "./badge";
import type { ReactNode } from "react";

export type TabItem = {
  label: string;
  /** Route for link tabs. Omit when using controlled `value`/`onChange`. */
  href?: string;
  value?: string;
  count?: number;
  /** Highlights the count in Ramp lime (e.g. "Migrate payments 70"). */
  countTone?: "gray" | "limeStrong";
  tag?: ReactNode;
  /** Draws a thin vertical rule before this tab. */
  separatorBefore?: boolean;
};

type TabsProps = {
  items: TabItem[];
  /** Controlled mode (non-route tabs). */
  value?: string;
  onChange?: (value: string) => void;
  /** Full-width bottom hairline under the tab row. */
  bordered?: boolean;
  className?: string;
};

/**
 * Underlined page tabs. Route tabs match on exact pathname; the active tab's
 * count switches to an outlined pill as in production.
 */
export function Tabs({ items, value, onChange, bordered = true, className }: TabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("relative z-[1] flex items-end gap-1 px-page", bordered && "border-b border-line", className)}
      role="tablist"
    >
      {items.map((item, index) => {
        const key = item.value ?? item.href ?? item.label;
        const active = item.href ? pathname === item.href : value === key;
        const content = (
          <>
            <span>{item.label}</span>
            {item.count !== undefined && (
              <Count
                value={item.count}
                tone={active && item.countTone !== "limeStrong" ? "outline" : (item.countTone ?? "gray")}
              />
            )}
            {item.tag}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-[2px] bg-ink transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
          </>
        );
        const tabClass = cn(
          "relative flex h-11 items-center gap-2 px-[14px] text-[14px] whitespace-nowrap transition-colors",
          index === 0 && "-ml-[14px]",
          active ? "text-ink" : "text-ink-2 hover:text-ink",
        );

        return (
          <div key={key} className="flex items-center">
            {item.separatorBefore && <span className="mx-2 mb-2.5 h-6 w-px self-end bg-line" />}
            {item.href ? (
              <Link href={item.href} role="tab" aria-selected={active} className={tabClass}>
                {content}
              </Link>
            ) : (
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange?.(key)}
                className={tabClass}
              >
                {content}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/** Compact segmented toggle ("Line / Bar", "Monthly / Quarterly"). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex gap-3", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-[2px] border px-3 text-[14px] transition-colors [&_svg]:size-4 [&_svg]:stroke-[1.5]",
            value === option.value
              ? "border-ink-1 text-ink"
              : "border-line text-ink-3 hover:border-line-strong hover:text-ink-2",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
