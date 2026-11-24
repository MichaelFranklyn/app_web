import { cn } from "@/lib/utils";
import { Loading } from "@/components/Loading";
import { KpiDelta } from "../Delta";
import { KpiRoot } from "../Root";
import { CardKpiSkeletonProps } from "./interface";

const SNUG_LINE = "h-[13px] my-[2.5px]";

/**
 * O cartão de número enquanto carrega: o mesmo `Card.Kpi`, com rótulo, número
 * e rodapé em cinza nas alturas reais. Substitui o bloco cinza de 104px e os
 * esqueletos montados à mão em cada tela — a troca pelo dado não desloca nada.
 */
export function KpiSkeleton({ delta = true }: CardKpiSkeletonProps) {
  return (
    <KpiRoot aria-hidden>
      {/* Rótulo e rodapé: 13px com `leading-snug` (linha de 18px) — a prop
          `text` do esqueleto mede a linha do `Title` (1.6), mais alta. */}
      <Loading.Skeleton className={cn(SNUG_LINE, "w-3/5")} />
      {/* O número encolhe com o cartão (`clamp` do `kpiValueStyle`, linha
          `leading-none`): a barra acompanha a mesma conta. */}
      <Loading.Skeleton className="h-[clamp(18px,13cqi,34px)] w-2/5" />
      {delta && (
        <KpiDelta>
          <Loading.Skeleton className={cn(SNUG_LINE, "w-4/5")} />
        </KpiDelta>
      )}
    </KpiRoot>
  );
}
