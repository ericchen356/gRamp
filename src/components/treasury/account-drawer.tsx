"use client";

import { ArrowDownLeft, ArrowUpRight, Copy } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Sparkline } from "@/components/ui/sparkline";
import { DetailRow, SplitMoney } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import type { TreasuryAccount } from "@/data/treasury";
import { formatDate, formatMoney } from "@/lib/format";

const kindLabels: Record<TreasuryAccount["kind"], string> = {
  business: "Business checking",
  investment: "Managed investment",
  operations: "Business checking",
  payroll: "Payroll checking",
};

/** Deterministic recent activity derived from the account's trend. */
function recentActivity(account: TreasuryAccount) {
  const days = ["2026-10-01", "2026-09-30", "2026-09-29", "2026-09-26", "2026-09-24"];
  return days.map((date, index) => {
    const delta = account.trend[account.trend.length - 1 - index] - account.trend[account.trend.length - 2 - index];
    const incoming = delta >= 0;
    return {
      id: `${account.id}_${index}`,
      date,
      incoming,
      label: incoming
        ? index === 0 && account.kind === "investment"
          ? "Interest earned"
          : "Sweep in"
        : account.kind === "payroll"
          ? "Payroll run"
          : "Transfer out",
      amount: Math.max(1, Math.abs(delta)) * (account.balance / 640),
    };
  });
}

export function AccountDrawer({
  account,
  entity,
  onClose,
}: {
  account: TreasuryAccount | null;
  entity?: string;
  onClose: () => void;
}) {
  const toast = useToast();
  return (
    <Drawer open={!!account} onClose={onClose} title="Account">
      {account && (
        <div className="px-6 py-6">
          <div className="text-[13px] text-ink-2">{entity}</div>
          <div className="mt-1 text-[22px] leading-tight tracking-[-0.015em] text-ink">{account.name}</div>
          <div className="mt-6 text-[12px] text-ink-2">Current balance</div>
          <SplitMoney
            value={account.balance}
            className="mt-1 block text-[40px] leading-none tracking-[-0.025em] text-ink tabular"
          />
          <Sparkline data={account.trend} width={472} height={64} className="mt-6 w-full" />

          <div className="mt-6 flex gap-2">
            <Button variant="primary" onClick={() => toast.show("Transfer started", "neutral")}>
              Transfer funds
            </Button>
            <Button onClick={() => toast.show(`Statement for ${account.name} downloaded`, "neutral")}>Download statement</Button>
          </div>

          <h3 className="mt-8 mb-1 text-[13px] text-ink">Details</h3>
          <DetailRow label="Account type">{kindLabels[account.kind]}</DetailRow>
          <DetailRow label="Account number">
            <span className="inline-flex items-center gap-1.5">
              •••• {account.last4}
              <IconButton
                variant="bare"
                size="sm"
                label="Copy account number"
                className="-my-1 size-6 [&_svg]:size-3.5"
                onClick={() => toast.show("Account number copied", "neutral")}
              >
                <Copy />
              </IconButton>
            </span>
          </DetailRow>
          <DetailRow label="Routing number">121145307</DetailRow>
          <DetailRow label="Yield">{account.kind === "investment" ? "4.12% APY" : "2.50% APY"}</DetailRow>

          <h3 className="mt-8 mb-1 text-[13px] text-ink">Recent activity</h3>
          <ul>
            {recentActivity(account).map((item) => (
              <li key={item.id} className="flex items-center gap-3 border-b border-line-soft py-3 text-[13px] last:border-b-0">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-ink-2">
                  {item.incoming ? (
                    <ArrowDownLeft className="size-3.5 stroke-[1.5]" />
                  ) : (
                    <ArrowUpRight className="size-3.5 stroke-[1.5]" />
                  )}
                </span>
                <span className="flex-1">
                  <span className="block text-ink-1">{item.label}</span>
                  <span className="block text-[12px] text-ink-2">{formatDate(item.date)}</span>
                </span>
                <span className={item.incoming ? "text-money tabular" : "text-ink-1 tabular"}>
                  {item.incoming ? "+" : "−"}
                  {formatMoney(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
