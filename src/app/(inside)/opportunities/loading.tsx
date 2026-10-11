import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

import { OpportunitiesSkeleton } from "./_components/OpportunitiesSkeleton";

/**
 * Espelha `content.tsx`: cabeçalho + a fileira de cartões.
 *
 * A página faz a leitura no servidor antes de renderizar; sem este limite de
 * Suspense o navegador não receberia nada enquanto isso acontece.
 */
export default function OpportunitiesLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-24 w-[160px]" />
        <Loading.Skeleton className="h-14 w-[480px]" />
      </div>

      <OpportunitiesSkeleton />
    </PageContent>
  );
}
