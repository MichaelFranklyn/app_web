import { AnalyticsSkeleton } from "./_components/AnalyticsSkeleton";
import { resolveCanSelectSeller } from "./serverRole";

/**
 * Limite de Suspense da rota. A página espera o guard de plano
 * (`requireFeaturePage`) antes de devolver qualquer HTML; sem este arquivo o
 * navegador não recebe nada nesse intervalo e a área de conteúdo fica em
 * branco — era a única das telas de dentro com este peso que não tinha um.
 */
export default async function AnalyticsLoading() {
  const canSelectSeller = await resolveCanSelectSeller();
  return <AnalyticsSkeleton canSelectSeller={canSelectSeller} />;
}
