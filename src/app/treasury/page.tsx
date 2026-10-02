import { TreasuryOverview } from "@/components/treasury/treasury-overview";
import { TreasuryRail } from "@/components/treasury/treasury-rail";

export default function TreasuryOverviewPage() {
  return (
    <div className="flex flex-1">
      <TreasuryOverview />
      <TreasuryRail />
    </div>
  );
}
