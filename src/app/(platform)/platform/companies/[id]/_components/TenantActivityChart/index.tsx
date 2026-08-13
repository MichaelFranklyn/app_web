"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { ActivitySummary } from "../../../../interface";
import { buildTenantActivityOption } from "./option";

const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[200px] w-full" />,
});

/**
 * A curva de uso da empresa.
 *
 * Complementa a saúde da carteira, que compara pedidos: atividade cai ANTES de
 * o pedido parar — a pessoa abre menos, deixa de lançar visita, some da rotina
 * — e quando o pedido enfim não vem, a decisão já está tomada há semanas. Esta
 * curva é a chance de ver isso enquanto ainda dá para ligar para alguém.
 */
export function TenantActivityChart({
  summary,
  loading,
}: {
  summary: ActivitySummary | null;
  loading: boolean;
}) {
  const hasMovement = (summary?.totalActions ?? 0) > 0;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Curva de uso
        </Card.Header.Title>
        <Card.Header.Description>
          Ações por dia nos últimos 30 dias. Cai antes do pedido parar.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body className="flex flex-col gap-16">
        {loading && !summary ? (
          <Loading.Skeleton className="h-[200px] w-full" />
        ) : hasMovement && summary ? (
          <>
            <div className="flex flex-wrap items-baseline gap-16">
              <Title variant="body-sm" color="muted">
                <strong className="text-(--text)">
                  {summary.totalActions}
                </strong>{" "}
                {summary.totalActions === 1 ? "ação" : "ações"} no período
              </Title>
              <Title variant="body-sm" color="muted">
                <strong className="text-(--text)">
                  {summary.byOperation.length}
                </strong>{" "}
                {summary.byOperation.length === 1 ? "tipo" : "tipos"} de ação
              </Title>
            </div>
            <Chart
              option={buildTenantActivityOption(summary.byDay)}
              height={200}
            />
          </>
        ) : (
          <EmptyState.Root>
            <EmptyState.Icon>
              <Activity size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Sem uso no período</EmptyState.Title>
            {/* Vazio aqui não distingue "parou" de "nunca começou" — e as duas
                leituras pedem conversas diferentes. A ficha responde isso logo
                acima, no último acesso e no último pedido. */}
            <EmptyState.Description>
              Ninguém desta empresa executou nada nos últimos 30 dias. Veja o
              último acesso acima para saber se parou ou se nunca começou.
            </EmptyState.Description>
          </EmptyState.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}
