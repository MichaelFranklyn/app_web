import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { PORTAL_HOME_TITLE } from "./utils";

/**
 * Espelha `content.tsx`: o cabeçalho, os números e o gráfico — um esqueleto
 * de proporção diferente faria a página inteira se reorganizar quando os dados
 * chegam.
 */
export default function PortalSummaryLoading() {
  return (
    <>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.orders}>
              {PORTAL_HOME_TITLE}
            </PanelHeader.Heading>
            <Loading.Skeleton text="body" className="w-[280px] max-w-full" />
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 2, tablet: 3 }} gap={20}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid.Item key={index}>
            <Loading.Skeleton className="h-[96px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>
      <Loading.Skeleton className="h-[220px] w-full" />
      <Loading.Skeleton className="h-[160px] w-full" />
    </>
  );
}
