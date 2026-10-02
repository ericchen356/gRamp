import { CardsProvider } from "@/components/cards/cards-store";

export default function CardsRootLayout({ children }: LayoutProps<"/cards">) {
  return <CardsProvider>{children}</CardsProvider>;
}
