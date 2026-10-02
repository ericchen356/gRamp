import { ProgramsProvider } from "@/components/spend-programs/programs-store";

export default function SpendProgramsLayout({ children }: LayoutProps<"/spend-programs">) {
  return <ProgramsProvider>{children}</ProgramsProvider>;
}
