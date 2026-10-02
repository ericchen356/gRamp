"use client";

import { ArrowRight, Check, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, IconButton } from "@/components/ui/button";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { MenuDivider, MenuItem, Popover } from "@/components/ui/popover";
import { Sparkline } from "@/components/ui/sparkline";
import { Stat } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import {
  approvalRequests,
  balanceHistory,
  entities,
  treasurySummary,
  type ApprovalRequest,
  type TreasuryAccount,
} from "@/data/treasury";
import { formatDate, formatMoney } from "@/lib/format";
import { AccountDrawer } from "./account-drawer";
import { BalanceChart } from "./balance-chart";
import { CollapsibleGroup, CollapsibleSection } from "./collapsible";

/** Row-level "···" trigger used by approvals and account rows. */
function RowMenu({ label, items }: { label: string; items: { label: string; onSelect: () => void; destructive?: boolean }[] }) {
  return (
    <Popover
      align="end"
      trigger={({ toggle }) => (
        <IconButton
          variant="bare"
          size="sm"
          label={label}
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
          className="text-ink-1 [&_svg]:size-4"
        >
          <MoreHorizontal />
        </IconButton>
      )}
    >
      {(close) =>
        items.map((item, index) => (
          <div key={item.label}>
            {item.destructive && index > 0 && <MenuDivider />}
            <MenuItem
              destructive={item.destructive}
              onSelect={() => {
                close();
                item.onSelect();
              }}
            >
              {item.label}
            </MenuItem>
          </div>
        ))
      }
    </Popover>
  );
}

function ApprovalRow({
  request,
  onResolve,
}: {
  request: ApprovalRequest;
  onResolve: (request: ApprovalRequest, decision: "approve" | "decline") => void;
}) {
  const toast = useToast();
  const isWithdrawal = request.kind === "withdrawal";

  return (
    <li className="flex min-h-[60px] items-center gap-[15px] border border-line py-2.5 pr-[14px] pl-[22px]">
      {isWithdrawal ? (
        <MerchantLogo name={request.counterparty} size={30} className="ring-[1.5px] ring-ink ring-offset-1" />
      ) : (
        <Avatar name={request.requestedBy} size={30} />
      )}
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[15px] text-ink">
          {isWithdrawal ? `${formatMoney(request.amount)} withdrawal by ${request.counterparty}` : request.title}
        </div>
        <div className="mt-1 truncate text-[13px] text-ink-2">
          {isWithdrawal ? (
            <>
              From {request.fromAccount} · <span className="text-caution">Expires {formatDate(request.expires)}</span>
            </>
          ) : (
            <>
              {request.requestedBy} · From {request.fromAccount}
              <ArrowRight className="mx-1 inline size-3 -translate-y-px stroke-[1.75]" />
              {request.toAccount}
            </>
          )}
        </div>
      </div>
      <RowMenu
        label="More options"
        items={[
          {
            label: "View details",
            onSelect: () => toast.show(isWithdrawal ? "Opening withdrawal request" : "Opening automation request", "neutral"),
          },
          isWithdrawal
            ? { label: "Approve once", onSelect: () => onResolve(request, "approve") }
            : { label: "Edit before approving", onSelect: () => toast.show("Draft copied to Automations", "neutral") },
          { label: "Decline", destructive: true, onSelect: () => onResolve(request, "decline") },
        ]}
      />
      <Button variant="approve" className="ml-2.5 h-[38px] gap-2.5 px-4" onClick={() => onResolve(request, "approve")}>
        <Check className="size-4 stroke-[1.5]" />
        {isWithdrawal ? "Approve & trust" : "Approve"}
      </Button>
    </li>
  );
}

function AccountRow({ account, onOpen }: { account: TreasuryAccount; onOpen: () => void }) {
  const toast = useToast();
  return (
    <li
      onClick={onOpen}
      className="flex h-[60px] cursor-pointer items-center gap-4 border-b border-line pr-[14px] pl-[15px] last:border-b-0 hover:bg-subtle"
    >
      <span className="flex-1 truncate text-[15px] text-ink">{account.name}</span>
      <Sparkline data={account.trend} width={96} height={30} className="max-lg:hidden" />
      <span className="w-[140px] text-right text-[15px] text-ink tabular">{formatMoney(account.balance)}</span>
      <RowMenu
        label={`${account.name} options`}
        items={[
          { label: "View account", onSelect: onOpen },
          { label: "Transfer funds", onSelect: () => toast.show(`Transfer from ${account.name} started`, "neutral") },
          { label: "Download statement", onSelect: () => toast.show(`September statement for ${account.name} downloaded`, "neutral") },
        ]}
      />
    </li>
  );
}

/** Main column of Cash & Treasury › Overview. */
export function TreasuryOverview() {
  const toast = useToast();
  const [requests, setRequests] = useState(approvalRequests);
  const [openAccount, setOpenAccount] = useState<{ account: TreasuryAccount; entity: string } | null>(null);

  const resolve = (request: ApprovalRequest, decision: "approve" | "decline") => {
    setRequests((current) => current.filter((r) => r.id !== request.id));
    if (decision === "decline") {
      toast.show(request.kind === "withdrawal" ? "Withdrawal declined" : "Automation request declined", "neutral");
    } else if (request.kind === "withdrawal") {
      toast.show(`Withdrawal approved · ${request.counterparty} is now trusted`);
    } else {
      toast.show("Automation approved and turned on");
    }
  };

  return (
    <div className="min-w-0 flex-1 pt-[38px] pr-[54px] pb-20 pl-page">
      <div className="flex gap-6">
        <Stat
          label="Total balance"
          info
          size="md"
          value={formatMoney(treasurySummary.totalBalance)}
          caption={`Available: ${formatMoney(treasurySummary.available)}`}
        />
        <Stat
          label="All time earnings"
          info
          size="md"
          value={formatMoney(treasurySummary.allTimeEarnings)}
        />
      </div>

      <div className="mt-6">
        <BalanceChart data={balanceHistory} />
      </div>

      <CollapsibleSection title="Requires your approval" className="mt-10">
        {requests.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {requests.map((request) => (
              <ApprovalRow key={request.id} request={request} onResolve={resolve} />
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex h-[60px] items-center gap-3 border border-dashed border-line-strong px-[22px] text-[13px] text-ink-2">
            <Check className="size-4 stroke-[1.5] text-approve" />
            You’re all caught up. New withdrawal and automation requests will appear here.
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Accounts" className="mt-10">
        <div className="mt-2.5 flex flex-col gap-1.5">
          {entities.map((entity) => (
            <CollapsibleGroup key={entity.id} label={entity.name} meta={formatMoney(entity.total)}>
              <ul className="border border-line">
                {entity.accounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    onOpen={() => setOpenAccount({ account, entity: entity.name })}
                  />
                ))}
              </ul>
            </CollapsibleGroup>
          ))}
        </div>
      </CollapsibleSection>

      <AccountDrawer account={openAccount?.account ?? null} entity={openAccount?.entity} onClose={() => setOpenAccount(null)} />
    </div>
  );
}
