import { UserData } from "@/app/(auth)/login/interface";
import { getServerCookie } from "@/utils/cookies/serverCookie";

// Papéis que enxergam dados de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

/**
 * Papel resolvido no SERVIDOR, do mesmo cookie `userData` gravado no login.
 * Página e `loading.tsx` leem daqui: o skeleton mostra os mesmos títulos (na
 * primeira pessoa para o vendedor) que a página vai mostrar.
 */
export async function resolveCanSelectSeller(): Promise<boolean> {
  const userData = await getServerCookie<UserData>("userData");
  return MANAGER_ROLES.includes(userData?.role ?? "");
}
