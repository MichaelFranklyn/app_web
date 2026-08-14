import { UserData } from "@/app/(auth)/login/interface";
import { requireFeaturePage } from "@/services/plan/server";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import CommissionsContent from "./content";

// Papéis que enxergam as comissões de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export default async function Page() {
  await requireFeaturePage("COMMISSIONS");
  // Papel resolvido no servidor (mesmo cookie `userData` do login): evita o salto
  // de hidratação e libera o seletor de vendedor só para gestor.
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");

  return (
    <CommissionsContent
      canSelectSeller={canSelectSeller}
      ownSellerId={userData?.sellerId ?? null}
    />
  );
}
