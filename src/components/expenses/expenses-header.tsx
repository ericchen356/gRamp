"use client";

import { ChevronDown, MoreVertical } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button, IconButton } from "@/components/ui/button";
import { MenuItem, Popover } from "@/components/ui/popover";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { trips } from "@/data/expenses";
import { useExpenses } from "./expenses-store";
import { NewReimbursementDialog } from "./new-reimbursement-dialog";

/** Title, actions and tabs shared by every Expenses & travel tab. */
export function ExpensesHeader() {
  const pathname = usePathname();
  const toast = useToast();
  const { expenses, reimbursements, setComposerOpen } = useExpenses();
  const travel = pathname === "/expenses/travel";

  const needsAttention = expenses.filter((e) => e.expenseStatus !== "approved").length;
  const pendingReimbursements = reimbursements.filter((r) => r.status === "pending" || r.status === "needs_info").length;

  return (
    <>
      <PageHeader
        eyebrow="Expenses & travel"
        title="Expenses"
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
                  <MenuItem onSelect={() => { close(); toast.show("Receipt reminders sent to 6 cardholders"); }}>
                    Remind cardholders
                  </MenuItem>
                  <MenuItem onSelect={() => { close(); toast.show("Forwarding address copied: receipts@efficient.app", "neutral"); }}>
                    Copy receipt email address
                  </MenuItem>
                  <MenuItem onSelect={close}>Expense settings</MenuItem>
                </>
              )}
            </Popover>
            <Popover
              align="end"
              trigger={({ toggle }) => (
                <Button size="lg" onClick={toggle} className="gap-3 pr-3.5">
                  Export
                  <ChevronDown className="size-4 stroke-[1.5]" />
                </Button>
              )}
            >
              {(close) =>
                ["CSV", "Excel (.xlsx)", "PDF with receipts"].map((format) => (
                  <MenuItem
                    key={format}
                    onSelect={() => {
                      close();
                      toast.show(`Export started. We'll email you the ${format.split(" ")[0]} file.`, "neutral");
                    }}
                  >
                    {format}
                  </MenuItem>
                ))
              }
            </Popover>
            {travel ? (
              <Button size="lg" variant="primary" onClick={() => toast.show("Opening Ramp Travel in a new tab", "neutral")}>
                Book travel
              </Button>
            ) : (
              <Button size="lg" variant="primary" onClick={() => setComposerOpen(true)}>
                New reimbursement
              </Button>
            )}
          </>
        }
      />
      <Tabs
        className="mt-7"
        items={[
          { label: "Card transactions", href: "/expenses", count: needsAttention },
          { label: "Reimbursements", href: "/expenses/reimbursements", count: pendingReimbursements },
          { label: "Travel", href: "/expenses/travel", count: trips.length },
          { label: "Expense policy", href: "/expenses/policy", separatorBefore: true },
        ]}
      />
      <NewReimbursementDialog />
    </>
  );
}
