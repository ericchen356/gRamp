import { HomeAside } from "@/components/home/home-aside";
import { HomeHeader } from "@/components/home/home-header";
import { HomeOverview } from "@/components/home/home-overview";
import { QuickActions } from "@/components/home/quick-actions";

export const metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader />
      <div className="pt-8 pb-10">
        <QuickActions />
      </div>
      <div className="flex flex-1 border-t border-line">
        <HomeOverview />
        <HomeAside />
      </div>
    </div>
  );
}
