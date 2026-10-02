import { OrgUnits } from "@/components/company/org-units";

export const metadata = { title: "Locations" };

export default function LocationsPage() {
  return <OrgUnits kind="location" />;
}
