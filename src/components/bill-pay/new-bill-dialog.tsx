"use client";

import { FileText, Mail, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/stat";
import { useToast } from "@/components/ui/toast";
import { TODAY, billTotal, type Bill, type BillLine, type BillMethod, type BillStage } from "@/data/bills";
import { currentUser } from "@/data/people";
import { quickbooks } from "@/data/transactions";
import { findVendorByName, vendors } from "@/data/vendors";
import { formatDateLong, formatMoney } from "@/lib/format";
import { stageRoutes } from "./bill-status";
import { defaultApprovers, useBills } from "./bills-store";
import { InvoicePreview } from "./invoice-preview";
import { Field, TextInput } from "@/components/ui/field";

type Phase = "upload" | "extracting" | "review";

type Extracted = {
  vendor: string;
  invoiceNumber: string;
  lines: BillLine[];
  method: BillMethod;
  glAccount: string;
  department: string;
  terms: number;
};

function addDays(iso: string, days: number) {
  return new Date(new Date(`${iso}T12:00:00`).getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

/** What the fake OCR "reads" from the uploaded invoice. */
function extract(vendorName: string | null): Extracted {
  const vendor = vendorName ? findVendorByName(vendorName) : undefined;
  if (vendor) {
    const monthly = Math.round((vendor.contract.value ?? vendor.spend12mo) / (vendor.contract.billing === "Annual" ? 1 : 12));
    const prefix = vendor.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
    const method = (vendor.paymentMethods.find((m) => m !== "Card") ?? "ACH") as BillMethod;
    return {
      vendor: vendor.name,
      invoiceNumber: `${prefix}-${(vendor.spend12mo * 7).toFixed(0).slice(-5)}`,
      lines: [{ description: `${vendor.contract.plan ?? vendor.category} - October 2026`, quantity: 1, rate: monthly }],
      method,
      glAccount: vendor.glAccount,
      department: vendor.department,
      terms: vendor.paymentTerms === "Net 15" ? 15 : vendor.paymentTerms === "Net 45" ? 45 : 30,
    };
  }
  return {
    vendor: "Cooley LLP",
    invoiceNumber: "INV-21388",
    lines: [
      { description: "Series B closing - stock purchase agreement & disclosure schedules", quantity: 11.2, rate: 925 },
      { description: "Option plan amendment and board approvals", quantity: 2.5, rate: 925 },
      { description: "Secretary of State filing fees", quantity: 1, rate: 289 },
    ],
    method: "ACH",
    glAccount: "6710 Legal & Professional",
    department: "Finance",
    terms: 30,
  };
}

const vendorOptions = vendors.map((v) => ({ value: v.name, label: v.name, description: v.category }));
const methodOptions = [
  { value: "ACH", label: "ACH", description: "3 business days" },
  { value: "Wire", label: "Wire", description: "Same day" },
  { value: "Check", label: "Check", description: "5–7 days" },
  { value: "Card", label: "Vendor card", description: "Instant" },
];
const glOptions = [...quickbooks.glAccounts, "6710 Legal & Professional", "6720 Contractors"].map((g) => ({ value: g, label: g }));

/** "New bill" flow opened by `?new=1`: upload → fake OCR → review & submit. */
export function NewBillDialog() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = params.get("new") === "1";
  const close = () => router.replace(pathname, { scroll: false });

  return (
    <Dialog open={open} onClose={close} className="flex max-h-[84vh] max-w-[940px] flex-col">
      {open && <NewBillFlow vendorHint={params.get("vendor")} onClose={close} />}
    </Dialog>
  );
}

function NewBillFlow({ vendorHint, onClose }: { vendorHint: string | null; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const { add } = useBills();
  const source = useMemo(() => extract(vendorHint), [vendorHint]);
  const [phase, setPhase] = useState<Phase>("upload");
  const [progress, setProgress] = useState(0);
  const [autoFilled, setAutoFilled] = useState(false);

  const [vendor, setVendor] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [method, setMethod] = useState<string>("ACH");
  const [glAccount, setGlAccount] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "extracting") return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / 1600) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(timer);
        setVendor(source.vendor);
        setInvoiceNumber(source.invoiceNumber);
        setAmount(billTotal(source.lines).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setDueDate(addDays(TODAY, source.terms));
        setMethod(source.method);
        setGlAccount(source.glAccount);
        setAutoFilled(true);
        setPhase("review");
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [phase, source]);

  const dueOptions = [15, 30, 45].map((days) => ({
    value: addDays(TODAY, days),
    label: formatDateLong(addDays(TODAY, days)),
    description: `Net ${days}`,
  }));

  const parsedAmount = Number(amount.replace(/[^0-9.]/g, ""));
  const valid = !!vendor && invoiceNumber.trim().length > 0 && parsedAmount > 0 && !!dueDate;

  const create = (stage: BillStage) => {
    if (!vendor || !dueDate) return;
    const lines =
      autoFilled && vendor === source.vendor && Math.abs(parsedAmount - billTotal(source.lines)) < 0.01
        ? source.lines
        : [{ description: `Invoice ${invoiceNumber}`, quantity: 1, rate: parsedAmount }];
    const known = findVendorByName(vendor);
    const bill: Bill = {
      id: `bill_new_${Date.now()}`,
      vendor,
      invoiceNumber: invoiceNumber.trim(),
      issueDate: TODAY,
      dueDate,
      amount: billTotal(lines),
      stage,
      method: method as BillMethod,
      approvers: stage === "approval" ? defaultApprovers(parsedAmount) : [],
      submittedBy: currentUser.name,
      glAccount: glAccount ?? undefined,
      department: known?.department ?? source.department,
      lines,
      missing: stage === "draft" && !glAccount ? ["GL account"] : undefined,
    };
    add(bill);
    toast.show(stage === "approval" ? `${vendor} bill submitted for approval` : `${vendor} bill saved as a draft`);
    router.replace(stageRoutes[stage], { scroll: false });
  };

  const preview = {
    vendor: vendor ?? source.vendor,
    invoiceNumber: invoiceNumber || source.invoiceNumber,
    issueDate: TODAY,
    dueDate: dueDate ?? addDays(TODAY, source.terms),
    lines: source.lines,
    method: method as BillMethod,
  };

  return (
    <>
      <DialogHeader
        title="New bill"
        description={
          phase === "review"
            ? autoFilled
              ? "We filled in these details from the invoice. Review them before submitting."
              : "Enter the bill details."
            : "Upload an invoice and Ramp will fill in the details for you."
        }
        onClose={onClose}
      />

      {phase !== "review" ? (
        <div className="px-6 pt-4 pb-6">
          {phase === "upload" ? (
            <button
              type="button"
              onClick={() => setPhase("extracting")}
              className="flex h-[280px] w-full flex-col items-center justify-center gap-3 border border-dashed border-line-strong bg-subtle text-center transition-colors hover:border-ink-4 hover:bg-muted/60"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-canvas">
                <Upload className="size-[18px] stroke-[1.5] text-ink-1" />
              </span>
              <span className="text-[16px] text-ink">Drop invoices here or click to upload</span>
              <span className="text-[13px] text-ink-2">PDF, PNG or JPG up to 25 MB. Upload several at once to create a bill for each.</span>
            </button>
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center gap-5 border border-line bg-subtle px-6">
              <div className="flex w-full max-w-[420px] items-center gap-3 border border-line bg-canvas px-4 py-3">
                <FileText className="size-5 shrink-0 stroke-[1.5] text-ink-2" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-ink">
                    {source.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_{source.invoiceNumber}.pdf
                  </div>
                  <Progress value={progress} className="mt-2" />
                </div>
                <span className="w-9 text-right text-[12px] text-ink-2 tabular">{Math.round(progress)}%</span>
              </div>
              <p className="text-[13px] text-ink-2">
                {progress < 45 ? "Reading invoice…" : progress < 85 ? "Extracting vendor, amount and due date…" : "Matching vendor and payment details…"}
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-[13px] text-ink-2">
            <span className="flex items-center gap-2">
              <Mail className="size-4 stroke-[1.5]" />
              Or forward invoices to <span className="text-ink">bills@efficient.ramp.com</span>
            </span>
            <button type="button" onClick={() => setPhase("review")} className="text-ink underline decoration-ink-4 underline-offset-2 hover:decoration-ink">
              Enter details manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_400px] border-t border-line">
          <div className="overflow-y-auto bg-subtle px-6 py-5 scrollbar-thin">
            {autoFilled ? (
              <InvoicePreview bill={preview} />
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-2 text-center text-[13px] text-ink-2">
                <FileText className="size-7 stroke-[1.25] text-ink-4" />
                No invoice attached
                <Button size="xs" className="mt-2" onClick={() => setPhase("extracting")}>
                  Upload invoice
                </Button>
              </div>
            )}
          </div>
          <div className="grid content-start grid-cols-2 gap-x-4 gap-y-5 overflow-y-auto px-6 py-5 scrollbar-thin">
            <Field label="Vendor" autoFilled={autoFilled} className="col-span-2">
              <Select variant="field" label="Vendor" value={vendor} options={vendorOptions} onChange={setVendor} placeholder="Select vendor" />
            </Field>
            <Field label="Invoice number" autoFilled={autoFilled}>
              <TextInput value={invoiceNumber} onValueChange={setInvoiceNumber} placeholder="INV-0001" />
            </Field>
            <Field label="Amount" autoFilled={autoFilled}>
              <TextInput value={amount} onValueChange={setAmount} prefix="$" placeholder="0.00" inputMode="decimal" className="tabular" />
            </Field>
            <Field label="Invoice date" autoFilled={autoFilled}>
              <TextInput value={formatDateLong(TODAY)} onValueChange={() => undefined} readOnly />
            </Field>
            <Field label="Due date" autoFilled={autoFilled}>
              <Select variant="field" label="Due date" value={dueDate} options={dueOptions} onChange={setDueDate} placeholder="Select date" />
            </Field>
            <Field label="Payment method" autoFilled={autoFilled}>
              <Select variant="field" label="Payment method" value={method} options={methodOptions} onChange={setMethod} placeholder="Select method" />
            </Field>
            <Field label="GL account" autoFilled={autoFilled}>
              <Select variant="field" label="GL account" value={glAccount} options={glOptions} onChange={setGlAccount} placeholder="Select account" />
            </Field>
            <div className="col-span-2 border border-line bg-subtle px-3 py-2.5 text-[12px] text-ink-2">
              Approval: {defaultApprovers(parsedAmount || 0).map((a) => a.name).join(" → ")}
              {parsedAmount >= 5000 && <span className="text-ink-3"> · bills over {formatMoney(5000)} need two approvers</span>}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
        {phase === "review" ? (
          <>
            <Button size="sm" variant="ghost" className="mr-auto" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" disabled={!vendor} onClick={() => create("draft")}>
              Save as draft
            </Button>
            <Button size="sm" variant="primary" disabled={!valid} onClick={() => create("approval")}>
              Submit for approval
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </>
  );
}
