import { InboxView } from "@/components/inbox/inbox-view";
import { tabAliases } from "@/data/inbox";

export const metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: PageProps<"/inbox">) {
  const { tab } = await searchParams;
  const initialTab = (typeof tab === "string" && tabAliases[tab]) || "all";
  return <InboxView key={initialTab} initialTab={initialTab} />;
}
