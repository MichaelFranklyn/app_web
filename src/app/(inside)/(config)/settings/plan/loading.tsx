import { PlanSkeleton } from "./_components/PlanSkeleton";

/**
 * A página resolve o papel e busca o plano no servidor antes de renderizar. Sem
 * este limite de Suspense o navegador não recebe nada enquanto isso não termina.
 */
export default function PlanLoading() {
  return <PlanSkeleton />;
}
