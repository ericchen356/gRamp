import type { Metadata } from "next";
import { CardDetail } from "@/components/cards/card-detail";
import { cards } from "@/data/cards";

export async function generateMetadata({ params }: PageProps<"/cards/[id]">): Promise<Metadata> {
  const { id } = await params;
  const card = cards.find((c) => c.id === id);
  return { title: card ? `${card.name} ···· ${card.last4}` : "Card" };
}

export default async function CardDetailPage({ params }: PageProps<"/cards/[id]">) {
  const { id } = await params;
  return <CardDetail id={id} />;
}
