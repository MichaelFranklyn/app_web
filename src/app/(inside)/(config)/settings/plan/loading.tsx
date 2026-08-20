import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

/**
 * Espelha `content.tsx`: cabeçalho + os dois cards (limites e recursos).
 *
 * A página resolve o papel e busca o plano no servidor antes de renderizar. Sem
 * este limite de Suspense o navegador não recebe nada enquanto isso não termina.
 */
export default function PlanLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-[24px] w-56" />
        <Loading.Skeleton className="h-[14px] w-[420px]" />
        <Loading.Skeleton className="mt-6 h-[20px] w-24 rounded-(--r-xs)" />
      </div>

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <Loading.Skeleton className="h-[320px] w-full" />
        </Grid.Item>
        <Grid.Item>
          <Loading.Skeleton className="h-[320px] w-full" />
        </Grid.Item>
      </Grid.Root>
    </PageContent>
  );
}
