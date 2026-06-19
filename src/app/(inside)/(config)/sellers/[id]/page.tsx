import SellerDetailContent from "./content";

export default async function SellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SellerDetailContent sellerId={id} />;
}
