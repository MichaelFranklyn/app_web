import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

const KPI_COUNT = 4;
const DAY_COUNT = 5;
const ITEMS_PER_DAY = 3;

/** Placeholder de um card de KPI do resumo (label + valor + delta). */
function KpiCardSkeleton() {
  return (
    <Card.Kpi>
      <Loading.Skeleton className="h-[10px] w-28" />
      <Loading.Skeleton className="h-[24px] w-16" />
      <Loading.Skeleton className="h-[11px] w-32" />
    </Card.Kpi>
  );
}

/** Placeholder de um item de visita dentro da coluna do dia. */
function VisitItemSkeleton() {
  return (
    <div className="rounded-(--r-md) border border-(--border) bg-(--bg3) p-[10px]">
      <Loading.Skeleton className="mb-[6px] h-[11px] w-3/4" />
      <Loading.Skeleton className="mb-[8px] h-[9px] w-1/2" />
      <div className="flex items-center justify-between">
        <Loading.Skeleton className="h-[10px] w-12" />
        <Loading.Skeleton className="h-[18px] w-14 rounded-full" />
      </div>
    </div>
  );
}

/** Placeholder de uma coluna de dia da grade semanal. */
function DayColumnSkeleton() {
  return (
    <div className="min-w-0 flex-1">
      <Card.Root className="h-full">
        <Card.Header bg="bg3">
          <div className="flex flex-col gap-[4px]">
            <Loading.Skeleton className="h-[13px] w-16" />
            <Loading.Skeleton className="h-[9px] w-20" />
          </div>
          <Loading.Skeleton className="h-[18px] w-6 rounded-full" />
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col gap-6">
            {Array.from({ length: ITEMS_PER_DAY }).map((_, i) => (
              <VisitItemSkeleton key={i} />
            ))}
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
}

export function RoutinesSkeleton() {
  return (
    <>
      <Grid.Root cols={{ base: 2, desktop: 4 }} gap={12}>
        {Array.from({ length: KPI_COUNT }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Grid.Root>

      <div className="flex gap-10">
        {Array.from({ length: DAY_COUNT }).map((_, i) => (
          <DayColumnSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
