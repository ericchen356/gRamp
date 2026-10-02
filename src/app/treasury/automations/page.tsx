import { AutomationsView } from "@/components/treasury/automations-view";

export const metadata = { title: "Automations" };

export default async function TreasuryAutomationsPage({ searchParams }: PageProps<"/treasury/automations">) {
  const { new: openNew } = await searchParams;
  return <AutomationsView openNew={openNew === "1"} />;
}
