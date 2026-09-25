import { requireAdminPage } from "@/utils/auth/roleGuard";
import HygieneContent from "./content";

const Page = async () => {
  // Tirar cliente da carteira, trocar o CNPJ e reativar mudam o que a empresa
  // atende: é gestão. Vendedor volta para a lista de clientes.
  await requireAdminPage("/clients");
  return <HygieneContent />;
};

export default Page;
