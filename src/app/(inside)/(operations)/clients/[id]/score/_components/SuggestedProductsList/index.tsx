"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PackageSearch } from "lucide-react";
import { ProductInsight } from "../../../interface";

function urgencyLabel(churnRisk: string): {
  label: string;
  color: "red" | "amber" | "neutral";
} {
  if (churnRisk === "alto") return { label: "Urgente", color: "red" };
  if (churnRisk === "medio") return { label: "Atenção", color: "amber" };
  return { label: "Baixo", color: "neutral" };
}

function stockMeta(insight: ProductInsight): string {
  const days = insight.daysSinceStockout;
  const plural = (n: number) => (n !== 1 ? "s" : "");
  if (days > 0) return `Estoque zerado há ${days} dia${plural(days)}`;
  if (days > -7) return `Crítico em ${-days} dia${plural(-days)}`;
  return `Duração média: ${insight.avgShelfDays ?? "??"} dias`;
}

/** O que provavelmente precisa de reposição nesta fábrica. */
export function SuggestedProductsList({
  insights,
}: {
  insights: ProductInsight[];
}) {
  if (insights.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <PackageSearch size={32} />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhuma sugestão</EmptyState.Title>
        <EmptyState.Description>
          Não há produtos sugeridos para esta fábrica no momento.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <>
      {insights.map((insight) => {
        const urgency = urgencyLabel(insight.churnRisk);
        return (
          <Card.Item key={insight.id}>
            <Card.Item.Info>
              <Card.Item.Info.Name>
                {insight.product?.name ?? "—"}
              </Card.Item.Info.Name>
              <Card.Item.Info.Sub>{stockMeta(insight)}</Card.Item.Info.Sub>
            </Card.Item.Info>
            <Card.Item.Action>
              <Badge.Root color={urgency.color} appearance="tinted">
                <Badge.Text>{urgency.label}</Badge.Text>
              </Badge.Root>
            </Card.Item.Action>
          </Card.Item>
        );
      })}
    </>
  );
}
