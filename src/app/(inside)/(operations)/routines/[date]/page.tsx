import DayRouteContent from "./content";

type Props = {
  params: Promise<{ date: string }>;
};

const Page = async ({ params }: Props) => {
  const { date } = await params;
  return <DayRouteContent date={date} />;
};

export default Page;
