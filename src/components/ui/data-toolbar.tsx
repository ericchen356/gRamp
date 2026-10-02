"use client";

import { CalendarDays, ChevronDown, Columns3, ListFilter, Rows3 } from "lucide-react";
import type { ReactNode } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { MenuItem, MenuLabel, Popover } from "@/components/ui/popover";
import { AddFilterButton, SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { cn } from "@/lib/cn";
import { pluralize } from "@/lib/format";

export const datePresets = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
  { value: "all", label: "All time" },
] as const;

export type DatePreset = (typeof datePresets)[number]["value"];

/** "Today" for the demo dataset. */
export const TODAY = "2026-10-02";

export function withinPreset(iso: string, preset: DatePreset) {
  if (preset === "all") return true;
  const today = new Date(`${TODAY}T12:00:00`);
  const date = new Date(`${iso}T12:00:00`);
  if (preset === "ytd") return date.getFullYear() === today.getFullYear();
  return (today.getTime() - date.getTime()) / 86_400_000 <= Number(preset);
}

export function presetLabel(preset: DatePreset) {
  return datePresets.find((p) => p.value === preset)?.label ?? "";
}

type ColumnItem = { id: string; label: string };

type DataToolbarProps = {
  query: string;
  onQuery: (value: string) => void;
  placeholder?: string;
  /** Number shown in the filter pill; hidden when 0/undefined. */
  filterCount?: number;
  onClearFilters?: () => void;
  date?: { value: DatePreset; onChange: (value: DatePreset) => void };
  dense?: { value: boolean; onChange: (value: boolean) => void };
  columns?: { items: ColumnItem[]; hidden: Set<string>; onToggle: (id: string) => void };
  options?: { label: string; onSelect: () => void }[];
  /** Applied filter chips (second row). */
  chips?: ReactNode;
  /** Content of the "+ Filter" menu; omit to hide the chip row. */
  filterMenu?: (close: () => void) => ReactNode;
  /** Extra controls rendered before the icon buttons. */
  children?: ReactNode;
};

/**
 * Ramp's table toolbar band: bare search on the left; filter count, date,
 * density, columns and Options on the right; applied filters underneath.
 */
export function DataToolbar({
  query,
  onQuery,
  placeholder = "Search...",
  filterCount,
  onClearFilters,
  date,
  dense,
  columns,
  options,
  chips,
  filterMenu,
  children,
}: DataToolbarProps) {
  return (
    <Toolbar>
      <ToolbarRow>
        <SearchField value={query} onChange={onQuery} placeholder={placeholder} />
        <div className="ml-auto flex items-center gap-2">
          {children}
          {!!filterCount && (
            <button
              type="button"
              onClick={onClearFilters}
              title="Clear filters"
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-chip px-3 text-[12px] text-ink-1 hover:bg-sidebar-group"
              aria-label={`${pluralize(filterCount, "filter")} applied`}
            >
              <ListFilter className="size-3.5 stroke-[1.75]" />
              {filterCount}
            </button>
          )}
          {date && (
            <Popover
              align="end"
              trigger={({ toggle, open }) => (
                <IconButton label="Date range" onClick={toggle} className={cn(open && "bg-subtle")}>
                  <CalendarDays />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuLabel>Date range</MenuLabel>
                  {datePresets.map((preset) => (
                    <MenuItem
                      key={preset.value}
                      selected={date.value === preset.value}
                      onSelect={() => {
                        date.onChange(preset.value);
                        close();
                      }}
                    >
                      {preset.label}
                    </MenuItem>
                  ))}
                </>
              )}
            </Popover>
          )}
          {dense && (
            <IconButton
              label={dense.value ? "Comfortable rows" : "Compact rows"}
              onClick={() => dense.onChange(!dense.value)}
              className={cn(dense.value && "border-ink-3 bg-muted")}
            >
              <Rows3 />
            </IconButton>
          )}
          {columns && (
            <Popover
              align="end"
              panelClassName="min-w-[220px]"
              trigger={({ toggle }) => (
                <IconButton label="Columns" onClick={toggle}>
                  <Columns3 />
                </IconButton>
              )}
            >
              <MenuLabel>Columns</MenuLabel>
              {columns.items.map((column) => (
                <MenuItem key={column.id} selected={!columns.hidden.has(column.id)} onSelect={() => columns.onToggle(column.id)}>
                  {column.label}
                </MenuItem>
              ))}
            </Popover>
          )}
          {options && (
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <Button pill size="sm" onClick={toggle} className="h-8 gap-1 pr-2.5 pl-3 text-[12px]">
                  Options
                  <ChevronDown className="size-3.5 stroke-[1.5]" />
                </Button>
              )}
            >
              {(close) =>
                options.map((option) => (
                  <MenuItem
                    key={option.label}
                    onSelect={() => {
                      option.onSelect();
                      close();
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))
              }
            </Popover>
          )}
        </div>
      </ToolbarRow>
      {filterMenu && (
        <ToolbarRow className="min-h-0 flex-wrap gap-2 pb-3">
          {chips}
          <Popover trigger={({ toggle }) => <AddFilterButton onClick={toggle} />} panelClassName="min-w-[220px]">
            {(close) => filterMenu(close)}
          </Popover>
        </ToolbarRow>
      )}
    </Toolbar>
  );
}
