import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

/**
 * Espelha `content.tsx`: cabeçalho + a faixa do plano + os quatro tetos + a
 * grade de recursos.
 *
 * A página resolve o papel e busca o plano no servidor antes de renderizar. Sem
 * este limite de Suspense o navegador não recebe nada enquanto isso não termina.
 */
export default function PlanLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <Loading.Skeleton className="h-24 w-[200px]" />
          <Loading.Skeleton className="h-14 w-[420px]" />
        </div>
        <Loading.Skeleton className="h-[58px] w-full rounded-(--r-md)" />
      </div>

      <div className="flex flex-col gap-12">
        <Loading.Skeleton className="h-16 w-24" />
        <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid.Item key={i}>
              <Loading.Skeleton className="h-[124px] w-full" />
            </Grid.Item>
          ))}
        </Grid.Root>
      </div>

      <div className="flex flex-col gap-12">
        <Loading.Skeleton className="h-16 w-28" />
        <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 3 }} gap={12}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid.Item key={i}>
              <Loading.Skeleton className="h-[92px] w-full" />
            </Grid.Item>
          ))}
        </Grid.Root>
      </div>
    </PageContent>
  );
}
