"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { CommandPalette } from "./command-palette";
import { ShellProvider } from "./shell-context";
import { Sidebar } from "./sidebar";

/** Persistent frame: sidebar on the left, scrolling page canvas on the right. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 bg-canvas">{children}</main>
        </div>
        <CommandPalette />
      </ToastProvider>
    </ShellProvider>
  );
}
