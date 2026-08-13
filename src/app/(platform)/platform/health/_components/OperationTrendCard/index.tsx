"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { operationLabel } from "../../../utils";
import { OperationTrendReport } from "../../interface";
import { formatMs } from "../../utils";
import { RegressionRow } from "./RegressionRow";
import { buildTrendOption } from "./option";

const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[240px] w-full" />,
});

/**
 * O que MUDOU para pior desde a janela anterior.
 *
 * A tabela de operações responde "o que está quebrado"; esta responde "desde
 * quando" e "o que era antes". A diferença decide o trabalho: uma operação que
 * sempre levou dois segundos é uma dívida antiga a planejar; uma que levava
 * trezentos milissegundos na semana passada é um deploy a investigar hoje.
 *
 * Lista vazia aqui é boa notícia de verdade — e o texto diz isso, porque "nada
 * na lista" também poderia ser lido como "não mediu nada".
 */
export function OperationTrendCard({
  report,
}: {
  report: OperationTrendReport;
}) {
  const hasPulse = report.daily.some((point) => point.calls > 0);
  const peak = Math.max(0, ...report.daily.map((point) => point.p95Ms));

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Tendência técnica
        </Card.Header.Title>
        <Card.Header.Description>
          Falhas e tempo de resposta dia a dia, e o que piorou em relação aos 30
          dias anteriores.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body className="flex flex-col gap-20">
        {hasPulse ? (
          <>
            <Chart option={buildTrendOption(report.daily)} height={240} />
            <Title variant="micro" color="muted">
              Pico de {formatMs(peak)} no p95 do período. Um degrau que começa
              num dia específico costuma apontar o deploy daquele dia.
            </Title>
          </>
        ) : (
          <EmptyState.Root>
            <EmptyState.Icon>
              <CheckCircle2 size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma chamada no período</EmptyState.Title>
            <EmptyState.Description>
              Não é sinal de saúde: é ausência de uso — sem chamada não há o que
              medir.
            </EmptyState.Description>
          </EmptyState.Root>
        )}

        <div className="flex flex-col gap-12">
          <Title variant="body-sm" weight="semibold">
            Piorou em relação ao período anterior
          </Title>

          {report.regressions.length === 0 ? (
            <Title variant="micro" color="muted">
              Nenhuma operação piorou. A comparação exige pelo menos 20 chamadas
              nas duas janelas — o que roda pouco não entra, porque com amostra
              pequena qualquer variação é acaso.
            </Title>
          ) : (
            <ul className="flex flex-col gap-8">
              {report.regressions.map((regression) => (
                <RegressionRow
                  key={regression.operation}
                  regression={regression}
                />
              ))}
            </ul>
          )}
        </div>

        {(report.newOperations.length > 0 ||
          report.vanishedOperations.length > 0) && (
          <div className="flex flex-col gap-8 border-t border-(--border) pt-12">
            {report.newOperations.length > 0 && (
              <div className="flex flex-wrap items-center gap-8">
                <Title variant="micro" color="muted">
                  Novas no período:
                </Title>
                {report.newOperations.map((operation) => (
                  <Badge.Root
                    key={operation}
                    color="blue"
                    appearance="tinted"
                    size="xs"
                  >
                    <Badge.Text>{operationLabel(operation)}</Badge.Text>
                  </Badge.Root>
                ))}
              </div>
            )}

            {report.vanishedOperations.length > 0 && (
              <div className="flex flex-wrap items-center gap-8">
                {/* Sumir não é necessariamente ruim, mas é sempre uma pergunta:
                    ou a funcionalidade foi abandonada, ou a tela quebrou tão
                    cedo que ninguém chegou a executar a ação. */}
                <Title variant="micro" color="muted">
                  Deixaram de ser usadas:
                </Title>
                {report.vanishedOperations.map((operation) => (
                  <Badge.Root
                    key={operation}
                    color="neutral"
                    appearance="tinted"
                    size="xs"
                  >
                    <Badge.Text>{operationLabel(operation)}</Badge.Text>
                  </Badge.Root>
                ))}
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
