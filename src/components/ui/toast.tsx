"use client";

import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "neutral" | "danger";
type Toast = { id: number; message: string; tone: Tone };
type ToastApi = { show: (message: string, tone?: Tone) => void };

const ToastContext = createContext<ToastApi | null>(null);

const tones: Record<Tone, string> = {
  success: "border-success-line bg-success-bg text-success-ink",
  neutral: "border-line-strong bg-canvas text-ink-1",
  danger: "border-danger bg-danger-bg text-danger",
};

/** Top-right confirmation toasts ("Transaction successfully updated"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = ++nextId.current;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed top-12 right-5 z-[60] flex w-[364px] flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex h-[52px] animate-toast-in items-center justify-between border pr-4 pl-3 text-[13px]",
              tones[toast.tone],
            )}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
              className="text-ink-1 opacity-80 hover:opacity-100"
            >
              <X className="size-3.5 stroke-[1.75]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
