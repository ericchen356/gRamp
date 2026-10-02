import { Download, Minus, Plus } from "lucide-react";
import { MerchantLogo } from "@/components/ui/merchant-logo";
import { company } from "@/data/people";
import { remittanceFor, type Bill } from "@/data/bills";
import { findVendorByName } from "@/data/vendors";
import { cn } from "@/lib/cn";
import { formatDateLong, formatMoney } from "@/lib/format";

type InvoiceData = Pick<Bill, "vendor" | "invoiceNumber" | "issueDate" | "dueDate" | "lines" | "method" | "memo">;

/** A PDF-like rendering of the vendor's invoice, framed like a document viewer. */
export function InvoicePreview({ bill, className, toolbar = true }: { bill: InvoiceData; className?: string; toolbar?: boolean }) {
  const vendor = findVendorByName(bill.vendor);
  const subtotal = bill.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  const file = `${bill.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${bill.invoiceNumber}.pdf`;

  return (
    <div className={cn("flex flex-col", className)}>
      {toolbar && (
        <div className="mb-3 flex items-center justify-between text-[12px] text-ink-2">
          <span className="truncate">{file}</span>
          <span className="flex items-center gap-1">
            {[Minus, Plus, Download].map((Icon, i) => (
              <button key={i} type="button" aria-label={["Zoom out", "Zoom in", "Download"][i]} className="rounded-full p-1.5 hover:bg-muted hover:text-ink">
                <Icon className="size-3.5 stroke-[1.5]" />
              </button>
            ))}
          </span>
        </div>
      )}
      <article className="aspect-[8.5/11] w-full border border-line bg-canvas px-[7%] py-[8%] text-[10px] leading-[1.45] text-ink-1 shadow-card">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-2.5">
            <MerchantLogo name={bill.vendor} size={26} />
            <div>
              <div className="text-[12px] text-ink">{vendor?.legalName ?? bill.vendor}</div>
              <div className="max-w-[180px] text-ink-2">{vendor?.address ?? "1200 Industrial Blvd, Austin, TX 78745"}</div>
              <div className="text-ink-2">{vendor?.contactEmail ?? `billing@${bill.vendor.toLowerCase().replace(/[^a-z]+/g, "")}.com`}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[17px] tracking-[0.12em] text-ink">INVOICE</div>
            <div className="mt-1 text-ink-2">No. {bill.invoiceNumber}</div>
          </div>
        </header>

        <div className="mt-[8%] grid grid-cols-3 gap-4">
          <div>
            <div className="text-[9px] tracking-wide text-ink-3 uppercase">Bill to</div>
            <div className="mt-1 text-ink">{company.legalName}</div>
            <div className="text-ink-2">600 Congress Ave, Suite 1400</div>
            <div className="text-ink-2">Austin, TX 78701</div>
          </div>
          <div>
            <div className="text-[9px] tracking-wide text-ink-3 uppercase">Issued</div>
            <div className="mt-1">{formatDateLong(bill.issueDate)}</div>
            <div className="mt-2 text-[9px] tracking-wide text-ink-3 uppercase">Due</div>
            <div className="mt-1">{formatDateLong(bill.dueDate)}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] tracking-wide text-ink-3 uppercase">Amount due</div>
            <div className="mt-1 text-[16px] tracking-[-0.01em] text-ink tabular">{formatMoney(subtotal)}</div>
          </div>
        </div>

        <table className="mt-[8%] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-1 text-[9px] tracking-wide text-ink-3 uppercase">
              <th className="py-1.5 font-normal">Description</th>
              <th className="w-[12%] py-1.5 text-right font-normal">Qty</th>
              <th className="w-[18%] py-1.5 text-right font-normal">Rate</th>
              <th className="w-[20%] py-1.5 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {bill.lines.map((line, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-1.5 pr-3">{line.description}</td>
                <td className="py-1.5 text-right">{line.quantity.toLocaleString("en-US")}</td>
                <td className="py-1.5 text-right">{formatMoney(line.rate)}</td>
                <td className="py-1.5 text-right">{formatMoney(line.quantity * line.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 ml-auto w-[46%] tabular">
          <div className="flex justify-between py-0.5 text-ink-2">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between py-0.5 text-ink-2">
            <span>Tax</span>
            <span>{formatMoney(0)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-ink-1 pt-1.5 text-[11px] text-ink">
            <span>Total due (USD)</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
        </div>

        <footer className="mt-[10%] border-t border-line pt-2 text-ink-2">
          <div>Payment terms: {vendor?.paymentTerms ?? "Net 30"}{bill.memo ? ` · ${bill.memo}` : ""}</div>
          <div>Remit via {remittanceFor(bill)}. Please reference invoice {bill.invoiceNumber}.</div>
          <div className="mt-2 text-ink-3">Thank you for your business.</div>
        </footer>
      </article>
    </div>
  );
}
