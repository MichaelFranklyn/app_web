import { Loading } from "@/components/Loading";

import { OpportunitiesSkeleton } from "./_components/OpportunitiesSkeleton";

/**
 * Espelha `content.tsx`: a frase da aba + a fileira de cartões. Cabeçalho e
 * abas são do `layout.tsx` da central e ficam na tela durante a espera.
 *
 * A página faz a leitura no servidor antes de renderizar; sem este limite de
 * Suspense o navegador não receberia nada enquanto isso acontece.
 */
export default function OpportunitiesLoading() {
  return (
    <div className="flex flex-col gap-20">
      <Loading.Skeleton className="h-14 w-[480px] max-w-full" />
      <OpportunitiesSkeleton />
    </div>
  );
}
