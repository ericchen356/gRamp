"use client";

import { Building2, CreditCard, Mail } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { currentUser, people } from "@/data/people";
import { vendorCategories, type PaymentMethod } from "@/data/vendors";
import type { VendorRow } from "./vendors-overview";
import { ChoiceTiles, Field, TextInput } from "@/components/ui/field";

const ownerOptions = people.map((person) => ({
  value: person.name,
  label: person.id === currentUser.id ? `${person.name} (You)` : person.name,
  description: person.department,
}));

const categoryOptions = vendorCategories.map((category) => ({ value: category, label: category }));

type Draft = { name: string; website: string; email: string; category: string | null; owner: string; method: PaymentMethod };

const emptyDraft: Draft = { name: "", website: "", email: "", category: null, owner: currentUser.name, method: "ACH" };

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** "New vendor" dialog, opened by `?new=1` on the Vendors overview. */
export function NewVendorDialog({ onCreate }: { onCreate: (vendor: VendorRow) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const open = useSearchParams().get("new") === "1";
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const close = () => {
    setDraft(emptyDraft);
    router.replace(pathname, { scroll: false });
  };
  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));
  const valid = draft.name.trim().length > 1 && !!draft.category;

  const submit = () => {
    if (!valid) return;
    const name = draft.name.trim();
    const owner = people.find((p) => p.name === draft.owner) ?? currentUser;
    const website = draft.website.trim() || `${slug(name)}.com`;
    onCreate({
      id: `new-${slug(name)}`,
      isNew: true,
      name,
      legalName: name,
      category: draft.category ?? "Other",
      owner: owner.name,
      department: owner.department,
      website,
      contactEmail: draft.email.trim() || `billing@${website}`,
      address: "",
      spend12mo: 0,
      spendYtd: 0,
      trend: Array(12).fill(0),
      transactionCount: 0,
      paymentMethods: [draft.method],
      contract: { status: "none", billing: "Monthly" },
      glAccount: "6410 Software",
      paymentTerms: "Net 30",
      w9: false,
      is1099: false,
    });
    close();
  };

  return (
    <Dialog open={open} onClose={close} className="max-w-[560px]">
      <DialogHeader
        title="New vendor"
        description="Add a vendor to pay by bill or card. We'll request their W-9 and payment details for you."
        onClose={close}
      />
      <form
        className="grid grid-cols-2 gap-x-4 gap-y-5 px-6 pt-5 pb-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Vendor name" className="col-span-2">
          <TextInput value={draft.name} onValueChange={(name) => patch({ name })} placeholder="e.g. Northwind Analytics" autoFocus />
        </Field>
        <Field label="Website">
          <TextInput value={draft.website} onValueChange={(website) => patch({ website })} placeholder="northwind.com" />
        </Field>
        <Field label="Billing email">
          <TextInput value={draft.email} onValueChange={(email) => patch({ email })} placeholder="billing@northwind.com" type="email" />
        </Field>
        <Field label="Category">
          <Select
            variant="field"
            label="Category"
            value={draft.category}
            options={categoryOptions}
            onChange={(category) => patch({ category })}
            placeholder="Select category"
          />
        </Field>
        <Field label="Vendor owner">
          <Select variant="field" label="Vendor owner" value={draft.owner} options={ownerOptions} onChange={(owner) => patch({ owner })} placeholder="Select owner" />
        </Field>
        <Field label="How will you pay them?" className="col-span-2">
          <ChoiceTiles<PaymentMethod>
            value={draft.method}
            onChange={(method) => patch({ method })}
            options={[
              { value: "ACH", label: "Bank transfer", description: "ACH or wire", icon: <Building2 /> },
              { value: "Card", label: "Ramp card", description: "Earn 1.5% back", icon: <CreditCard /> },
              { value: "Check", label: "Check", description: "Mailed by Ramp", icon: <Mail /> },
            ]}
          />
        </Field>
        <button type="submit" hidden />
      </form>
      <DialogFooter>
        <Button size="sm" onClick={close}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" disabled={!valid} onClick={submit}>
          Add vendor
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
