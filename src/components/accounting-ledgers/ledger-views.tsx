"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import type { LedgerRowBase, LedgerStatus } from "@/data/ledgers";
import { paymentsLedger, reimbursementsLedger, treasuryLedger } from "./ledger-configs";
import { LedgerTable } from "./ledger-table";
import type { LedgerConfig, LedgerKey } from "./ledger-types";

function LedgerHeader<R extends LedgerRowBase>({ config }: { config: LedgerConfig<R> }) {
  const { counts } = config.store.useLedger();
  return (
    <>
      <PageHeader eyebrow="Accounting" title={config.title} count={counts.overview} />
      <Tabs
        className="mt-7"
        items={[
          { label: "Overview", href: config.basePath, count: counts.overview },
          { label: "Needs review", href: `${config.basePath}/needs-review`, count: counts.needs_review },
          { label: "Ready to sync", href: `${config.basePath}/ready-to-sync`, count: counts.ready_to_sync },
          { label: config.waitingLabel, href: `${config.basePath}/waiting`, count: counts.waiting, separatorBefore: true },
        ]}
      />
    </>
  );
}

function LedgerFrame<R extends LedgerRowBase>({ config, children }: { config: LedgerConfig<R>; children: ReactNode }) {
  const { Provider } = config.store;
  return (
    <Provider>
      <div className="flex min-h-screen flex-col">
        <LedgerHeader config={config} />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </Provider>
  );
}

/** Layout chrome (store, title, tabs) for one accounting sub-ledger. */
export function LedgerShell({ ledger, children }: { ledger: LedgerKey; children: ReactNode }) {
  switch (ledger) {
    case "reimbursements":
      return <LedgerFrame config={reimbursementsLedger}>{children}</LedgerFrame>;
    case "payments":
      return <LedgerFrame config={paymentsLedger}>{children}</LedgerFrame>;
    case "treasury":
      return <LedgerFrame config={treasuryLedger}>{children}</LedgerFrame>;
  }
}

/** One tab of a sub-ledger; `status` omitted = Overview. */
export function LedgerView({ ledger, status }: { ledger: LedgerKey; status?: LedgerStatus }) {
  switch (ledger) {
    case "reimbursements":
      return <LedgerTable config={reimbursementsLedger} status={status} />;
    case "payments":
      return <LedgerTable config={paymentsLedger} status={status} />;
    case "treasury":
      return <LedgerTable config={treasuryLedger} status={status} />;
  }
}
