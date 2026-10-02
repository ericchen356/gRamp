"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ShellState = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
};

const ShellContext = createContext<ShellState | null>(null);
const STORAGE_KEY = "ramp.sidebar.collapsed";

export function ShellProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      // Restore the persisted preference after hydration to avoid a mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, value ? "0" : "1");
      } catch {
        /* storage unavailable */
      }
      return !value;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "\\") {
        event.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed, paletteOpen, setPaletteOpen }),
    [collapsed, toggleCollapsed, paletteOpen],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) throw new Error("useShell must be used inside <ShellProvider>");
  return context;
}
