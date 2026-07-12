import { UserData } from "@/app/(auth)/login/interface";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import DashboardContent from "./content";

// Papéis que enxergam os dados de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

const Page = async () => {
  // Papel resolvido no servidor, a partir do mesmo cookie `userData` gravado no
  // login: evita o salto de hidratação (mount → ler cookie → setState → 1ª
  // query) na tela mais usada, sem depender de o JWT carregar o claim `role`.
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");

  return <DashboardContent canSelectSeller={canSelectSeller} />;
};

export default Page;
