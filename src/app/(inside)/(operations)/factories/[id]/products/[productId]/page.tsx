import ProductDetailContent from "./content";

interface Props {
  params: Promise<{ id: string; productId: string }>;
}

const Page = async ({ params }: Props) => {
  const { productId } = await params;
  return <ProductDetailContent id={productId} />;
};

export default Page;
