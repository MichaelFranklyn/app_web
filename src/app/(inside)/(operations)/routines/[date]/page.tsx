import { requireFeaturePage } from "@/services/plan/server";
import DayRouteContent from "./content";

type Props = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ seller?: string }>;
};

const Page = async ({ params, searchParams }: Props) => {
  await requireFeaturePage("ROUTINES");
  const { date } = await params;
  const { seller } = await searchParams;
  return <DayRouteContent date={date} sellerId={seller ?? null} />;
};

export default Page;
