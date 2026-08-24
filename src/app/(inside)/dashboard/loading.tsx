import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

import { DashboardSkeleton } from "./_components/DashboardSkeleton";

/**
 * Espelha `content.tsx`: cabeçalho + os quatro cartões + os dois painéis.
 *
 * A página agora busca vendedores, pedidos, clientes e visitas no servidor
 * antes de renderizar. Sem este limite de Suspense o navegador não receberia
 * nada enquanto isso acontece — a tela ficaria em branco justamente pelo tempo
 * que o SSR economiza depois.
 */
export default function DashboardLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-24 w-40" />
        <Loading.Skeleton className="h-14 w-[280px]" />
        <Loading.Skeleton className="mt-6 h-32 w-[220px] rounded-(--r-sm)" />
      </div>

      <DashboardSkeleton />
    </PageContent>
  );
}
