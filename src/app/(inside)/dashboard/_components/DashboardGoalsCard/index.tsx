"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Progress } from "@/components/Progress";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { monthLabel } from "@/utils/format/month";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { percentOf, percentTone } from "@/utils/goals";
import { ArrowRight, Target } from "lucide-react";

import { useDashboardGoals } from "./useDashboardGoals";

interface Props {
  /** O vendedor escolhido no topo do dashboard (nulo para o vendedor). */
  sellerId: string | null;
}

/**
 * As metas do mês no dashboard: quanto já foi feito de cada indicador e se o
 * ritmo acompanha o calendário. Era o cartão "metas atrás do ritmo" de
 * /insights; aqui ele mostra também quem está EM dia — meta é acompanhamento,
 * não pendência. Definir e detalhar continuam em /goals.
 */
export function DashboardGoalsCard({ sellerId }: Props) {
  const goals = useDashboardGoals(sellerId);

  return (
    <Card.Root data-tour="dashboard-goals">
      <Card.Header className="min-h-13.75">
        <Card.Header.Title size="sm" weight="bold">
          Metas de {monthLabel(goals.month)}
        </Card.Header.Title>
        <Card.Header.Actions>
          {goals.behindCount > 0 && (
            <Badge.Root
              appearance="tinted"
              color="amber"
              title="Indicadores cujo realizado está mais de 10% abaixo do que o calendário já pediu."
            >
              <Badge.Text>
                {goals.behindCount === 1
                  ? "1 atrás do ritmo"
                  : `${goals.behindCount} atrás do ritmo`}
              </Badge.Text>
            </Badge.Root>
          )}
          <Button.Link
            href="/goals"
            appearance="outline"
            color="neutral"
            size="sm"
            noUppercase
          >
            <Button.Title>Ver metas</Button.Title>
            <Button.Icon icon={ArrowRight} />
          </Button.Link>
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body padding="compact">
        {goals.failed ? (
          <QueryError onRetry={() => goals.refetch()} />
        ) : goals.loading ? (
          <Loading.Skeleton className="h-[120px] w-full" />
        ) : goals.metrics.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <Target size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma meta para este mês</EmptyState.Title>
            <EmptyState.Description>
              As metas são combinadas por vendedor e fábrica na tela de Metas.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <div className="flex flex-col gap-12">
            <Title variant="micro" color="muted">
              {goals.pacePercent}% do mês já passou
              {goals.overall !== null &&
                ` · ${goals.overall.toFixed(0)}% do combinado cumprido`}
            </Title>
            {goals.metrics.map((metric) => {
              const percent = percentOf(metric.values) ?? 0;
              const format = (value: number) =>
                metric.money ? formatMoney(value) : formatNumber(value);
              return (
                <div
                  key={metric.id}
                  className="flex flex-col gap-4"
                  title={metric.help}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-8">
                    <Title variant="body-xs" weight="semibold">
                      {metric.label}
                    </Title>
                    <Title
                      variant="body-xs"
                      color={metric.behind ? "amber" : "muted"}
                    >
                      {format(metric.values.done)} de{" "}
                      {format(metric.values.target ?? 0)}
                      {metric.behind ? " · atrás do ritmo" : ""}
                    </Title>
                  </div>
                  <Progress.Bar
                    value={Math.min(percent, 100)}
                    color={percentTone(percent)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
