"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { DividerRoot } from "@/components/Divider/Root";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Progress } from "@/components/Progress";
import { ProgressColor } from "@/components/Progress/Root/interface";
import { Title } from "@/components/Title";
import { useQuery } from "@apollo/client/react";
import { Gauge, History, PackageSearch } from "lucide-react";
import { useParams } from "next/navigation";
import {
  CLIENT_PRODUCT_INSIGHTS_QUERY,
  CLIENT_VISIT_SCORES_QUERY,
  SELLER_CLIENT_FACTORIES_QUERY,
} from "../gql";
import {
  ClientProductInsightsQueryResponse,
  ClientVisitScoresQueryResponse,
  SellerClientFactoriesQueryResponse,
} from "../interface";
import { formatDate } from "@/utils/format/date";
import { ScoreSkeleton } from "./_components/ScoreSkeleton";

// Max values for each score dimension (derived from business rules)
const SCORE_MAX = {
  urgency: 100,
  priority: 50,
  frequency: 40,
  potential: 30,
  recency: 20,
};

function scoreColor(s: number): ProgressColor {
  if (s >= 71) return "red";
  if (s >= 41) return "amber";
  if (s >= 21) return "blue";
  return "green";
}

function insightUrgencyLabel(churnRisk: string): {
  label: string;
  color: "red" | "amber" | "neutral";
} {
  if (churnRisk === "alto") return { label: "Urgente", color: "red" };
  if (churnRisk === "medio") return { label: "Atenção", color: "amber" };
  return { label: "Baixo", color: "neutral" };
}

