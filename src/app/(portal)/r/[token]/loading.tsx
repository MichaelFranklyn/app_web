import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PublicPage } from "@/components/PublicPage";

/**
 * Esqueleto da folha de resposta.
 *
 * O `portalFetch`/`visitResponseFetch` roda no servidor e a página só é
 * enviada quando o backend responde. Sem este limite de Suspense, o vendedor
 * abre o link no celular e olha uma tela BRANCA enquanto o Cloud Run acorda —
 * e um link que parece não carregar é um link que ninguém responde duas vezes.
 */
export default function VisitResponseLoading() {
  return (
    <PublicPage.Root>
      <PublicPage.Header className="gap-[6px]">
        <Loading.Skeleton className="h-[20px] w-[180px]" />
        <Loading.Skeleton className="h-[14px] w-[220px]" />
      </PublicPage.Header>
      <PublicPage.Main>
        <Grid.Root cols={{ base: 1, tablet: 2, desktop: 3 }} gap={12}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Loading.Skeleton key={index} className="h-[240px] w-full" />
          ))}
        </Grid.Root>
      </PublicPage.Main>
    </PublicPage.Root>
  );
}
