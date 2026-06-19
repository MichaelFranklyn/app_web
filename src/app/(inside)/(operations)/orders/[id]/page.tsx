import OrderDetailContent from "./content";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <OrderDetailContent id={id} />;
};

export default Page;
