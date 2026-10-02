import type { Metadata } from "next";
import { ProgramDetail } from "@/components/spend-programs/program-detail";
import { spendPrograms } from "@/data/spend-programs";

export async function generateMetadata({ params }: PageProps<"/spend-programs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const program = spendPrograms.find((p) => p.id === id);
  return { title: program ? `${program.name} · Spend programs` : "Spend program" };
}

export default async function SpendProgramPage({ params }: PageProps<"/spend-programs/[id]">) {
  const { id } = await params;
  return <ProgramDetail id={id} />;
}
