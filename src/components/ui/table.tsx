import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Data table primitives. Ramp tables are full-bleed: the first and last cells
 * carry the page gutter, columns are separated by hairlines, and the header is
 * a 32px row of 12px muted labels.
 */
export function Table({ children, className, minWidth }: { children: ReactNode; className?: string; minWidth?: number }) {
  return (
    <div className={cn("overflow-x-auto scrollbar-thin", className)}>
      <table className="w-full border-collapse text-left" style={minWidth ? { minWidth } : undefined}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children, sticky }: { children: ReactNode; sticky?: boolean }) {
  return <thead className={cn(sticky && "sticky top-0 z-10 bg-canvas")}>{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

type ThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  sort?: "asc" | "desc" | null;
  align?: "left" | "right" | "center";
  /** Hairline on the right edge, separating columns. */
  divider?: boolean;
};

export function Th({ children, className, sort, align = "left", divider = true, ...props }: ThProps) {
  return (
    <th
      className={cn(
        "h-8 border-b border-line px-3 text-[12px] font-normal whitespace-nowrap text-ink-3 first:pl-page last:pr-page",
        divider && "border-r last:border-r-0",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    >
      <span className={cn("flex items-center gap-1", align === "right" && "justify-end", align === "center" && "justify-center")}>
        <span className={cn(sort !== undefined && "flex-1")}>{children}</span>
        {sort === "desc" && <ArrowDown className="size-3.5 stroke-[1.5] text-ink-1" />}
        {sort === "asc" && <ArrowUp className="size-3.5 stroke-[1.5] text-ink-1" />}
      </span>
    </th>
  );
}

export function Tr({
  children,
  className,
  selected,
  interactive = true,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { selected?: boolean; interactive?: boolean }) {
  return (
    <tr
      className={cn(
        "group/row border-b border-line-soft",
        interactive && "cursor-pointer hover:bg-subtle",
        selected && "bg-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center";
  divider?: boolean;
};

export function Td({ children, className, align = "left", divider = true, ...props }: TdProps) {
  return (
    <td
      className={cn(
        "h-[58px] px-3 align-middle text-[13px] text-ink-1 first:pl-page last:pr-page",
        divider && "border-r border-line last:border-r-0",
        align === "right" && "text-right tabular",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

/** Primary + secondary line inside a cell ("$6,238.04 / 23 transactions"). */
export function CellStack({
  primary,
  secondary,
  className,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 leading-tight", className)}>
      <div className="truncate text-[14px] text-ink">{primary}</div>
      {secondary && <div className="mt-0.5 truncate text-[12px] text-ink-2">{secondary}</div>}
    </div>
  );
}

/** Sticky footer under a table: bulk "Select" on the left, totals on the right. */
export function TableFooter({
  left,
  right,
  sticky = true,
  className,
}: {
  left?: ReactNode;
  right?: ReactNode;
  /** Pin to the bottom of the viewport (default). Disable for tables that aren't the page's main content. */
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-10 items-center justify-between border-t border-line bg-canvas px-page text-[12px] text-ink-2",
        sticky && "sticky bottom-0 z-10",
        className,
      )}
    >
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2 tabular">{right}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {icon && <div className="mb-4 text-ink-4 [&_svg]:size-8 [&_svg]:stroke-[1.25]">{icon}</div>}
      <p className="text-[16px] text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-ink-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
