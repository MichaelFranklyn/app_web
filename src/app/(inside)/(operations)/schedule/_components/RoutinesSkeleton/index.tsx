"use client";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
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
    <Card.Root inset tone="muted">
      <Card.Body padding="sm">
        <Loading.Skeleton className="mb-[6px] h-[11px] w-3/4" />
        <Loading.Skeleton className="mb-[8px] h-[9px] w-1/2" />
        <div className="flex items-center justify-between">
          <Loading.Skeleton className="h-[10px] w-12" />
          <Loading.Skeleton shape="pill" className="h-[18px] w-14" />
        </div>
      </Card.Body>
    </Card.Root>
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
          <Loading.Skeleton shape="pill" className="h-[18px] w-6" />
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

/** Visitas por dia no celular: dias vazios e cheios, como numa semana real. */
const MOBILE_VISITS_PER_DAY = [0, 1, 2, 0, 1];

/**
 * Placeholder do card de visita no celular: checkbox, as tags (tipo e
 * escritório), o nome e o endereço. Sem a faixa de cor: o Card não tem
 * acento neutro, e uma cor de status num fantasma diria algo falso.
 */
function MobileVisitSkeleton() {
  return (
    <Card.Root>
      <Card.Body padding="sm">
        <div className="flex gap-12">
          <Loading.Skeleton className="h-[18px] w-[18px] shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <div className="flex gap-6">
              <Loading.Skeleton shape="pill" className="h-[22px] w-[64px]" />
              <Loading.Skeleton shape="pill" className="h-[22px] w-[88px]" />
            </div>
            <Loading.Skeleton className="h-[13px] w-3/4" />
            <Loading.Skeleton className="h-[11px] w-1/2" />
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}

/**
 * A semana no celular é uma lista: um card só, um dia por linha ("Seg 16")
 * e as visitas do dia logo abaixo. Espelha o Calendar "week" do celular, e
 * não as colunas do desktop, que espremidas em 390px viravam tiras.
 */
function MobileWeekSkeleton() {
  return (
    <Card.Root className="desktop:hidden">
      {MOBILE_VISITS_PER_DAY.map((visits, day) => (
        <div key={day}>
          {day > 0 && <Divider.Root />}
          <div className="flex flex-col gap-8 px-8 py-12">
            <div className="flex items-center gap-12 px-8">
              <Loading.Skeleton className="h-[11px] w-[24px]" />
              <Loading.Skeleton className="h-[16px] w-[20px]" />
            </div>
            {Array.from({ length: visits }).map((_, i) => (
              <MobileVisitSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </Card.Root>
  );
}

export function RoutinesSkeleton() {
  return (
    <>
      {/* O resumo só aparece no desktop do skeleton: no celular o topo da
          agenda real é o aviso de escritórios e a lista de dias, e quatro
          KPIs fantasmas empurravam a lista para fora da tela. */}
      <Grid.Root
        cols={{ base: 2, tablet: 4 }}
        gap={8}
        className="max-desktop:hidden"
      >
        {Array.from({ length: KPI_COUNT }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Grid.Root>

      <div className="max-desktop:hidden flex gap-10">
        {Array.from({ length: DAY_COUNT }).map((_, i) => (
          <DayColumnSkeleton key={i} />
        ))}
      </div>

      <MobileWeekSkeleton />
    </>
  );
}
