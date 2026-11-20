import { requireFeaturePage } from "@/services/plan/server";
import AnalyticsContent from "./content";
import { resolveCanSelectSeller } from "./serverRole";

// Página client-heavy (gráficos ECharts via dynamic ssr:false) e escopada por
// auth — renderizada sob demanda, não prerenderizada estaticamente.
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireFeaturePage("ANALYTICS");

  // Papel resolvido no SERVIDOR, do mesmo cookie `userData` gravado no login.
  // Antes era lido num efeito pós-mount, e isso custava duas coisas: o seletor
  // de vendedor surgia na barra depois que a tela já estava desenhada
  // (empurrando o resto), e a consulta da lista de vendedores só saía no
  // terceiro tempo — montar, ler o cookie, re-renderizar, aí perguntar.
  const canSelectSeller = await resolveCanSelectSeller();

  return <AnalyticsContent canSelectSeller={canSelectSeller} />;
}
