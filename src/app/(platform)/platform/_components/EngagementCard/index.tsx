"use client";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { UserX } from "lucide-react";
import dynamic from "next/dynamic";
import { PlatformEngagement } from "../../interface";
import { formatShortDay, inactiveThisWeek, stickinessTone } from "../../utils";
import { buildEngagementOption } from "./option";

const Chart = dynamic(() => import("@/components/Chart"), {
  ssr: false,
  loading: () => <Loading.Skeleton className="h-[240px] w-full" />,
});

/**
 * Quanta GENTE usa a plataforma — não quanto volume passa por ela.
 *
 * O pulso de atividade conta ações, e duas situações opostas produzem o mesmo
 * número lá: uma pessoa lançando trezentos pedidos e dez pessoas lançando trinta
 * cada. A primeira é um cliente por um fio; a segunda é um time trabalhando
 * dentro do sistema. A diferença só aparece aqui.
 *
 * O limite do dado está escrito na tela, não só no código: o histórico registra
 * o que as pessoas GRAVAM, e consulta não deixa rastro. Quem entrou só para
 * olhar relatório não está nestes números.
 */
export function EngagementCard({
  engagement,
}: {
  engagement: PlatformEngagement;
}) {
  const tone = stickinessTone(engagement.stickiness);
  const inactive = inactiveThisWeek(engagement);
  const hasMovement = engagement.monthlyActive > 0;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Pessoas trabalhando
        </Card.Header.Title>
        <Card.Header.Description>
          Quantas pessoas distintas registraram alguma ação, por dia. Quem
          apenas consultou telas não aparece — o histórico só grava o que muda
          dado.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body className="flex flex-col gap-20">
        <Grid.Root cols={{ base: 2, tablet: 4 }} gap={12}>
          <Grid.Item>
            <Card.Kpi>
              <Card.Kpi.Label>Num dia típico</Card.Kpi.Label>
              <Card.Kpi.Value status="neutral">
                {engagement.dailyAverage}
              </Card.Kpi.Value>
              <Card.Kpi.Delta>média por dia útil</Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>

          <Grid.Item>
            <Card.Kpi>
              <Card.Kpi.Label>Na última semana</Card.Kpi.Label>
              <Card.Kpi.Value status="neutral">
                {engagement.weeklyActive}
              </Card.Kpi.Value>
              <Card.Kpi.Delta>pessoas distintas</Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>

          <Grid.Item>
            <Card.Kpi>
              <Card.Kpi.Label>No período</Card.Kpi.Label>
              <Card.Kpi.Value status="neutral">
                {engagement.monthlyActive}
              </Card.Kpi.Value>
              <Card.Kpi.Delta negative={inactive > 0}>
                {inactive > 0
                  ? `${inactive} sem aparecer na semana`
                  : "todas apareceram na semana"}
              </Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>

          <Grid.Item>
            <Card.Kpi>
              <Card.Kpi.Label>Hábito</Card.Kpi.Label>
              {/* A aderência é o número que diz se o sistema é onde as pessoas
                  trabalham ou onde elas vão quando precisam de algo. */}
              <Card.Kpi.Value status={tone}>
                {engagement.stickiness}%
              </Card.Kpi.Value>
              <Card.Kpi.Delta>do período aparece num dia</Card.Kpi.Delta>
            </Card.Kpi>
          </Grid.Item>
        </Grid.Root>

        {hasMovement ? (
          <>
            <Chart
              option={buildEngagementOption(engagement.daily)}
              height={240}
            />
            <Title variant="micro" color="muted">
              {engagement.peakDay
                ? `Melhor dia: ${engagement.peakUsers} pessoas em ${formatShortDay(engagement.peakDay)}.`
                : ""}{" "}
              O vale de sábado e domingo é esperado e fica fora da média — a
              ferramenta é de trabalho de campo.
            </Title>
          </>
        ) : (
          <EmptyState.Root>
            <EmptyState.Icon>
              <UserX size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>
              Ninguém registrou nada no período
            </EmptyState.Title>
            <EmptyState.Description>
              Nenhuma pessoa gravou uma ação sequer. Não é falta de dado: é
              ausência de uso.
            </EmptyState.Description>
          </EmptyState.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}
