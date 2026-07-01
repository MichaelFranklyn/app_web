import DayRouteContent from "./content";

type Props = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ seller?: string }>;
};

const Page = async ({ params, searchParams }: Props) => {
  const { date } = await params;
  const { seller } = await searchParams;
  return <DayRouteContent date={date} sellerId={seller ?? null} />;
};

export default Page;
