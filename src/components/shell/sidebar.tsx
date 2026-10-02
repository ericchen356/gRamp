"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PanelLeft, Search } from "lucide-react";
import { Count, Tag } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { activeChildHref, isActivePath, primaryNav, secondaryNav, type NavItem } from "./nav-config";
import { RampLogo } from "./ramp-logo";
import { useShell } from "./shell-context";

const itemBase =
  "flex h-8 items-center gap-[9px] rounded-[5px] px-[7px] text-[13px] transition-colors [&_svg]:size-[14px] [&_svg]:shrink-0 [&_svg]:stroke-[1.5]";

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex size-4 items-center justify-center rounded-[3px] bg-sidebar-group font-sans text-[10px] leading-none text-ink-1">
      {children}
    </kbd>
  );
}

function NavRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  if (item.children && active) {
    const current = activeChildHref(pathname, item.children);
    return (
      <div data-active-group className="rounded-[6px] bg-sidebar-group pb-[3px]">
        <Link href={item.children[0].href} className={cn(itemBase, "text-ink-1")}>
          <Icon className="text-ink-1" />
          <span className="flex-1 truncate">{item.label}</span>
        </Link>
        <ul className="flex flex-col gap-px px-[3px]">
          {item.children.map((child) => {
            const childActive = child.href === current;
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-[4px] pr-1 pl-[27px] text-[13px] text-ink-1 transition-colors",
                    childActive ? "bg-sidebar" : "hover:bg-sidebar-hover",
                  )}
                >
                  <span className="flex-1 truncate">{child.label}</span>
                  {child.count !== undefined && <Count value={child.count} tone="lime" />}
                  {child.tag && (
                    <Tag tone="beta" className="h-[18px] px-2 text-[11px]">
                      {child.tag}
                    </Tag>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <Link
      href={item.children ? item.children[0].href : item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        itemBase,
        active ? "bg-sidebar-group text-ink-1" : "text-ink-2 hover:bg-sidebar-group/70 hover:text-ink-1",
      )}
    >
      <Icon />
      <span className="flex-1 truncate">{item.label}</span>
      {item.count !== undefined && <Count value={item.count} tone="lime" />}
    </Link>
  );
}

function RailRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.children ? item.children[0].href : item.href}
      title={item.label}
      aria-label={item.label}
      className={cn(
        "relative flex h-11 items-center justify-center text-ink-2 transition-colors hover:bg-sidebar-group/70 hover:text-ink",
        active && "bg-sidebar-group text-ink-1",
      )}
    >
      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-ink-2" />}
      <Icon className="size-[17px] stroke-[1.5]" />
      {item.count !== undefined && (
        <span className="absolute top-2 right-[18px] size-1.5 rounded-full bg-[#c5d13a]" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, setPaletteOpen } = useShell();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the active entry (the whole expanded group, when there is one) visible on short viewports.
  useEffect(() => {
    const target =
      scrollRef.current?.querySelector("[data-active-group]") ??
      scrollRef.current?.querySelector('[aria-current="page"]');
    target?.scrollIntoView({ block: "nearest" });
  }, [pathname, collapsed]);

  if (collapsed) {
    return (
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-line bg-sidebar">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="group flex h-[72px] items-center justify-center"
          aria-label="Expand sidebar"
          title="Expand sidebar (⌘\)"
        >
          <RampLogo className="group-hover:hidden" />
          <PanelLeft className="hidden size-4 stroke-[1.5] text-ink-2 group-hover:block" />
        </button>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex h-11 items-center justify-center text-ink-2 hover:bg-sidebar-group/70 hover:text-ink"
          aria-label="Search"
          title="Search (⌘K)"
        >
          <Search className="size-[17px] stroke-[1.5]" />
        </button>
        <nav className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
          {primaryNav.map((item) => (
            <RailRow key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
        <nav className="border-t border-line py-1">
          {secondaryNav.map((item) => (
            <RailRow key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[224px] shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="flex h-14 shrink-0 items-center justify-between pr-[14px] pl-[12px]">
        <Link href="/home" aria-label="Ramp home">
          <RampLogo />
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Collapse sidebar"
          title="Collapse sidebar (⌘\)"
          className="rounded-[4px] p-1 text-ink-2 hover:bg-sidebar-group hover:text-ink"
        >
          <PanelLeft className="size-[14px] stroke-[1.5]" />
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-[5px] scrollbar-thin">
        <Link
          href="/refer"
          className="mx-[3px] mb-2.5 flex h-[34px] items-center gap-2 rounded-[6px] border border-line bg-sidebar px-2 shadow-card hover:bg-sidebar-hover"
        >
          <Tag tone="plus" className="h-5 text-[12px]">
            Plus
          </Tag>
          <span className="truncate text-[13px] text-ink-2">Earn 5% back on hotels and flights</span>
        </Link>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className={cn(itemBase, "w-full text-ink-2 hover:bg-sidebar-group/70 hover:text-ink-1")}
        >
          <Search />
          <span className="flex-1 text-left">Search</span>
          <span className="flex gap-[3px]">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <nav className="mt-px flex flex-col gap-px">
          {primaryNav.map((item) => (
            <NavRow key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>

      <nav className="flex shrink-0 flex-col gap-px border-t border-line px-[5px] py-2">
        {secondaryNav.map((item) => (
          <NavRow key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
