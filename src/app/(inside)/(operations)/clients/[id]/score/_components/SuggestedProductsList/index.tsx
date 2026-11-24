"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { plural } from "@/utils/format/plural";
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
  if (days > 0) return `Estoque zerado há ${plural(days, "dia", "dias")}`;
  if (days > -7) return `Crítico em ${plural(-days, "dia", "dias")}`;
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
          <PackageSearch />
        </EmptyState.Icon>
        <EmptyState.Title>Nenhuma sugestão</EmptyState.Title>
        <EmptyState.Description>
          Não há produtos sugeridos para esta fábrica no momento.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  // O cartão só embrulha a lista: o EmptyState já é um cartão, e dentro de
  // outro ficava borda dentro de borda (14/11/2026).
  return (
    <Card.Root>
      <Card.Body padding="compact">
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
      </Card.Body>
    </Card.Root>
  );
}
