"use client";

import { Landmark, MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Status, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { bankAccounts as seed } from "@/data/settings";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { SettingsPage } from "./settings-shell";
import { FormRow, FormSection } from "@/components/ui/field";

export function BankAccountSettings() {
  const toast = useToast();
  const [accounts, setAccounts] = useState(seed);
  const [autopay, setAutopay] = useState(true);

  const makePrimary = (id: string) => {
    setAccounts((current) => current.map((account) => ({ ...account, primary: account.id === id })));
    toast.show(`${accounts.find((a) => a.id === id)?.bank} is now your primary account`);
  };

  return (
    <SettingsPage
      title="Bank accounts"
      description="Accounts used to pay your Ramp statement, fund reimbursements and send vendor payments."
      actions={
        <Button variant="primary" size="sm" onClick={() => toast.show("Plaid opened to link a new account", "neutral")}>
          <Plus className="size-3.5 stroke-[1.75]" />
          Link bank account
        </Button>
      }
    >
      <div className="border-t border-line">
        <div className="grid grid-cols-[minmax(0,1.6fr)_120px_110px_minmax(0,1.1fr)_130px_40px] items-center gap-4 border-b border-line py-2.5 text-[12px] text-ink-3">
          <span>Account</span>
          <span>Account no.</span>
          <span>Routing</span>
          <span>Entity</span>
          <span className="text-right">Balance</span>
          <span />
        </div>
        {accounts.map((account) => (
          <div
            key={account.id}
            className="grid grid-cols-[minmax(0,1.6fr)_120px_110px_minmax(0,1.1fr)_130px_40px] items-center gap-4 border-b border-line-soft py-3.5 text-[13px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <MerchantLogo name={account.bank} size={32} />
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] text-ink">{account.bank}</span>
                  {account.primary && <Tag tone="outline" className="h-[18px] text-[11px]">Primary</Tag>}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-ink-2">
                  {account.nickname} · {account.type}
                </div>
              </div>
            </div>
            <span className="text-ink-1 tabular">••••{account.last4}</span>
            <span className="text-ink-2 tabular">•••••{account.routingLast4}</span>
            <span className="min-w-0">
              {account.status === "Verified" ? (
                <span className="block truncate text-ink-1">{account.entity}</span>
              ) : (
                <Status tone="pending">Pending verification</Status>
              )}
            </span>
            <span className={cn("text-right tabular", account.balance ? "text-ink" : "text-ink-4")}>
              {account.balance ? formatMoney(account.balance) : "—"}
            </span>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <IconButton variant="bare" size="sm" label={`${account.bank} options`} onClick={toggle}>
                  <MoreHorizontal />
                </IconButton>
              )}
            >
              {(close) => (
                <>
                  {account.status !== "Verified" ? (
                    <MenuItem onSelect={() => { close(); toast.show("Micro-deposits sent. They’ll arrive in 1–2 business days.", "neutral"); }}>
                      Verify with micro-deposits
                    </MenuItem>
                  ) : (
                    !account.primary && <MenuItem onSelect={() => { close(); makePrimary(account.id); }}>Make primary</MenuItem>
                  )}
                  <MenuItem onSelect={close}>Rename</MenuItem>
                  <MenuItem onSelect={close}>View statements</MenuItem>
                  <MenuDivider />
                  <MenuItem
                    destructive
                    onSelect={() => {
                      close();
                      if (account.primary) {
                        toast.show("Choose another primary account before removing this one", "neutral");
                        return;
                      }
                      setAccounts((current) => current.filter((a) => a.id !== account.id));
                      toast.show(`${account.bank} ••••${account.last4} removed`, "neutral");
                    }}
                  >
                    Remove
                  </MenuItem>
                </>
              )}
            </Popover>
          </div>
        ))}
      </div>

      <FormSection title="Payments" className="mt-12">
        <FormRow label="Statement autopay" description="Pay your Ramp statement in full from the primary account on the due date." align="center">
          <div className="flex justify-end">
            <Switch checked={autopay} onChange={(value) => { setAutopay(value); toast.show(value ? "Autopay turned on" : "Autopay turned off", value ? "success" : "neutral"); }} label="Statement autopay" />
          </div>
        </FormRow>
        <FormRow label="Reimbursement funding" description="Where employee reimbursements are debited from." align="center">
          <div className="flex items-center gap-2.5 text-[14px] text-ink-1">
            <Landmark className="size-4 stroke-[1.5] text-ink-2" />
            Silicon Valley Bank · Payroll ••••7783
          </div>
        </FormRow>
        <FormRow label="Account verification" description="Accounts are verified via Plaid or micro-deposits." align="center">
          <div className="flex items-center gap-2.5 text-[14px] text-ink-1">
            <ShieldCheck className="size-4 stroke-[1.5] text-positive" />
            {accounts.filter((a) => a.status === "Verified").length} of {accounts.length} accounts verified
          </div>
        </FormRow>
      </FormSection>
    </SettingsPage>
  );
}
