import { InsightCards } from "@/components/insights/insight-cards";
import { SpendExplorer } from "@/components/insights/spend-explorer";

export const metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-[165px] items-end border-b border-line px-page pb-[38px]">
        <h1 className="text-[64px] leading-none font-normal tracking-[-0.03em] text-ink">Insights</h1>
      </header>
      <InsightCards />
      <SpendExplorer />
    </div>
  );
}
