"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { ScoreReason } from "@/utils/score";
import { Lightbulb, ThumbsUp } from "lucide-react";

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
          <ThumbsUp size={32} />
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
        <div
          key={reason.key}
          className="flex flex-col gap-4 rounded-(--r-md) border border-(--border) bg-(--bg3) p-[10px]"
        >
          <div className="flex items-center justify-between gap-6">
            <Badge.Root color={reason.tone} appearance="tinted">
              <Badge.Text>{reason.label}</Badge.Text>
            </Badge.Root>
            <Title variant="micro" color="muted">
              +{reason.contribution.toFixed(0)} pts no total
            </Title>
          </div>
          <Title variant="body-sm">{reason.why}</Title>
          {reason.tip && (
            <div className="flex items-start gap-6">
              <Lightbulb
                size={14}
                className="mt-[2px] shrink-0 text-(--amber)"
              />
              <Title variant="body-sm" color="secondary">
                {reason.tip}
              </Title>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
