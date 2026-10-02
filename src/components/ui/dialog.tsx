"use client";

import { X } from "lucide-react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const noop = () => () => {};

/** True only after hydration, so portals never touch `document` on the server. */
function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}

function useLockAndEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);
}

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

/** Centered modal dialog. */
export function Dialog({ open, onClose, children, className }: OverlayProps) {
  useLockAndEscape(open, onClose);
  const isClient = useIsClient();
  if (!open || !isClient) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 pt-[min(12vh,96px)]">
      <div className="absolute inset-0 animate-fade-in bg-ink/25" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className={cn(
          "relative max-h-[calc(100vh-min(12vh,96px)-24px)] w-full max-w-[520px] animate-pop-in overflow-y-auto rounded-[6px] bg-canvas shadow-pop scrollbar-thin",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Right-hand detail sheet (transaction, bill, vendor detail). */
export function Drawer({ open, onClose, children, className, title }: OverlayProps & { title?: ReactNode }) {
  useLockAndEscape(open, onClose);
  const isClient = useIsClient();
  if (!open || !isClient) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-ink/15" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-canvas shadow-pop [animation:drawer-in_220ms_cubic-bezier(0.2,0.8,0.2,1)]",
          className,
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-6">
          <div className="text-[15px] text-ink">{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-ink-2 hover:bg-muted hover:text-ink">
            <X className="size-4 stroke-[1.5]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}

export function DialogHeader({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
      <div>
        <h2 className="text-[22px] leading-tight tracking-[-0.015em] text-ink">{title}</h2>
        {description && <p className="mt-1.5 text-[13px] text-ink-2">{description}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 -mr-2 rounded-full p-1.5 text-ink-2 hover:bg-muted hover:text-ink">
        <X className="size-4 stroke-[1.5]" />
      </button>
    </div>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{children}</div>;
}
