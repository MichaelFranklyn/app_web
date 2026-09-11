import { UserData } from "@/app/(auth)/login/interface";
import { requireFeaturePage } from "@/services/plan/server";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import AnalyticsContent from "./content";

// Página client-heavy (gráficos ECharts via dynamic ssr:false) e escopada por
// auth — renderizada sob demanda, não prerenderizada estaticamente.
export const dynamic = "force-dynamic";

// Papéis que enxergam dados de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export default async function AnalyticsPage() {
  await requireFeaturePage("ANALYTICS");

  // Papel resolvido no SERVIDOR, do mesmo cookie `userData` gravado no login.
  // Antes era lido num efeito pós-mount, e isso custava duas coisas: o seletor
  // de vendedor surgia na barra depois que a tela já estava desenhada
  // (empurrando o resto), e a consulta da lista de vendedores só saía no
  // terceiro tempo — montar, ler o cookie, re-renderizar, aí perguntar.
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");

  return <AnalyticsContent canSelectSeller={canSelectSeller} />;
}
