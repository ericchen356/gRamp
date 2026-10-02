import { MyRampView } from "@/components/my-ramp/my-ramp-view";

export const metadata = { title: "My Ramp" };

export default async function MyRampPage({ searchParams }: PageProps<"/my-ramp">) {
  const { new: create } = await searchParams;
  return <MyRampView openNewReimbursement={create === "reimbursement"} />;
}
