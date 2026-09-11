import { AnalyticsSkeleton } from "./_components/AnalyticsSkeleton";

/**
 * Limite de Suspense da rota. A página espera o guard de plano
 * (`requireFeaturePage`) antes de devolver qualquer HTML; sem este arquivo o
 * navegador não recebe nada nesse intervalo e a área de conteúdo fica em
 * branco — era a única das telas de dentro com este peso que não tinha um.
 */
export default function AnalyticsLoading() {
  return <AnalyticsSkeleton />;
}
