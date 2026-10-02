"use client";

import { Building2, CircleCheck, Landmark, MoreHorizontal, Plus, Send, User, UserRoundCheck, type LucideIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Count } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { MenuDivider, MenuItem, MenuLabel, Popover } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { approvalChains, type ApprovalChain, type ApprovalStep } from "@/data/company";
import { cn } from "@/lib/cn";

const stepIcons: Record<ApprovalStep["kind"], LucideIcon> = {
  manager: UserRoundCheck,
  department: Building2,
  finance: Landmark,
  person: User,
};

const stepTemplates: Omit<ApprovalStep, "id">[] = [
  { approver: "Manager", description: "Requester's direct manager", kind: "manager" },
  { approver: "Department head", description: "Owner of the requester's department", kind: "department" },
  { approver: "Finance", description: "Tina Cruz or Alexander Bass", kind: "finance" },
  { approver: "Hannah Okafor", description: "VP Engineering", kind: "person" },
  { approver: "Liam Novak", description: "Operations Manager", kind: "person" },
];

const conditionPresets = ["If amount > $1,000", "If amount > $5,000", "If amount > $10,000", "If vendor is new", "If out of policy"];

/** Vertical hairline between nodes, optionally carrying a condition label. */
function Connector({ condition, short }: { condition?: string; short?: boolean }) {
  return (
    <div className={cn("relative ml-[27px] flex items-center", short ? "h-6" : "h-10")}>
      <span className="absolute inset-y-0 left-0 w-px bg-line-strong" />
      {condition && (
        <span className="ml-5 inline-flex h-[22px] items-center rounded-full border border-line bg-subtle px-2.5 text-[12px] text-ink-2">
          {condition}
        </span>
      )}
    </div>
  );
}

/** Terminal pill at the top ("Request submitted") and bottom ("Approved") of a chain. */
function Terminal({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <div className="flex items-center gap-1 text-[13px] text-ink-2">
      <span className="flex w-[55px] justify-center">
        <span className="flex size-7 items-center justify-center rounded-full border border-line-strong bg-canvas">
          <Icon className="size-3.5 stroke-[1.5]" />
        </span>
      </span>
      {children}
    </div>
  );
}

function StepBox({
  step,
  index,
  total,
  onRemove,
  onMove,
  onCondition,
}: {
  step: ApprovalStep;
  index: number;
  total: number;
  onRemove: () => void;
  onMove: (delta: -1 | 1) => void;
  onCondition: (condition: string | undefined) => void;
}) {
  const Icon = stepIcons[step.kind];
  return (
    <div className="group flex w-full max-w-[560px] items-center gap-4 border border-line bg-canvas py-3.5 pr-3 pl-4 transition-colors hover:border-line-strong">
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-chip text-[11px] text-ink-1 tabular">
        {index + 1}
      </span>
      <Icon className="size-4 shrink-0 stroke-[1.5] text-ink-2" />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[15px] text-ink">{step.approver}</div>
        <div className="mt-1 truncate text-[12px] text-ink-2">{step.description}</div>
      </div>
      <span className="text-[12px] text-ink-3">{index === 0 ? "First approver" : step.condition ? "Conditional" : "Always"}</span>
      <Popover
        align="end"
        trigger={({ toggle }) => (
          <IconButton variant="bare" size="sm" label={`Step ${index + 1} options`} onClick={toggle}>
            <MoreHorizontal />
          </IconButton>
        )}
      >
        {(close) => (
          <>
            {index > 0 && (
              <>
                <MenuLabel>Only require when</MenuLabel>
                {conditionPresets.map((preset) => (
                  <MenuItem key={preset} selected={step.condition === preset} onSelect={() => { onCondition(preset); close(); }}>
                    {preset.replace("If ", "")}
                  </MenuItem>
                ))}
                <MenuItem selected={!step.condition} onSelect={() => { onCondition(undefined); close(); }}>
                  Always
                </MenuItem>
                <MenuDivider />
              </>
            )}
            {index > 0 && <MenuItem onSelect={() => { onMove(-1); close(); }}>Move up</MenuItem>}
            {index < total - 1 && <MenuItem onSelect={() => { onMove(1); close(); }}>Move down</MenuItem>}
            <MenuItem destructive onSelect={() => { onRemove(); close(); }}>
              Remove step
            </MenuItem>
          </>
        )}
      </Popover>
    </div>
  );
}

