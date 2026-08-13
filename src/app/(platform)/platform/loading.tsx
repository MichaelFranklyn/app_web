import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

/**
 * A `page.tsx` busca no servidor antes de renderizar; sem este limite a rota
 * ficaria em branco durante o SSR das duas agregações, que varrem a base
 * inteira e não são rápidas.
 */
export default function LoadingPlatformHome() {
  return (
    <PageContent>
      <div className="flex flex-col gap-[6px]">
        <Loading.Skeleton className="h-[12px] w-[80px]" />
        <Loading.Skeleton className="h-[26px] w-[220px]" />
        <Loading.Skeleton className="h-[14px] w-[340px]" />
      </div>

      {/* A ordem espelha a da página: fila de atenção, KPIs, operação,
          crescimento, saúde da carteira e adoção. Um esqueleto com outra
          forma faria o conteúdo "pular" ao chegar. */}
      <Loading.Skeleton className="h-[88px] w-full" />

      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid.Item key={i}>
            <Loading.Skeleton className="h-[104px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>

      <Loading.Skeleton className="h-[160px] w-full" />
      <Loading.Skeleton className="h-[380px] w-full" />
      <Loading.Skeleton className="h-[240px] w-full" />
      <Loading.Skeleton className="h-[280px] w-full" />
    </PageContent>
  );
}
