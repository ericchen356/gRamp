import { CardsHeader } from "@/components/cards/cards-header";

export default function CardsListLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CardsHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
