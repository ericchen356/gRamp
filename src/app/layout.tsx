import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

// Ramp ships TWK Lausanne (commercial). Inter Tight is the closest open
// neo-grotesk in metrics and texture, exposed as --font-lausanne.
const lausanne = Inter_Tight({
  variable: "--font-lausanne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Ramp", template: "%s | Ramp" },
  description: "Spend management, corporate cards, bill pay and treasury.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lausanne.variable} h-full`}>
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
