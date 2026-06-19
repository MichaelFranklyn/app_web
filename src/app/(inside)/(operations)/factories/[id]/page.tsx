import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function FactoryPage({ params }: Props) {
  const { id } = await params;
  redirect(`/factories/${id}/overview`);
}
