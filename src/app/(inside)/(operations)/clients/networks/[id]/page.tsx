import { requireAdminPage } from "@/utils/auth/roleGuard";
import NetworkDetailContent from "./content";

interface Props {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: Props) => {
  // Mesma régua da lista de redes: classificação da carteira é gestão.
  await requireAdminPage("/clients");
  const { id } = await params;

  return <NetworkDetailContent networkId={id} />;
};

export default Page;
