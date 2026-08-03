import { requireAdminPage } from "@/utils/auth/roleGuard";
import NetworksContent from "./content";

const Page = async () => {
  // Rede é classificação da carteira — mesma régua dos catálogos: gestão.
  await requireAdminPage("/clients");

  return <NetworksContent />;
};

export default Page;
