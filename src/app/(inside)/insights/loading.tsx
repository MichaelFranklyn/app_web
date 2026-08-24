import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

import { InsightsSkeleton } from "./_components/InsightsSkeleton";

/**
 * Espelha `content.tsx`: cabeçalho + a faixa de números + as fileiras de
 * cartões.
 *
 * A página faz a leitura inteira no servidor antes de renderizar; sem este
 * limite de Suspense o navegador não receberia nada enquanto isso acontece.
 */
export default function InsightsLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-24 w-[160px]" />
        <Loading.Skeleton className="h-14 w-[480px]" />
      </div>

      <InsightsSkeleton />
    </PageContent>
  );
}