export default function ScoreContent() {
  const params = useParams();
  const id = params.id as string;

  const { data: vinculosData, loading: vinculosLoading } =
    useQuery<SellerClientFactoriesQueryResponse>(
      SELLER_CLIENT_FACTORIES_QUERY,
      {
        variables: {
          input: {
            filters: [{ field: "client_id", operator: "eq", value: id }],
            first: 1,
          },
        },
        skip: !id,
      }
    );

  const sellerClientFactoryId =
    vinculosData?.sellerClientFactoryList.edges[0]?.node.id ?? null;

  const { data: scoresData, loading: scoresLoading } =
    useQuery<ClientVisitScoresQueryResponse>(CLIENT_VISIT_SCORES_QUERY, {
      variables: {
        sellerClientFactoryId,
        input: { order: { by: "score_date", dir: "desc" }, first: 10 },
      },
      skip: !sellerClientFactoryId,
    });

  const { data: insightsData, loading: insightsLoading } =
    useQuery<ClientProductInsightsQueryResponse>(
      CLIENT_PRODUCT_INSIGHTS_QUERY,
      {
        variables: {
          sellerClientFactoryId,
          input: { first: 20 },
        },
        skip: !sellerClientFactoryId,
      }
    );

  const scores = scoresData?.clientVisitScores.edges.map((e) => e.node) ?? [];
  const latest = scores[0] ?? null;
  const insights =
    insightsData?.clientProductInsights.edges.map((e) => e.node) ?? [];

  const isLoading = vinculosLoading || scoresLoading || insightsLoading;

  const scoreTotal = latest ? parseFloat(latest.scoreTotal) : 0;

  const scoreBars = latest
    ? [
        {
          label: "Urgência",
          value: parseFloat(latest.scoreUrgency),
          pct: (parseFloat(latest.scoreUrgency) / SCORE_MAX.urgency) * 100,
          color: "red" as ProgressColor,
        },
        {
          label: "Prioridade",
          value: parseFloat(latest.scorePriority),
          pct: (parseFloat(latest.scorePriority) / SCORE_MAX.priority) * 100,
          color: "amber" as ProgressColor,
        },
        {
          label: "Frequência",
          value: parseFloat(latest.scoreFrequency),
          pct: (parseFloat(latest.scoreFrequency) / SCORE_MAX.frequency) * 100,
          color: "blue" as ProgressColor,
        },
        {
          label: "Potencial",
          value: parseFloat(latest.scorePotential),
          pct: (parseFloat(latest.scorePotential) / SCORE_MAX.potential) * 100,
          color: "green" as ProgressColor,
        },
        {
          label: "Recência",
          value: parseFloat(latest.scoreRecency),
          pct: (parseFloat(latest.scoreRecency) / SCORE_MAX.recency) * 100,
          color: "cyan" as ProgressColor,
        },
      ]
    : [];

  const scoreDate = latest ? formatDate(latest.scoreDate) : "—";

  if (isLoading && scores.length === 0 && insights.length === 0) {
    return <ScoreSkeleton />;
  }

  return (
    <>
      <div
        className="desktop:flex-row desktop:items-start flex flex-col gap-20"
        data-tour="client-score"
      >
        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col gap-16">
          {/* Decomposição */}
          <Card.Root>
            <Card.Header>
              <Card.Header.Title
                size="sm"
                weight="semibold"
                className="inline-flex items-center gap-6"
              >
                Decomposição do Score — {scoreDate}
                <HelpTooltip
                  label="Como o score é calculado?"
                  content={
                    <div className="flex flex-col gap-2">
                      <Title variant="label" color="amber">
                        Score ponderado (0–100)
                      </Title>
                      <Title variant="body-sm">
                        O total combina cinco dimensões, cada uma com peso
                        próprio:
                      </Title>
                      <ul className="list-disc pl-4">
                        <li>
                          <b>Urgência</b> — risco de churn e estoque esgotado.
                        </li>
                        <li>
                          <b>Prioridade</b> — relevância do cliente na carteira.
                        </li>
                        <li>
                          <b>Frequência</b> — regularidade de compras e visitas.
                        </li>
                        <li>
                          <b>Potencial</b> — oportunidade de crescimento.
                        </li>
                        <li>
                          <b>Recência</b> — quão recente foi o último contato.
                        </li>
                      </ul>
                    </div>
                  }
                />
              </Card.Header.Title>
              <Card.Header.Actions>
                <Badge.Root color={scoreColor(scoreTotal)} appearance="tinted">
                  <Badge.Text>Score {scoreTotal.toFixed(0)}</Badge.Text>
                </Badge.Root>
              </Card.Header.Actions>
            </Card.Header>
            <Card.Body>
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-6">
                  {scoreBars.map((bar) => (
                    <Progress.Root key={bar.label}>
                      <Progress.Header>
                        <Progress.Label>{bar.label}</Progress.Label>
                        <Progress.Value color={bar.color}>
                          {bar.value.toFixed(0)}
                        </Progress.Value>
                      </Progress.Header>
                      <Progress.Bar value={bar.pct} color={bar.color} />
                    </Progress.Root>
                  ))}
                  {scoreBars.length === 0 && (
                    <EmptyState.Root>
                      <EmptyState.Icon>
                        <Gauge size={32} />
                      </EmptyState.Icon>
                      <EmptyState.Title>
                        Sem score neste vínculo
                      </EmptyState.Title>
                      <EmptyState.Description>
                        Ainda não há score calculado para o vínculo selecionado.
                      </EmptyState.Description>
                    </EmptyState.Root>
                  )}
                </div>

                {latest && (
                  <>
                    <DividerRoot />
                    <div className="flex items-center gap-10">
                      <Title
                        variant="kpi"
                        color={scoreColor(scoreTotal)}
                        className="text-[49px]"
                      >
                        {scoreTotal.toFixed(0)}
                      </Title>
                      <div className="flex flex-col gap-8">
                        <Title variant="caption">Score total ponderado</Title>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card.Body>
          </Card.Root>

          {/* Produtos Sugeridos */}
          <Card.Root>
            <Card.Header>
              <Card.Header.Title
                size="sm"
                weight="semibold"
                className="inline-flex items-center gap-6"
              >
                Produtos Sugeridos para a Visita
                <HelpTooltip
                  label="Como as sugestões são geradas?"
                  content={
                    <Title variant="body-sm">
                      Produtos priorizados pela estimativa de esgotamento e pelo
                      risco de churn, destacando o que provavelmente precisa de
                      reposição na próxima visita.
                    </Title>
                  }
                />
              </Card.Header.Title>
            </Card.Header>
            <Card.Body padding="compact">
              {insights.map((s) => {
                const urg = insightUrgencyLabel(s.churnRisk);
                const meta =
                  s.daysSinceStockout > 0
                    ? `Estoque zerado há ${s.daysSinceStockout} dia${s.daysSinceStockout !== 1 ? "s" : ""}`
                    : s.daysSinceStockout > -7
                      ? `Crítico em ${-s.daysSinceStockout} dia${-s.daysSinceStockout !== 1 ? "s" : ""}`
                      : `Avg. duração: ${s.avgShelfDays ?? "??"} dias`;
                return (
                  <Card.Item key={s.id}>
                    <Card.Item.Info>
                      <Card.Item.Info.Name>
                        {s.product?.name ?? "—"}
                      </Card.Item.Info.Name>
                      <Card.Item.Info.Sub>{meta}</Card.Item.Info.Sub>
                    </Card.Item.Info>
                    <Card.Item.Action>
                      <Badge.Root color={urg.color} appearance="tinted">
                        <Badge.Text>{urg.label}</Badge.Text>
                      </Badge.Root>
                    </Card.Item.Action>
                  </Card.Item>
                );
              })}
              {insights.length === 0 && (
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <PackageSearch size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma sugestão</EmptyState.Title>
                  <EmptyState.Description>
                    Não há produtos sugeridos para a próxima visita no momento.
                  </EmptyState.Description>
                </EmptyState.Root>
              )}
            </Card.Body>
          </Card.Root>
        </div>

        {/* Sidebar */}
        <div className="desktop:w-[260px] flex w-full shrink-0 flex-col gap-12">
          <Card.Root>
            <Card.Header>
              <Card.Header.Title size="sm" weight="semibold">
                Histórico de Score
              </Card.Header.Title>
            </Card.Header>
            <Card.Body padding="compact">
              {scores.map((h) => {
                const s = parseFloat(h.scoreTotal);
                return (
                  <Card.Item key={h.id}>
                    <Card.Item.Info>
                      <Card.Item.Info.Name>
                        {formatDate(h.scoreDate)}
                      </Card.Item.Info.Name>
                    </Card.Item.Info>
                    <Card.Item.Action>
                      <Progress.Value color={scoreColor(s)}>
                        {s.toFixed(0)}
                      </Progress.Value>
                    </Card.Item.Action>
                  </Card.Item>
                );
              })}
              {scores.length === 0 && (
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <History size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Sem histórico</EmptyState.Title>
                  <EmptyState.Description>
                    O histórico de score aparece após o primeiro cálculo.
                  </EmptyState.Description>
                </EmptyState.Root>
              )}
            </Card.Body>
          </Card.Root>
        </div>
      </div>
    </>
  );
}
