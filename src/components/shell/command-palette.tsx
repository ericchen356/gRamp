"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CreditCard, FilePlus2, Search, Store, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { primaryNav, secondaryNav } from "./nav-config";
import { useShell } from "./shell-context";

type Command = { id: string; label: string; group: string; href: string; icon: ReactNode; hint?: string };

const actions: Command[] = [
  { id: "issue-card", label: "Issue a new card", group: "Actions", href: "/cards?new=1", icon: <CreditCard /> },
  { id: "new-bill", label: "Create a bill", group: "Actions", href: "/bill-pay?new=1", icon: <FilePlus2 /> },
  { id: "invite", label: "Invite a teammate", group: "Actions", href: "/company?invite=1", icon: <UserPlus /> },
  { id: "new-vendor", label: "Add a vendor", group: "Actions", href: "/vendors?new=1", icon: <Store /> },
];

function buildPages(): Command[] {
  return [...primaryNav, ...secondaryNav].flatMap((item) => {
    const Icon = item.icon;
    const parent: Command = {
      id: item.href,
      label: item.label,
      group: "Pages",
      href: item.children ? item.children[0].href : item.href,
      icon: <Icon />,
    };
    const children = (item.children ?? []).map<Command>((child) => ({
      id: `${item.href}:${child.href}`,
      label: child.label,
      hint: item.label,
      group: "Pages",
      href: child.href,
      icon: <Icon />,
    }));
    return [parent, ...children];
  });
}

const pages = buildPages();

/** ⌘K launcher: fuzzy-ish search across pages and quick actions. */
export function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useShell();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...actions, ...pages];
    if (!q) return all;
    return all.filter((command) => `${command.label} ${command.hint ?? ""}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (paletteOpen) {
      // Reset each time the palette opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [paletteOpen]);

  const close = () => setPaletteOpen(false);
  const run = (command: Command | undefined) => {
    if (!command) return;
    close();
    router.push(command.href);
  };

  let lastGroup = "";

  return (
    <Dialog open={paletteOpen} onClose={close} className="max-w-[600px] overflow-hidden">
      <div className="flex h-14 items-center gap-3 border-b border-line px-5">
        <Search className="size-4 stroke-[1.5] text-ink-2" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setCursor((value) => Math.min(value + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setCursor((value) => Math.max(value - 1, 0));
            } else if (event.key === "Enter") {
              run(results[cursor]);
            }
          }}
          placeholder="Search Ramp or jump to..."
          className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="rounded-[3px] border border-line px-1.5 py-0.5 font-sans text-[11px] text-ink-3">esc</kbd>
      </div>
      <div className="max-h-[400px] overflow-y-auto py-2 scrollbar-thin">
        {results.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-ink-3">No results for “{query}”</p>}
        {results.map((command, index) => {
          const header = command.group !== lastGroup ? command.group : null;
          lastGroup = command.group;
          return (
            <div key={command.id}>
              {header && <div className="px-5 pt-2 pb-1 text-[11px] text-ink-3">{header}</div>}
              <button
                type="button"
                onMouseEnter={() => setCursor(index)}
                onClick={() => run(command)}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-2 text-left text-[14px] text-ink-1 [&_svg]:size-4 [&_svg]:stroke-[1.5]",
                  cursor === index && "bg-muted",
                )}
              >
                <span className="text-ink-2">{command.icon}</span>
                <span className="flex-1">
                  {command.label}
                  {command.hint && <span className="ml-2 text-[12px] text-ink-3">in {command.hint}</span>}
                </span>
                {cursor === index && <ArrowRight className="text-ink-3" />}
              </button>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}
