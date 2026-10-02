"use client";

import { Sparkles } from "lucide-react";
import {
  forwardRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

/**
 * Text form controls. They match `Select variant="field"`: 40px tall, square,
 * `line-strong` hairline that darkens on hover/focus. Controls accept native
 * props; `onValueChange` is a convenience that receives the string value.
 */
const fieldBox =
  "rounded-[2px] border border-line-strong bg-canvas text-[14px] text-ink transition-colors hover:border-ink-5 focus-within:border-ink-3";

/** Small label stacked above a control, with optional hint below. */
export function Field({
  label,
  hint,
  autoFilled,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  /** Shows an "Auto-filled" marker (OCR-extracted values). */
  autoFilled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[12px] text-ink-2">{label}</span>
        {autoFilled && (
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-3">
            <Sparkles className="size-3 stroke-[1.5]" />
            Auto-filled
          </span>
        )}
      </div>
      {children}
      {hint && <div className="mt-1.5 text-[12px] text-ink-3">{hint}</div>}
    </div>
  );
}

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
  /** Leading adornment such as "$" or an icon. */
  prefix?: ReactNode;
  suffix?: ReactNode;
  onValueChange?: (value: string) => void;
  /** Lime wash for freshly auto-filled values. */
  highlighted?: boolean;
  inputClassName?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { prefix, suffix, onValueChange, onChange, highlighted, className, inputClassName, readOnly, ...props },
  ref,
) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };
  return (
    <label
      className={cn(
        "flex h-10 items-center gap-2 px-3",
        fieldBox,
        highlighted && "bg-lime-bright/25",
        readOnly && "bg-subtle hover:border-line-strong",
        className,
      )}
    >
      {prefix && <span className="shrink-0 text-ink-3 [&_svg]:size-4 [&_svg]:stroke-[1.5]">{prefix}</span>}
      <input
        ref={ref}
        readOnly={readOnly}
        onChange={handleChange}
        className={cn(
          "h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink-4",
          readOnly && "text-ink-1",
          inputClassName,
        )}
        {...props}
      />
      {suffix && <span className="flex shrink-0 items-center text-[13px] text-ink-3">{suffix}</span>}
    </label>
  );
});

/** "$" input with tabular digits; strips everything but digits, commas and the decimal point. */
export function MoneyInput({ onValueChange, inputClassName, ...props }: Omit<TextInputProps, "prefix">) {
  return (
    <TextInput
      prefix="$"
      inputMode="decimal"
      inputClassName={cn("tabular", inputClassName)}
      onValueChange={(value) => onValueChange?.(value.replace(/[^\d.,]/g, ""))}
      {...props}
    />
  );
}

export function TextArea({
  onValueChange,
  onChange,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { onValueChange?: (value: string) => void }) {
  return (
    <textarea
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      }}
      className={cn(
        "block min-h-[76px] w-full resize-none px-3 py-2.5 leading-snug outline-none placeholder:text-ink-4",
        fieldBox,
        className,
      )}
      {...props}
    />
  );
}

/** Large selectable tile with icon, title and description (card type, reimbursement type). */
export function ChoiceTile({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 items-center gap-3 rounded-[2px] border px-4 py-3.5 text-left transition-colors",
        selected
          ? "border-ink bg-subtle shadow-[inset_0_0_0_1px_var(--color-ink)]"
          : "border-line-strong hover:border-ink-5 hover:bg-subtle",
      )}
    >
      <span className="flex shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[14px] text-ink">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-2">{description}</span>
      </span>
    </button>
  );
}

/** Compact radio group of square tiles ("Card / ACH / Check"). */
export function ChoiceTiles<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; description?: string; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-[2px] border px-3 py-2.5 text-left transition-colors [&_svg]:size-4 [&_svg]:stroke-[1.5]",
              active ? "border-ink-1 bg-canvas" : "border-line-strong hover:border-ink-5",
            )}
          >
            <span className="flex items-center gap-2 text-[13px] text-ink">
              {option.icon && <span className="text-ink-2">{option.icon}</span>}
              {option.label}
            </span>
            {option.description && <span className="text-[12px] text-ink-3">{option.description}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Settings row: label + help on the left, control on the right, hairline above. */
export function FormRow({
  label,
  description,
  children,
  align = "start",
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-x-12 border-t border-line py-5",
        align === "center" ? "items-center" : "items-start",
        className,
      )}
    >
      <div className={cn(align === "start" && "pt-2.5")}>
        <div className="text-[14px] text-ink">{label}</div>
        {description && <p className="mt-1 text-[12px] leading-snug text-ink-2">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Titled group of FormRows; closes with a bottom hairline. */
export function FormSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-12 first:mt-0", className)}>
      <div className="mb-5 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-[18px] leading-snug font-normal tracking-[-0.01em] text-ink">{title}</h2>
          {description && <p className="mt-1 max-w-[560px] text-[13px] text-ink-2">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="border-b border-line">{children}</div>
    </section>
  );
}