function ChainEditor({ chain, onSave }: { chain: ApprovalChain; onSave: (chain: ApprovalChain) => void }) {
  const toast = useToast();
  const [steps, setSteps] = useState(chain.steps);
  const [active, setActive] = useState(true);
  const dirty = steps !== chain.steps;

  const move = (index: number, delta: -1 | 1) =>
    setSteps((current) => {
      const next = [...current];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next.map((step, i) => (i === 0 ? { ...step, condition: undefined } : step));
    });

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-[30px] leading-tight font-normal tracking-[-0.015em] text-ink">{chain.name}</h2>
          <p className="mt-2 text-[14px] text-ink-2">
            Applies to {chain.appliesTo.toLowerCase()} · {chain.requests} requests in the last 30 days
          </p>
        </div>
        <label className="mt-2 flex shrink-0 items-center gap-2.5 text-[13px] text-ink-1">
          {active ? "Active" : "Paused"}
          <Switch
            checked={active}
            label="Chain active"
            onChange={(value) => {
              setActive(value);
              toast.show(`${chain.name} approvals ${value ? "resumed" : "paused"}`, value ? "success" : "neutral");
            }}
          />
        </label>
      </div>

      <div className="mt-9">
        <Terminal icon={Send}>Request submitted</Terminal>
        {steps.map((step, index) => (
          <Fragment key={step.id}>
            <Connector condition={index > 0 ? step.condition : undefined} />
            <StepBox
              step={step}
              index={index}
              total={steps.length}
              onRemove={() => setSteps((current) => current.filter((s) => s.id !== step.id).map((s, i) => (i === 0 ? { ...s, condition: undefined } : s)))}
              onMove={(delta) => move(index, delta)}
              onCondition={(condition) => setSteps((current) => current.map((s) => (s.id === step.id ? { ...s, condition } : s)))}
            />
          </Fragment>
        ))}
        <Connector short={!steps.length} />
        <Popover
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="flex h-[46px] w-full items-center gap-2 border border-dashed border-line-strong px-4 text-[14px] text-ink-2 transition-colors hover:border-ink-4 hover:bg-subtle hover:text-ink"
            >
              <Plus className="size-4 stroke-[1.5]" />
              Add step
            </button>
          )}
          className="w-full max-w-[560px]"
          panelClassName="w-[300px]"
        >
          {(close) => (
            <>
              <MenuLabel>Approver</MenuLabel>
              {stepTemplates.map((template) => {
                const Icon = stepIcons[template.kind];
                return (
                  <MenuItem
                    key={template.approver}
                    icon={<Icon />}
                    hint={template.kind === "person" ? "Person" : undefined}
                    onSelect={() => {
                      setSteps((current) => [...current, { ...template, id: `${template.kind}-${Date.now()}` }]);
                      close();
                    }}
                  >
                    {template.approver}
                  </MenuItem>
                );
              })}
            </>
          )}
        </Popover>
        <Connector short />
        <Terminal icon={CircleCheck}>Approved · funds released</Terminal>
      </div>

      <div className="mt-10 flex items-center gap-2 border-t border-line pt-5">
        <Button
          variant="primary"
          disabled={!dirty}
          onClick={() => {
            onSave({ ...chain, steps });
            toast.show(`${chain.name} approval chain saved`);
          }}
        >
          Save changes
        </Button>
        <Button disabled={!dirty} onClick={() => setSteps(chain.steps)}>
          Discard
        </Button>
        <span className="ml-3 text-[12px] text-ink-3">
          {dirty ? "Unsaved changes" : "Changes apply to new requests only."}
        </span>
      </div>
    </div>
  );
}

/** Approval chains: chain list on the left, vertical step editor on the right. */
export function ApprovalChains() {
  const [chains, setChains] = useState(approvalChains);
  const [selectedId, setSelectedId] = useState(chains[0].id);
  const selected = chains.find((chain) => chain.id === selectedId) ?? chains[0];

  return (
    <div className="flex gap-16 px-page pt-10 pb-16">
      <aside className="w-[280px] shrink-0">
        <div className="mb-2 text-[12px] text-ink-3">Policies</div>
        <ul className="border-t border-line">
          {chains.map((chain) => {
            const isActive = chain.id === selected.id;
            return (
              <li key={chain.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(chain.id)}
                  className={cn(
                    "relative flex w-full items-start gap-3 border-b border-line px-3 py-3.5 text-left transition-colors",
                    isActive ? "bg-subtle" : "hover:bg-subtle/60",
                  )}
                >
                  {isActive && <span className="absolute inset-y-0 left-0 w-[2px] bg-ink" />}
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[14px] text-ink">{chain.name}</span>
                    <span className="mt-1 block truncate text-[12px] text-ink-2">
                      {chain.steps.map((step) => step.approver).join(" → ")}
                    </span>
                  </span>
                  <Count value={chain.steps.length} tone={isActive ? "outline" : "gray"} className="mt-px" />
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
          Requests move through each step in order. Conditional steps are skipped when their rule doesn’t match.
        </p>
      </aside>
      <ChainEditor
        key={selected.id + selected.steps.map((s) => s.id).join()}
        chain={selected}
        onSave={(next) => setChains((current) => current.map((chain) => (chain.id === next.id ? next : chain)))}
      />
    </div>
  );
}
