"use client";
import { Card } from "@/components/Card";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { ScoreReason, formatScore } from "@/utils/score";
import { Lightbulb, ThumbsUp } from "lucide-react";
import { ICON_SIZE } from "@/components/Icon";

/**
 * Os fatores que empurraram o score, do que mais pesou ao que menos, com a ação
 * sugerida. Os pontos exibidos são a CONTRIBUIÇÃO ao total, não o valor bruto
 * da dimensão — "Prioridade 50" só adiciona 10 pontos ao total.
 */
export function ScoreReasonsList({ reasons }: { reasons: ScoreReason[] }) {
  if (reasons.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <ThumbsUp />
        </EmptyState.Icon>
        <EmptyState.Title>Nada puxando o score</EmptyState.Title>
        <EmptyState.Description>
          Nenhum fator de atenção agora — o cliente está em dia nesta fábrica.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {reasons.map((reason) => (
        <Card.Root key={reason.key} inset tone="muted">
          <Card.Body padding="sm">
            <div className="flex items-center justify-between gap-6">
              <Badge.Root color={reason.tone} appearance="tinted">
                <Badge.Text>{reason.label}</Badge.Text>
              </Badge.Root>
              <Title variant="micro" color="muted">
                +{formatScore(reason.contribution)} pts no total
              </Title>
            </div>
            <Title variant="body-sm">{reason.why}</Title>
            {reason.tip && (
              <div className="flex items-start gap-6">
                <Lightbulb
                  size={ICON_SIZE.sm}
                  className="mt-2 shrink-0 text-(--color-action-text)"
                />
                <Title variant="body-sm" color="secondary">
                  {reason.tip}
                </Title>
              </div>
            )}
          </Card.Body>
        </Card.Root>
      ))}
    </div>
  );
}
