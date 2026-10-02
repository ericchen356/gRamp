"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { roleDescriptions, roles } from "@/data/company";
import { departments, type Person } from "@/data/people";
import { cn } from "@/lib/cn";
import { pluralize } from "@/lib/format";
import { useCompany } from "./company-store";
import { Field } from "@/components/ui/field";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleOptions = roles.map((role) => ({ value: role, label: role }));
const departmentOptions = departments.map((name) => ({ value: name, label: name }));

/** Chip-style multi email input: Enter, comma, space or paste split into tokens. */
function EmailTokens({ emails, onChange }: { emails: string[]; onChange: (emails: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const next = raw
      .split(/[\s,;]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
      .filter((value) => !emails.includes(value));
    if (next.length) onChange([...emails, ...next]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " ", "Tab"].includes(event.key) && draft.trim()) {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && !draft && emails.length) {
      onChange(emails.slice(0, -1));
    }
  };

  return (
    <label className="flex min-h-[96px] cursor-text flex-wrap content-start gap-1.5 rounded-[2px] border border-line-strong bg-canvas p-2 transition-colors hover:border-ink-5 focus-within:border-ink-3">
      {emails.map((email) => {
        const valid = EMAIL.test(email);
        return (
          <span
            key={email}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-full pr-1 pl-2.5 text-[13px]",
              valid ? "bg-muted text-ink-1" : "bg-danger-bg text-danger",
            )}
          >
            {email}
            <button
              type="button"
              aria-label={`Remove ${email}`}
              onClick={() => onChange(emails.filter((value) => value !== email))}
              className="rounded-full p-0.5 text-ink-3 hover:bg-chip hover:text-ink"
            >
              <X className="size-3 stroke-[1.75]" />
            </button>
          </span>
        );
      })}
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft.trim() && commit(draft)}
        onPaste={(event) => {
          event.preventDefault();
          commit(event.clipboardData.getData("text"));
        }}
        placeholder={emails.length ? "" : "name@efficient.app, another@efficient.app"}
        className="h-7 min-w-[180px] flex-1 bg-transparent px-1 text-[14px] text-ink outline-none placeholder:text-ink-4"
      />
    </label>
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const { invite } = useCompany();
  const toast = useToast();
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<Person["role"]>("Employee");
  const [department, setDepartment] = useState<string | null>(null);

  const valid = emails.filter((email) => EMAIL.test(email));
  const invalid = emails.length - valid.length;

  const submit = () => {
    invite(valid.map((email) => ({ email, role, department: department ?? "Operations" })));
    toast.show(`${pluralize(valid.length, "invite")} sent`);
    onClose();
  };

  return (
    <>
      <DialogHeader
        title="Invite people"
        description="They’ll get an email to join Efficient App on Ramp and set up their cards."
        onClose={onClose}
      />
      <div className="space-y-5 px-6 pt-4 pb-6">
        <Field
          label="Email addresses"
          hint={
            invalid > 0 ? (
              <span className="text-danger">{pluralize(invalid, "address is", "addresses are")} not valid</span>
            ) : (
              "Separate multiple emails with a comma or space."
            )
          }
        >
          <EmailTokens emails={emails} onChange={setEmails} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Role" hint={roleDescriptions[role]}>
            <Select variant="field" label="Role" value={role} options={roleOptions} onChange={(value) => setRole(value as Person["role"])} placeholder="Select role" />
          </Field>
          <Field label="Department">
            <Select
              variant="field"
              label="Department"
              value={department}
              options={departmentOptions}
              onChange={setDepartment}
              placeholder="Select department"
            />
          </Field>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={!valid.length || invalid > 0} onClick={submit}>
          {valid.length > 1 ? `Send ${valid.length} invites` : "Send invite"}
        </Button>
      </DialogFooter>
    </>
  );
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards (the shared Dialog portals into `document.body`). */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** URL-driven invite dialog: `?invite=1` opens it from anywhere (header, ⌘K). */
export function InviteDialog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const open = hydrated && searchParams.get("invite") === "1";

  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  return (
    <Dialog open={open} onClose={close} className="max-w-[560px]">
      {open && <InviteForm onClose={close} />}
    </Dialog>
  );
}
