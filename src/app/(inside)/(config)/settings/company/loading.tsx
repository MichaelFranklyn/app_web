import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

/**
 * Espelha `content.tsx`: cabeçalho + quatro cards de assunto.
 *
 * A página resolve o papel e busca a ficha da empresa no servidor antes de
 * renderizar. Sem este limite de Suspense o navegador não recebe nada enquanto
 * isso não termina — em produção, com o Cloud Run dormindo, são segundos de
 * tela vazia.
 */
export default function CompanyLoading() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Loading.Skeleton className="h-[24px] w-64" />
        <Loading.Skeleton className="h-[14px] w-96" />
      </div>

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid.Item key={i}>
            <Loading.Skeleton className="h-[220px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>
    </PageContent>
  );
}
