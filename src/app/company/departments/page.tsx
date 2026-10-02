import { OrgUnits } from "@/components/company/org-units";

export const metadata = { title: "Departments" };

export default function DepartmentsPage() {
  return <OrgUnits kind="department" />;
}
