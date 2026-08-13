"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { operationLabel } from "../../../utils";
import { ActivitySummary } from "../../../interface";
import { errorRate } from "../../utils";
import { buildPulseOption } from "./option";

const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[240px] w-full" />,
});

/**
 * O pulso da plataforma: quantas ações por dia e quantas falharam.
 *
 * É o painel que responde "alguma coisa quebrou?" antes de alguém abrir um
 * chamado — um degrau para baixo na barra, ou uma faixa vermelha que cresce,
 * aparecem aqui muito antes de virarem reclamação.
 */
export function ActivityPulse({ summary }: { summary: ActivitySummary }) {
  const rate = errorRate(summary);
  const hasMovement = summary.totalActions > 0;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Pulso da plataforma
        </Card.Header.Title>
        <Card.Header.Description>
          Ações por dia nos últimos 30 dias e as operações mais usadas.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body className="flex flex-col gap-20">
        <Grid.Root cols={{ base: 2, tablet: 3 }} gap={12}>
          <Grid.Item>
            <Card.Kpi>
              <Card.Kpi.Label>Ações no período</Card.Kpi.Label>
              <Card.Kpi.Value status="neutral">
                {summary.totalActions}
              </Card.Kpi.Value>
              <Card.Kpi.Delta>mutations registradas</Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>
          <Grid.Item>
            <Card.Kpi>
              <Card.Kpi.Label>Falhas</Card.Kpi.Label>
              {/* Cinco por cento já merece olhar: a maior parte dos erros que
                  chegam aqui é recusa de regra de negócio, não defeito — mas
                  acima disso costuma haver algo travando um fluxo. */}
              <Card.Kpi.Value
                status={rate === 0 ? "ok" : rate <= 5 ? "atencao" : "urgente"}
              >
                {summary.totalErrors}
              </Card.Kpi.Value>
              <Card.Kpi.Delta negative={rate > 5}>
                {rate}% das ações
              </Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>
          <Grid.Item>
            <Card.Kpi>
              <Card.Kpi.Label>Operações distintas</Card.Kpi.Label>
              <Card.Kpi.Value status="neutral">
                {summary.byOperation.length}
              </Card.Kpi.Value>
              <Card.Kpi.Delta>tipos de ação usados</Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>
        </Grid.Root>

        {hasMovement ? (
          <Chart option={buildPulseOption(summary.byDay)} height={240} />
        ) : (
          <EmptyState.Root>
            <EmptyState.Icon>
              <Activity size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma ação no período</EmptyState.Title>
            {/* O registro é recente: dizer isso evita ler o vazio como "o
                sistema está parado". */}
            <EmptyState.Description>
              O histórico começou a ser gravado agora e só cobre o que aconteceu
              a partir daqui.
            </EmptyState.Description>
          </EmptyState.Root>
        )}

        {summary.byOperation.length > 0 && (
          <div className="flex flex-col gap-8">
            <Title variant="caption" weight="semibold">
              Mais usadas
            </Title>
            <ul className="flex flex-col gap-6">
              {summary.byOperation.map((item) => (
                <li
                  key={item.key}
                  className="flex items-baseline justify-between gap-8"
                >
                  <Title variant="body-sm">{operationLabel(item.key)}</Title>
                  <Title variant="micro" color="muted">
                    {item.total}
                    {/* Muito uso com muitos erros é defeito, não adoção — por
                        isso as falhas vêm coladas no total. */}
                    {item.errors > 0 && (
                      <span className="text-(--red)">
                        {" "}
                        · {item.errors} com erro
                      </span>
                    )}
                  </Title>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
