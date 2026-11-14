import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

/**
 * A `page.tsx` busca no servidor antes de renderizar; sem este limite a rota
 * ficaria em branco durante o SSR das duas agregações, que varrem a base
 * inteira e não são rápidas.
 */
export default function LoadingPlatformHome() {
  return (
    <PageContent>
      {/* Título, ícone e descrição são fixos: aparecem de verdade, como no
          content.tsx — antes eram três barras sem o ícone (14/11/2026). */}
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.platformOverview}>
              Visão geral
            </PanelHeader.Heading>
            <PanelHeader.Description>
              Números de toda a plataforma nos últimos 30 dias.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

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
