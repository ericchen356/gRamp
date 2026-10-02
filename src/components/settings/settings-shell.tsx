"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const nav: { label: string; href: string; group?: string; tag?: ReactNode }[] = [
  { label: "Company profile", href: "/settings", group: "Company" },
  { label: "Personal", href: "/settings/personal", group: "Your account" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Accounting integrations", href: "/settings/integrations", group: "Workspace" },
  { label: "Bank accounts", href: "/settings/bank-accounts" },
  { label: "Security", href: "/settings/security" },
  {
    label: "Billing",
    href: "/settings/billing",
    tag: (
      <Tag tone="plus" className="h-[18px] text-[11px]">
        Plus
      </Tag>
    ),
  },
  { label: "Developer API", href: "/settings/developer" },
];

/** Left-hand secondary navigation inside the Settings page. */
export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings" className="sticky top-8 w-[212px] shrink-0 self-start">
      {nav.map((item, index) => {
        const active = pathname === item.href;
        return (
          <div key={item.href}>
            {item.group && <div className={cn("mb-1.5 px-3 text-[12px] text-ink-3", index > 0 && "mt-6")}>{item.group}</div>}
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-9 items-center gap-2 rounded-[4px] px-3 text-[14px] transition-colors",
                active ? "bg-muted text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink",
              )}
            >
              <span className="flex-1 truncate">{item.label}</span>
              {item.tag}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

/** Title block at the top of each settings sub-page. */
export function SettingsPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-[26px] leading-tight font-normal tracking-[-0.015em] text-ink">{title}</h2>
          {description && <p className="mt-2 max-w-[620px] text-[14px] text-ink-2">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/** Save / Cancel row under a settings form. */
export function SaveBar({ onSave, onCancel, note }: { onSave?: () => void; onCancel?: () => void; note?: ReactNode }) {
  const toast = useToast();
  return (
    <div className="mt-8 flex items-center gap-2">
      <Button
        variant="primary"
        onClick={() => {
          onSave?.();
          toast.show("Settings saved");
        }}
      >
        Save changes
      </Button>
      <Button
        onClick={() => {
          onCancel?.();
          toast.show("Changes discarded", "neutral");
        }}
      >
        Cancel
      </Button>
      {note && <span className="ml-3 text-[12px] text-ink-3">{note}</span>}
    </div>
  );
}
