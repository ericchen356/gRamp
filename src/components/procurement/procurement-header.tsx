"use client";

import { MoreVertical } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { MenuItem, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { TODAY } from "@/components/ui/data-toolbar";
import { currentUser } from "@/data/people";
import type { PurchaseRequest } from "@/data/procurement";
import { useProcurement } from "./procurement-store";
import { Field, MoneyInput, TextInput } from "@/components/ui/field";
import { parseAmount } from "@/lib/format";

const titles: Record<string, string> = {
  "/procurement": "Requests",
  "/procurement/purchase-orders": "Purchase orders",
  "/procurement/intake": "Intake forms",
};

const termOptions = ["Monthly", "12 months", "24 months", "36 months", "One-time"].map((value) => ({ value, label: value }));

const initial = { form: null as string | null, title: "", vendor: "", amount: "", term: "12 months" };

function NewRequestDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { forms, requests, addRequest } = useProcurement();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const template = forms.find((f) => f.id === form.form);
  const amount = parseAmount(form.amount);
  const valid = !!template && !!form.title.trim() && !!form.vendor.trim() && amount > 0;

  const close = () => {
    setForm(initial);
    onClose();
  };

  const submit = () => {
    if (!template) return;
    const stages = template.workflow.map((step) => (step === "Manager" ? "Manager approval" : `${step} review`));
    const due = "2026-10-16";
    const request: PurchaseRequest = {
      id: `REQ-${2142 + requests.length - 9}`,
      title: form.title.trim(),
      requester: currentUser.name,
      department: currentUser.department,
      vendor: form.vendor.trim(),
      amount,
      term: form.term,
      type: template.id === "renewal" ? "Renewal" : template.id === "vendor" ? "New vendor" : "One-time purchase",
      stages,
      stage: 0,
      status: "in_review",
      due,
      submitted: TODAY,
      description: `Submitted through the ${template.name} intake form.`,
      timeline: [
        { title: "Request submitted", actor: currentUser.name, date: TODAY, state: "done" },
        ...stages.map((title, index) => ({
          title,
          actor: index === stages.length - 1 ? "Tina Cruz" : index === 0 ? "Tina Cruz" : "Ethan Park",
          date: due,
          state: index === 0 ? ("current" as const) : ("upcoming" as const),
        })),
      ],
    };
    addRequest(request);
    toast.show(`${request.id} submitted for ${stages[0].toLowerCase()}`);
    close();
    router.push("/procurement");
  };

  return (
    <Dialog open={open} onClose={close} className="max-w-[540px]">
      <DialogHeader title="New purchase request" description="Pick the intake form that matches what you’re buying." onClose={close} />
      <div className="flex flex-col gap-4 px-6 pt-4 pb-6">
        <Field label="Intake form" hint={template && `Routes to ${template.workflow.join(" → ")}`}>
          <Select
            variant="field"
            label="Intake form"
            value={form.form}
            options={forms.filter((f) => f.active).map((f) => ({ value: f.id, label: f.name }))}
            onChange={(v) => set("form", v)}
            placeholder="Choose a form"
          />
        </Field>
        <Field label="What are you buying?">
          <TextInput value={form.title} onValueChange={(v) => set("title", v)} placeholder="e.g. Notion Enterprise upgrade" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vendor">
            <TextInput value={form.vendor} onValueChange={(v) => set("vendor", v)} placeholder="e.g. Notion" />
          </Field>
          <Field label="Contract term">
            <Select variant="field" label="Term" value={form.term} options={termOptions} onChange={(v) => set("term", v)} placeholder="Term" />
          </Field>
        </div>
        <Field label="Total amount">
          <MoneyInput value={form.amount} onValueChange={(v) => set("amount", v)} placeholder="0.00" suffix="USD" />
        </Field>
      </div>
      <DialogFooter>
        <Button size="md" onClick={close}>
          Cancel
        </Button>
        <Button size="md" variant="primary" disabled={!valid} onClick={submit}>
          Submit request
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/** Title, actions and tabs shared by the Procurement routes. */
export function ProcurementHeader() {
  const pathname = usePathname();
  const toast = useToast();
  const { requests, orders, forms } = useProcurement();
  const [creating, setCreating] = useState(false);

  const openRequests = requests.filter((r) => r.status === "in_review" || r.status === "needs_info").length;
  const openOrders = orders.filter((o) => o.status === "open" || o.status === "partially_received" || o.status === "draft").length;

  const primary =
    pathname === "/procurement/purchase-orders" ? (
      <Button size="lg" variant="primary" onClick={() => toast.show("Draft PO-1049 created", "neutral")}>
        Create PO
      </Button>
    ) : pathname === "/procurement/intake" ? (
      <Button size="lg" variant="primary" onClick={() => toast.show("Opening the form builder", "neutral")}>
        New form
      </Button>
    ) : (
      <Button size="lg" variant="primary" onClick={() => setCreating(true)}>
        New request
      </Button>
    );

  return (
    <>
      <PageHeader
        eyebrow="Procurement"
        title={titles[pathname] ?? "Requests"}
        actions={
          <>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <IconButton variant="bare" label="More actions" onClick={toggle} className="mr-1.5 [&_svg]:size-[18px]">
                  <MoreVertical />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  <MenuItem onSelect={() => { close(); toast.show("Approval workflows saved", "neutral"); }}>Approval workflows</MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show("Procurement settings saved", "neutral"); }}>Procurement settings</MenuItem>
                </>
              )}
            </Popover>
            {primary}
          </>
        }
      />
      <Tabs
        className="mt-7"
        items={[
          { label: "Requests", href: "/procurement", count: openRequests },
          { label: "Purchase orders", href: "/procurement/purchase-orders", count: openOrders },
          { label: "Intake forms", href: "/procurement/intake", count: forms.length },
        ]}
      />
      <NewRequestDialog open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
