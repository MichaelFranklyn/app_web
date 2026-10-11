import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

import { PendingSkeleton } from "./skeleton";

/**
 * Espelha `content.tsx`: cabeçalho + contadores + lista.
 *
 * A página lê a primeira página da lista no servidor antes de renderizar; sem
 * este limite de Suspense o navegador não receberia nada enquanto isso acontece.
 */
export default function PendingLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-24 w-[220px]" />
        <Loading.Skeleton className="h-14 w-[480px] max-w-full" />
      </div>

      <PendingSkeleton />
    </PageContent>
  );
}
