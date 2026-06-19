import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";

const KPI_COUNT = 4;
const STOP_ROWS = 5;

/**
 * Placeholder da rota do dia: cabeçalho + KPIs do resumo + mapa e o
 * card de sequência de paradas.
 */
export function VisitsSkeleton() {
  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>
              <Loading.Skeleton className="h-[10px] w-24" />
            </PanelHeader.Eyebrow>
            <Loading.Skeleton className="h-[20px] w-40" />
            <Loading.Skeleton className="mt-[6px] h-[12px] w-64" />
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 2, desktop: 4 }} gap={12}>
        {Array.from({ length: KPI_COUNT }).map((_, i) => (
          <Card.Kpi key={i}>
            <Loading.Skeleton className="h-[10px] w-24" />
            <Loading.Skeleton className="h-[24px] w-16" />
            <Loading.Skeleton className="h-[11px] w-20" />
          </Card.Kpi>
        ))}
      </Grid.Root>

      <div className="flex gap-20">
        <div className="min-w-0 flex-1">
          <Loading.Skeleton className="h-[360px] w-full rounded-(--r-xl)" />
        </div>
        <div className="flex w-[320px] shrink-0 flex-col gap-12">
          <Card.Root>
            <Card.Header>
              <Loading.Skeleton className="h-[14px] w-40" />
            </Card.Header>
            <Card.Body padding="compact">
              {Array.from({ length: STOP_ROWS }).map((_, i) => (
                <div key={i} className="flex items-center gap-10 py-10">
                  <Loading.Skeleton className="h-[22px] w-[22px] rounded-full" />
                  <div className="flex flex-1 flex-col gap-[4px]">
                    <Loading.Skeleton className="h-[11px] w-32" />
                    <Loading.Skeleton className="h-[9px] w-24" />
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card.Root>
        </div>
      </div>
    </PageContent>
  );
}
