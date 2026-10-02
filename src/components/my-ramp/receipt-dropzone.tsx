"use client";

import { Check, FileUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Phase = { state: "idle" } | { state: "uploading"; name: string; progress: number } | { state: "done"; name: string };

/**
 * Drag-and-drop receipt target with a simulated upload. Calls `onComplete`
 * once the fake upload "matches" the receipt.
 */
export function ReceiptDropzone({
  onComplete,
  compact,
  className,
}: {
  onComplete: (fileName: string) => void;
  compact?: boolean;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>({ state: "idle" });

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const start = (file: File | undefined) => {
    if (!file || phase.state !== "idle") return;
    const name = file.name;
    let progress = 0;
    setPhase({ state: "uploading", name, progress });
    timer.current = window.setInterval(() => {
      progress = Math.min(100, progress + 14 + Math.random() * 18);
      if (progress >= 100) {
        if (timer.current) window.clearInterval(timer.current);
        setPhase({ state: "done", name });
        window.setTimeout(() => onComplete(name), 650);
      } else {
        setPhase({ state: "uploading", name, progress });
      }
    }, 140);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => phase.state === "idle" && input.current?.click()}
      onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && phase.state === "idle" && input.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        start(event.dataTransfer.files[0]);
      }}
      className={cn(
        "relative flex cursor-pointer items-center gap-3 overflow-hidden border border-dashed px-4 text-left transition-colors outline-none focus-visible:border-ink-3",
        compact ? "h-14" : "h-24 flex-col justify-center gap-1.5 text-center",
        phase.state === "done"
          ? "border-success-line bg-success-bg"
          : dragging
            ? "border-ink-3 bg-muted"
            : "border-line-strong bg-subtle hover:border-ink-4 hover:bg-muted/60",
        className,
      )}
    >
      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(event) => start(event.target.files?.[0])}
      />
      {phase.state === "idle" && (
        <>
          <FileUp className="size-[18px] shrink-0 stroke-[1.5] text-ink-2" />
          <span className="min-w-0 leading-tight">
            <span className="block text-[13px] text-ink">
              {dragging ? "Drop to upload" : <>Drop receipt or <span className="underline decoration-ink-4 underline-offset-2">browse</span></>}
            </span>
            <span className="mt-0.5 block text-[12px] text-ink-3">PDF, PNG or JPG</span>
          </span>
        </>
      )}
      {phase.state === "uploading" && (
        <>
          <FileUp className="size-[18px] shrink-0 stroke-[1.5] text-ink-2" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] text-ink">{phase.name}</span>
            <span className="mt-0.5 block text-[12px] text-ink-3">Uploading… {Math.round(phase.progress)}%</span>
          </span>
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-chip">
            <span className="block h-full bg-ink-1 transition-[width] duration-150" style={{ width: `${phase.progress}%` }} />
          </span>
        </>
      )}
      {phase.state === "done" && (
        <>
          <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-approve text-canvas">
            <Check className="size-3 stroke-[2.5]" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[13px] text-success-ink">Receipt matched</span>
            <span className="mt-0.5 block truncate text-[12px] text-ink-3">{phase.name}</span>
          </span>
        </>
      )}
    </div>
  );
}
