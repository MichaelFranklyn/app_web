import { requireOwnerPage } from "@/utils/auth/roleGuard";
import CompanyContent from "./content";

const Page = async () => {
  // Cadastro da própria empresa é do dono da conta (updateCompany é @is_owner
  // no backend) — quem não for owner volta ao próprio perfil.
  await requireOwnerPage("/profile");

  return <CompanyContent />;
};

export default Page;
