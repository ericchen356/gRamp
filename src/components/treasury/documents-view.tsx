"use client";

import { ChevronDown, Download, FileText, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { MenuItem, Popover } from "@/components/ui/popover";
import { EmptyState, Table, TableFooter, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { SearchField, Toolbar, ToolbarRow } from "@/components/ui/toolbar";
import { treasuryDocuments, type TreasuryDocument, type TreasuryDocumentType } from "@/data/treasury";
import { formatDateLong, pluralize } from "@/lib/format";

const years = [...new Set(treasuryDocuments.map((doc) => doc.year))].sort((a, b) => b - a);
const types: (TreasuryDocumentType | "all")[] = ["all", "Monthly statement", "Interest summary", "1099-INT", "Trade confirmation"];
const accounts = ["all", ...new Set(treasuryDocuments.map((doc) => doc.account))];

const typeTones: Record<TreasuryDocumentType, "neutral" | "warning" | "outline"> = {
  "Monthly statement": "neutral",
  "Interest summary": "outline",
  "1099-INT": "warning",
  "Trade confirmation": "outline",
};

/** Pill dropdown used for the toolbar filters. */
function FilterMenu<T extends string | number>({
  value,
  options,
  onChange,
  format,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  format: (value: T) => string;
}) {
  return (
    <Popover
      align="end"
      trigger={({ toggle, open }) => (
        <Button pill size="sm" onClick={toggle} aria-expanded={open} className="h-8 gap-1 pr-2.5 pl-3 text-[12px]">
          {format(value)}
          <ChevronDown className="size-3.5 stroke-[1.5]" />
        </Button>
      )}
    >
      {(close) =>
        options.map((option) => (
          <MenuItem
            key={String(option)}
            selected={option === value}
            onSelect={() => {
              onChange(option);
              close();
            }}
          >
            {format(option)}
          </MenuItem>
        ))
      }
    </Popover>
  );
}

/** Cash & Treasury › Documents: statements, interest summaries and tax forms. */
export function DocumentsView() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(years[0]);
  const [type, setType] = useState<TreasuryDocumentType | "all">("all");
  const [account, setAccount] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return treasuryDocuments.filter(
      (doc) =>
        doc.year === year &&
        (type === "all" || doc.type === type) &&
        (account === "all" || doc.account === account) &&
        (!q || `${doc.title} ${doc.account} ${doc.type}`.toLowerCase().includes(q)),
    );
  }, [query, year, type, account]);

  const download = (doc: TreasuryDocument) => toast.show(`Downloading ${doc.title} · ${doc.account}`, "neutral");

  return (
    <>
      <Toolbar className="border-t-0">
        <ToolbarRow>
          <SearchField value={query} onChange={setQuery} placeholder="Search documents..." />
          <div className="ml-auto flex items-center gap-2">
            <FilterMenu value={year} options={years} onChange={setYear} format={(value) => `${value}`} />
            <FilterMenu value={type} options={types} onChange={setType} format={(value) => (value === "all" ? "All types" : value)} />
            <FilterMenu value={account} options={accounts} onChange={setAccount} format={(value) => (value === "all" ? "All accounts" : value)} />
            <Button
              size="sm"
              className="ml-1 h-8"
              disabled={rows.length === 0}
              onClick={() => toast.show(`${pluralize(rows.length, "document")} from ${year} zipped for download`, "neutral")}
            >
              <Download className="size-3.5 stroke-[1.5]" />
              Download all
            </Button>
          </div>
        </ToolbarRow>
      </Toolbar>

      <Table className="border-t border-line" minWidth={1040}>
        <THead>
          <tr>
            <Th className="w-[30%]">Document</Th>
            <Th className="w-[12%]">Period</Th>
            <Th className="w-[18%]">Account</Th>
            <Th>Type</Th>
            <Th className="w-[13%]">Issued</Th>
            <Th className="w-[104px]" align="right">
              Download
            </Th>
          </tr>
        </THead>
        <TBody>
          {rows.map((doc) => (
            <Tr key={doc.id} onClick={() => download(doc)}>
              <Td className="h-[52px]">
                <span className="flex items-center gap-3">
                  <FileText className="size-4 shrink-0 stroke-[1.5] text-ink-2" />
                  <span className="truncate text-[14px] text-ink">{doc.title}</span>
                  <span className="shrink-0 text-[12px] text-ink-3">PDF · {doc.size}</span>
                </span>
              </Td>
              <Td>{doc.period}</Td>
              <Td>{doc.account}</Td>
              <Td>
                <Tag tone={typeTones[doc.type]}>{doc.type}</Tag>
              </Td>
              <Td className="text-ink-2">{formatDateLong(doc.issued)}</Td>
              <Td align="right" onClick={(event) => event.stopPropagation()}>
                <IconButton size="sm" label={`Download ${doc.title}`} onClick={() => download(doc)} className="[&_svg]:size-3.5">
                  <Download />
                </IconButton>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      {rows.length === 0 && (
        <EmptyState icon={<FolderOpen />} title="No documents" description="Nothing matches these filters for the selected year." />
      )}

      <div className="flex-1" />
      <TableFooter
        right={
          <span>
            {rows.length > 0 ? `1–${rows.length} of ${rows.length}` : "0"} documents · {year}
          </span>
        }
      />
    </>
  );
}
