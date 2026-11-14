import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

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
      {/* O título é fixo: aparece de verdade, com o ícone do módulo, e a
          troca pelo header real não desloca nada (14/11/2026). */}
      <div className="flex flex-col gap-8">
        <PanelHeader.Heading {...PAGE_HEADING.dashboard}>
          Dashboard
        </PanelHeader.Heading>
        <Loading.Skeleton className="h-14 w-[280px] max-w-full" />
        <Loading.Skeleton className="mt-6 h-32 w-[220px]" />
      </div>

      <DashboardSkeleton />
    </PageContent>
  );
}
