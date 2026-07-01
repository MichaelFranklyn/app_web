import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";

const SCORE_BARS = 5;
const SUGGESTED_ROWS = 3;
const HISTORY_ROWS = 4;

/** Placeholder de uma barra de progresso (label + valor + barra). */
function ProgressBarSkeleton() {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center justify-between">
        <Loading.Skeleton className="h-[10px] w-20" />
        <Loading.Skeleton className="h-[10px] w-8" />
      </div>
      <Loading.Skeleton className="h-[6px] w-full rounded-full" />
    </div>
  );
}

/** Placeholder de uma linha de lista (nome + sub + badge). */
function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-[8px]">
      <div className="flex flex-col gap-[4px]">
        <Loading.Skeleton className="h-[11px] w-32" />
        <Loading.Skeleton className="h-[9px] w-24" />
      </div>
      <Loading.Skeleton className="h-[18px] w-14 rounded-full" />
    </div>
  );
}

/**
 * Placeholder da aba "Score" do cliente: coluna principal (decomposição
 * do score + produtos sugeridos) + coluna lateral (histórico).
 */
export function ScoreSkeleton() {
  return (
    <>
      <div className="desktop:flex-row desktop:items-start flex flex-col gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-16">
          <Card.Root>
            <Card.Header>
              <Loading.Skeleton className="h-[14px] w-56" />
            </Card.Header>
            <Card.Body>
              <div className="flex flex-col gap-6">
                {Array.from({ length: SCORE_BARS }).map((_, i) => (
                  <ProgressBarSkeleton key={i} />
                ))}
              </div>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Loading.Skeleton className="h-[14px] w-48" />
            </Card.Header>
            <Card.Body padding="compact">
              {Array.from({ length: SUGGESTED_ROWS }).map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </Card.Body>
          </Card.Root>
        </div>

        <div className="flex w-65 shrink-0 flex-col gap-12">
          <Card.Root>
            <Card.Header>
              <Loading.Skeleton className="h-[14px] w-36" />
            </Card.Header>
            <Card.Body padding="compact">
              {Array.from({ length: HISTORY_ROWS }).map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </Card.Body>
          </Card.Root>
        </div>
      </div>
    </>
  );
}
