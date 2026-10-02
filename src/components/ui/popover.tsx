"use client";

import { Check } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Closes on outside click and Escape. */
function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return ref;
}

type PopoverProps = {
  /** Render prop for the trigger so callers keep their own button styling. */
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "start" | "end";
  className?: string;
  panelClassName?: string;
};

export function Popover({ trigger, children, align = "start", className, panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const close = () => setOpen(false);
  const ref = useDismiss(open, close);
  const panelRef = useRef<HTMLDivElement>(null);

  // Flip above the trigger when the panel would overflow the viewport bottom.
  useLayoutEffect(() => {
    if (!open || !panelRef.current || !ref.current) return;
    const trigger = ref.current.getBoundingClientRect();
    const height = panelRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - trigger.bottom;
    setPlacement(spaceBelow < height + 12 && trigger.top > spaceBelow ? "top" : "bottom");
  }, [open, ref]);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open && (
        <div
          ref={panelRef}
          className={cn(
            "absolute z-40 min-w-[200px] animate-pop-in rounded-[4px] border border-line bg-canvas py-1 shadow-pop",
            align === "end" ? "right-0" : "left-0",
            placement === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            panelClassName,
          )}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onSelect,
  icon,
  selected,
  destructive,
  hint,
}: {
  children: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  selected?: boolean;
  destructive?: boolean;
  hint?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[13px] hover:bg-muted [&_svg]:size-[15px] [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
        destructive ? "text-danger" : "text-ink-1",
      )}
    >
      {icon && <span className="text-ink-2">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {hint && <span className="text-[12px] text-ink-3">{hint}</span>}
      {selected && <Check className="text-ink" />}
    </button>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-3 pt-2 pb-1 text-[11px] tracking-wide text-ink-3 uppercase">{children}</div>;
}

export function MenuDivider() {
  return <div className="my-1 h-px bg-line" />;
}
