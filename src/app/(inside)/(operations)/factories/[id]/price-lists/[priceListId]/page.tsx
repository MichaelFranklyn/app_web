import PriceListDetailContent from "./content";

interface Props {
  params: Promise<{ id: string; priceListId: string }>;
}

const Page = async ({ params }: Props) => {
  const { priceListId } = await params;
  return <PriceListDetailContent priceListId={priceListId} />;
};

export default Page;
