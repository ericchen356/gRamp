import { Tag } from "@/components/ui/badge";
import type { ContractStatus } from "@/data/vendors";

const labels: Record<ContractStatus, string> = {
  active: "Active",
  renewing: "Renewing soon",
  negotiating: "In negotiation",
  expired: "Expired",
  none: "No contract",
};

const tones = {
  active: "success",
  renewing: "warning",
  negotiating: "info",
  expired: "danger",
  none: "outline",
} as const;

export function contractLabel(status: ContractStatus) {
  return labels[status];
}

/** Contract state pill used in vendor tables and the vendor detail card. */
export function ContractTag({ status }: { status: ContractStatus }) {
  return <Tag tone={tones[status]}>{labels[status]}</Tag>;
}
