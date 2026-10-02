"use client";

import { ArrowUp, Copy, Download, Paperclip, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RampLogo } from "@/components/shell/ramp-logo";
import { currentUser } from "@/data/people";
import { cn } from "@/lib/cn";
import { answerFor, suggestions, type Answer } from "./assistant-answers";

type Message = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; answer: Answer | null };

const THINK_MS = 1100;

function SuggestionChips({ items, onPick, className }: { items: string[]; onPick: (q: string) => void; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="inline-flex h-8 items-center rounded-full border border-line-strong bg-canvas px-3.5 text-[13px] text-ink-1 transition-colors hover:border-ink-5 hover:bg-subtle"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  busy,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
  autoFocus?: boolean;
}) {
  const toast = useToast();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="border border-line-strong bg-canvas transition-colors focus-within:border-ink-4"
    >
      <textarea
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        rows={2}
        placeholder="Ask about spend, cards, bills or policies…"
        aria-label="Ask Ramp"
        className="block w-full resize-none bg-transparent px-4 pt-3.5 text-[16px] leading-relaxed text-ink outline-none placeholder:text-ink-4"
      />
      <div className="flex items-center justify-between px-2.5 pt-1 pb-2.5">
        <div className="flex items-center gap-1">
          <IconButton variant="bare" size="sm" label="Attach a file" onClick={() => toast.show("Attach a receipt, invoice or CSV to ask about it", "neutral")}>
            <Paperclip />
          </IconButton>
          <span className="ml-1 inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-[12px] text-ink-2">Efficient App · All entities</span>
        </div>
        <button
          type="submit"
          disabled={!value.trim() || busy}
          aria-label="Send"
          className="inline-flex size-8 items-center justify-center rounded-[2px] bg-lime text-ink transition-colors hover:bg-lime-hover disabled:bg-muted disabled:text-ink-4"
        >
          <ArrowUp className="size-4 stroke-[1.75]" />
        </button>
      </div>
    </form>
  );
}

function Thinking() {
  return (
    <span className="inline-flex items-center gap-2 text-[14px] text-ink-2">
      Looking through your spend
      <span className="inline-flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1 animate-pulse rounded-full bg-ink-3" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </span>
    </span>
  );
}

/** "Assistant mode": a centered prompt that turns into a chat thread. */
export function AssistantView() {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const nextId = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const busy = messages.some((m) => m.role === "assistant" && m.answer === null);
  const asked = new Set(messages.flatMap((m) => (m.role === "user" ? [m.text] : [])));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    const userId = ++nextId.current;
    const replyId = ++nextId.current;
    setMessages((current) => [...current, { id: userId, role: "user", text }, { id: replyId, role: "assistant", answer: null }]);
    setDraft("");
    window.setTimeout(() => {
      setMessages((current) => current.map((m) => (m.id === replyId ? { id: replyId, role: "assistant", answer: answerFor(text) } : m)));
    }, THINK_MS);
  };

  if (messages.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-page pb-[10vh]">
        <div className="w-full max-w-[720px]">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-sidebar">
            <Sparkles className="size-4 stroke-[1.5] text-ink-1" />
          </span>
          <h1 className="mt-5 text-[52px] leading-none font-normal tracking-[-0.03em] text-ink">How can I help?</h1>
          <p className="mt-3 text-[15px] text-ink-2">
            Ask anything about {currentUser.name.split(" ")[0]}’s company spend — answers cite the transactions they’re built from.
          </p>
          <div className="mt-9">
            <Composer value={draft} onChange={setDraft} onSubmit={() => ask(draft)} busy={busy} autoFocus />
          </div>
          <SuggestionChips items={suggestions.slice(0, 4)} onPick={ask} className="mt-4" />
        </div>
      </div>
    );
  }

  const remaining = suggestions.filter((s) => !asked.has(s)).slice(0, 3);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-page">
        <span className="inline-flex items-center gap-2 text-[14px] text-ink-1">
          <Sparkles className="size-4 stroke-[1.5]" />
          Assistant
        </span>
        <button
          type="button"
          onClick={() => setMessages([])}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink"
        >
          <RotateCcw className="size-3.5 stroke-[1.5]" />
          New chat
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-[760px] px-6 pt-10 pb-6">
          {messages.map((m, index) =>
            m.role === "user" ? (
              <div key={m.id} className={cn("flex justify-end", index > 0 && "mt-10")}>
                <div className="max-w-[80%] bg-muted px-4 py-2.5 text-[15px] text-ink">{m.text}</div>
              </div>
            ) : (
              <div key={m.id} className="mt-6 flex gap-3.5">
                <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-canvas">
                  <RampLogo className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  {m.answer === null ? (
                    <Thinking />
                  ) : (
                    <div className="animate-fade-in">
                      <p className="text-[15px] leading-[1.6] text-ink-1">{m.answer.text}</p>
                      {m.answer.block && <div className="mt-4 border border-line">{m.answer.block}</div>}
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-[12px] text-ink-3">{m.answer.sources}</span>
                        <span className="flex shrink-0 items-center">
                          <IconButton variant="bare" size="sm" label="Copy answer" onClick={() => toast.show("Answer copied", "neutral")}>
                            <Copy />
                          </IconButton>
                          <IconButton variant="bare" size="sm" label="Export as CSV" onClick={() => toast.show("Exporting answer data (CSV)", "neutral")}>
                            <Download />
                          </IconButton>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
          {!busy && remaining.length > 0 && <SuggestionChips items={remaining} onPick={ask} className="mt-8 pl-[42px]" />}
          <div ref={endRef} />
        </div>
      </div>
      <div className="shrink-0 border-t border-line bg-canvas">
        <div className="mx-auto w-full max-w-[760px] px-6 py-4">
          <Composer value={draft} onChange={setDraft} onSubmit={() => ask(draft)} busy={busy} />
          <p className="mt-2 text-center text-[11px] text-ink-3">Answers are generated from your Ramp data and may need review.</p>
        </div>
      </div>
    </div>
  );
}
