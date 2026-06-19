import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

const CARD_COUNT = 6;
const STAT_ROWS = 4;

/** Placeholder de um card de fábrica (nome/CNPJ + stats + botão). */
function FactoryCardSkeleton() {
  return (
    <Grid.Item>
      <Card.Root className="h-full">
        <Card.Body>
          <div className="mb-12 flex items-start justify-between">
            <div className="flex flex-col gap-[6px]">
              <div className="flex min-h-[36px] items-start">
                <Loading.Skeleton className="h-[14px] w-32" />
              </div>
              <Loading.Skeleton className="h-[10px] w-28" />
              <Loading.Skeleton className="h-[10px] w-20" />
            </div>
            <Loading.Skeleton className="h-[20px] w-14 rounded-(--r-xs)" />
          </div>

          <div className="flex flex-col gap-[12px]">
            {Array.from({ length: STAT_ROWS }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Loading.Skeleton className="h-[10px] w-24" />
                <Loading.Skeleton className="h-[10px] w-16" />
              </div>
            ))}
          </div>

          <Loading.Skeleton className="mt-12 h-[32px] w-full" />
        </Card.Body>
      </Card.Root>
    </Grid.Item>
  );
}

/** Placeholder do grid de fábricas vinculadas. */
export function FactoriesGridSkeleton() {
  return (
    <Grid.Root cols={{ base: 1, tablet: 2, desktop: 3 }} gap={12}>
      {Array.from({ length: CARD_COUNT }).map((_, i) => (
        <FactoryCardSkeleton key={i} />
      ))}
    </Grid.Root>
  );
}
