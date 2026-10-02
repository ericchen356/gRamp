import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  /** Section label above the title, e.g. "Accounting". */
  eyebrow?: ReactNode;
  eyebrowHref?: string;
  title: ReactNode;
  /** Small muted number set next to the title baseline ("Ramp Card 279"). */
  count?: number;
  actions?: ReactNode;
  className?: string;
};

/** Page title block: muted eyebrow, 40px display title and right-aligned actions. */
export function PageHeader({ eyebrow, eyebrowHref, title, count, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-end justify-between gap-6 px-page pt-6", className)}>
      <div className="min-w-0">
        {eyebrow &&
          (eyebrowHref ? (
            <Link href={eyebrowHref} className="text-[15px] text-ink-2 hover:text-ink">
              {eyebrow}
            </Link>
          ) : (
            <p className="text-[15px] text-ink-2">{eyebrow}</p>
          ))}
        <h1 className="mt-3 flex items-baseline gap-3 text-[40px] leading-[1.1] font-normal tracking-[-0.025em] text-ink">
          <span className="truncate">{title}</span>
          {count !== undefined && (
            <span className="text-[15px] font-normal tracking-normal text-ink-3 tabular">{count}</span>
          )}
        </h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5 pb-1">{actions}</div>}
    </header>
  );
}

/** Secondary heading inside a page ("Migrate your spend", "Accounts"). */
export function SectionHeading({
  children,
  actions,
  className,
  size = "lg",
}: {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <h2
        className={cn(
          "font-normal tracking-[-0.015em] text-ink",
          size === "lg" ? "text-[30px] leading-tight" : "text-[18px] leading-snug",
        )}
      >
        {children}
      </h2>
      {actions}
    </div>
  );
}
