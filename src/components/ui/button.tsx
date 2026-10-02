import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "muted" | "approve" | "danger" | "link";
type Size = "xs" | "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-lime text-ink hover:bg-lime-hover active:bg-lime-hover",
  secondary: "bg-canvas text-ink border border-line-strong hover:bg-subtle hover:border-ink-5",
  ghost: "text-ink-1 hover:bg-muted",
  muted: "bg-muted text-ink-4 hover:text-ink-2",
  approve: "bg-canvas text-approve border border-approve-line hover:bg-success-bg",
  danger: "bg-canvas text-danger border border-line-strong hover:bg-danger-bg",
  link: "text-ink underline underline-offset-2 decoration-ink-4 hover:decoration-ink h-auto! px-0!",
};

const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-[12px] gap-1",
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-9 px-4 text-[14px] gap-2",
  lg: "h-10 px-[18px] text-[15px] gap-2",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Fully rounded pill (e.g. the table "Options" menu). */
  pill?: boolean;
};

/** Ramp buttons are square-cornered; `pill` is used for toolbar controls. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", pill, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-normal transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ink/20 disabled:pointer-events-none",
        pill ? "rounded-full" : "rounded-[2px]",
        variants[variant],
        sizes[size],
        variant !== "muted" && "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual weight: outlined circle (toolbar), filled chip, or bare. */
  variant?: "outline" | "filled" | "bare";
  size?: "sm" | "md";
  label: string;
};

/** Circular icon-only control used in table toolbars and rows. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "outline", size = "md", label, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-ink-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ink/20 [&_svg]:size-[15px] [&_svg]:stroke-[1.5]",
        size === "md" ? "size-8" : "size-7",
        variant === "outline" && "border border-line-strong bg-canvas hover:bg-subtle",
        variant === "filled" && "bg-chip hover:bg-sidebar-group",
        variant === "bare" && "text-ink-2 hover:bg-muted hover:text-ink",
        className,
      )}
      {...props}
    />
  );
});
