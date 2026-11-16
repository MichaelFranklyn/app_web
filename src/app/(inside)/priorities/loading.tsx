import { Loading } from "@/components/Loading";

import { PendingSkeleton } from "./skeleton";

/**
 * Espelha `content.tsx`: a frase da aba + contadores + cartões. Cabeçalho e
 * abas são do `layout.tsx` e ficam na tela durante a espera.
 *
 * A página lê o resumo no servidor antes de renderizar; sem
 * este limite de Suspense o navegador não receberia nada enquanto isso acontece.
 */
export default function PendingLoading() {
  return (
    <div className="flex flex-col gap-20">
      <Loading.Skeleton className="h-14 w-[480px] max-w-full" />
      <PendingSkeleton />
    </div>
  );
}
