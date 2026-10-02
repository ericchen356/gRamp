"use client";

import { ArrowRight, CalendarDays, ChevronDown, FileText, Link2, Search, Upload } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import type { IntakeField, IntakeForm } from "@/data/procurement";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useProcurement } from "./procurement-store";

const box = "flex h-10 w-full items-center gap-2 rounded-[2px] border border-line-strong bg-canvas px-3 text-[14px] text-ink-4";

/** Static rendering of a field as the requester will see it. */
function FieldPreview({ field }: { field: IntakeField }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] text-ink-2">
        {field.label}
        {!field.required && <span className="text-ink-4"> · Optional</span>}
      </span>
      {field.kind === "textarea" && <div className={cn(box, "h-[72px] items-start py-2.5")}>{field.placeholder}</div>}
      {field.kind === "text" && <div className={box}>{field.placeholder}</div>}
      {field.kind === "amount" && (
        <div className={box}>
          <span className="text-ink-3">$</span>0.00<span className="ml-auto text-[13px] text-ink-3">USD</span>
        </div>
      )}
      {field.kind === "select" && (
        <div className={box}>
          <span className="flex-1 truncate">Choose one of {field.options?.length} options</span>
          <ChevronDown className="size-3.5 stroke-[1.5] text-ink-2" />
        </div>
      )}
      {field.kind === "date" && (
        <div className={box}>
          <span className="flex-1">mm/dd/yyyy</span>
          <CalendarDays className="size-4 stroke-[1.5] text-ink-2" />
        </div>
      )}
      {(field.kind === "vendor" || field.kind === "person") && (
        <div className={box}>
          <Search className="size-3.5 stroke-[1.75] text-ink-3" />
          {field.placeholder ?? (field.kind === "person" ? "Search people" : "Search vendors")}
        </div>
      )}
      {field.kind === "file" && (
        <div className="flex h-11 items-center justify-center gap-2 border border-dashed border-line-strong bg-subtle text-[13px] text-ink-2">
          <Upload className="size-4 stroke-[1.5]" />
          Drop a file or browse
        </div>
      )}
    </div>
  );
}

function FormRow({
  form,
  selected,
  onSelect,
  onToggle,
  onEdit,
}: {
  form: IntakeForm;
  selected: boolean;
  onSelect: () => void;
  onToggle: (active: boolean) => void;
  onEdit: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => event.key === "Enter" && onSelect()}
      className={cn(
        "relative flex cursor-pointer items-center gap-4 py-4 pr-6 pl-page transition-colors outline-none",
        selected ? "bg-subtle" : "hover:bg-subtle/70",
      )}
    >
      {selected && <span className="absolute inset-y-0 left-0 w-[2px] bg-ink" />}
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-muted text-ink-1">
        <FileText className="size-4 stroke-[1.5]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("truncate text-[14px]", form.active ? "text-ink" : "text-ink-3")}>{form.name}</span>
          {!form.active && <Tag tone="outline">Inactive</Tag>}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-ink-2">{form.description}</div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-2">
          {form.workflow.map((step, index) => (
            <span key={step} className="flex items-center gap-1.5">
              {index > 0 && <ArrowRight className="size-3 stroke-[1.5] text-ink-4" />}
              <span className="rounded-full bg-chip px-2 py-0.5">{step}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="w-[96px] shrink-0 text-right text-[12px] leading-tight">
        <div className="text-[14px] text-ink tabular">{form.submissions}</div>
        <div className="mt-0.5 text-ink-3">submissions</div>
      </div>
      <div className="w-[120px] shrink-0 text-[12px] leading-tight text-ink-2">
        <div className="flex items-center gap-1.5">
          <Avatar name={form.owner} size={16} />
          <span className="truncate">{form.owner.split(" ")[0]}</span>
        </div>
        <div className="mt-1 text-ink-3">Edited {formatDate(form.updated)}</div>
      </div>
      <span onClick={(event) => event.stopPropagation()} className="flex shrink-0 items-center gap-3">
        <Switch label={`${form.name} active`} checked={form.active} onChange={onToggle} />
        <Button size="sm" onClick={onEdit}>
          Edit
        </Button>
      </span>
    </div>
  );
}

/** Procurement › Intake forms: templates on the left, live preview on the right. */
export function IntakeForms() {
  const { forms, updateForm } = useProcurement();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(forms[0]?.id);

  const q = query.trim().toLowerCase();
  const visible = forms.filter((f) => !q || `${f.name} ${f.description}`.toLowerCase().includes(q));
  const selected = forms.find((f) => f.id === selectedId) ?? forms[0];

  return (
    <>
      <Toolbar>
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} placeholder="Search forms..." />
          <Button
            pill
            size="sm"
            className="ml-auto h-8 gap-1.5 px-3 text-[12px]"
            onClick={() => toast.show("Intake link copied: ramp.com/r/efficient-app", "neutral")}
          >
            <Link2 className="size-3.5 stroke-[1.5]" />
            Copy intake link
          </Button>
        </ToolbarRow>
      </Toolbar>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_440px] border-t border-line">
        <div className="min-w-0 border-r border-line">
          <div className="flex h-8 items-center border-b border-line px-page text-[12px] text-ink-3">
            {visible.length} forms
          </div>
          <div className="divide-y divide-line-soft border-b border-line-soft">
            {visible.map((form) => (
              <FormRow
                key={form.id}
                form={form}
                selected={form.id === selected?.id}
                onSelect={() => setSelectedId(form.id)}
                onToggle={(active) => {
                  updateForm(form.id, { active });
                  toast.show(`${form.name} ${active ? "is live for employees" : "turned off"}`, active ? "success" : "neutral");
                }}
                onEdit={() => toast.show(`Opening ${form.name} in the form builder`, "neutral")}
              />
            ))}
          </div>
        </div>

        {selected && (
          <aside className="bg-subtle px-8 py-7">
            <div className="flex items-center justify-between text-[12px] text-ink-3">
              <span>Preview · what requesters see</span>
              <span>{selected.fields.length} fields</span>
            </div>
            <div className="mt-4 border border-line bg-canvas shadow-card">
              <div className="border-b border-line px-6 py-5">
                <div className="text-[20px] leading-tight tracking-[-0.015em] text-ink">{selected.name}</div>
                <p className="mt-1.5 text-[13px] text-ink-2">{selected.description}</p>
              </div>
              <div className="flex flex-col gap-4 px-6 py-5">
                {selected.fields.map((field) => (
                  <FieldPreview key={field.label} field={field} />
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-line px-6 py-4">
                <span className="text-[12px] text-ink-3" title={`Routes to ${selected.workflow.join(" → ")}`}>
                  {selected.workflow.length} approval steps
                </span>
                <Button size="sm" variant="primary" onClick={() => toast.show("This is a preview. Nothing was submitted.", "neutral")}>
                  Submit request
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
