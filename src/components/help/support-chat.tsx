"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Status } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/dialog";
import { currentUser } from "@/data/people";
import { cn } from "@/lib/cn";

type Message = { id: number; from: "agent" | "me"; text: string };

const AGENT = "Maya Rodriguez";

const greeting: Message[] = [
  { id: 0, from: "agent", text: `Hi ${currentUser.name.split(" ")[0]}, I’m Maya from Ramp support. What can I help you with today?` },
];

/** Lightweight support chat in a side sheet; the agent sends a canned follow-up. */
export function SupportChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(greeting);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: current.length, from: "me", text }]);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((current) => [
        ...current,
        {
          id: current.length,
          from: "agent",
          text: "Thanks! I’m pulling up your account now. I’ll also open a ticket so you can track this from the Help center.",
        },
      ]);
    }, 1400);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      className="max-w-[420px]"
      title={
        <span className="flex items-center gap-3">
          Ramp support
          <Status tone="success">Online</Status>
        </span>
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 px-6 py-6">
          <p className="text-center text-[12px] text-ink-3">Today</p>
          {messages.map((message) => (
            <div key={message.id} className={cn("flex items-end gap-2.5", message.from === "me" && "justify-end")}>
              {message.from === "agent" && <Avatar name={AGENT} size={26} />}
              <p
                className={cn(
                  "max-w-[290px] px-3.5 py-2.5 text-[13px] leading-relaxed",
                  message.from === "agent" ? "bg-muted text-ink-1" : "bg-ink text-canvas",
                )}
              >
                {message.text}
              </p>
            </div>
          ))}
          {typing && (
            <div className="flex items-end gap-2.5">
              <Avatar name={AGENT} size={26} />
              <span className="flex gap-1 bg-muted px-3.5 py-3.5" aria-label={`${AGENT} is typing`}>
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className="size-1.5 animate-pulse rounded-full bg-ink-4" style={{ animationDelay: `${dot * 160}ms` }} />
                ))}
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-canvas px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message…"
            className="h-9 flex-1 bg-transparent px-2 text-[14px] text-ink outline-none placeholder:text-ink-4"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim()}
            className="flex size-8 items-center justify-center rounded-full bg-ink text-canvas transition-opacity disabled:opacity-30"
          >
            <ArrowUp className="size-4 stroke-[1.75]" />
          </button>
        </form>
      </div>
    </Drawer>
  );
}
