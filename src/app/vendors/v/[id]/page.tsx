import { notFound } from "next/navigation";
import { VendorDetail } from "@/components/vendors/vendor-detail";
import { getVendor, vendors } from "@/data/vendors";

export function generateStaticParams() {
  return vendors.map((vendor) => ({ id: vendor.id }));
}

export async function generateMetadata({ params }: PageProps<"/vendors/v/[id]">) {
  const { id } = await params;
  return { title: `${getVendor(id)?.name ?? "Vendor"} · Vendors` };
}

export default async function VendorDetailPage({ params }: PageProps<"/vendors/v/[id]">) {
  const { id } = await params;
  const vendor = getVendor(id);
  if (!vendor) notFound();
  return <VendorDetail vendor={vendor} />;
}
