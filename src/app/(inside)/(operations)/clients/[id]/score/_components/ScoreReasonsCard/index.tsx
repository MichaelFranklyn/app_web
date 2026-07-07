"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { explainScore, ScoreDimensions } from "@/utils/score";
import { Lightbulb, ThumbsUp } from "lucide-react";

interface Props {
  score: ScoreDimensions | null;
}

export function ScoreReasonsCard({ score }: Props) {
  if (!score) return null;
  const { level, reasons } = explainScore(score);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Por que este score?
        </Card.Header.Title>
        <Card.Header.Actions>
          <Badge.Root color={level.tone} appearance="tinted">
            <Badge.Text>{level.label}</Badge.Text>
          </Badge.Root>
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-12">
          <Title variant="body-sm" color="secondary">
            {level.summary}
          </Title>

          {reasons.length === 0 ? (
            <EmptyState.Root>
              <EmptyState.Icon>
                <ThumbsUp size={32} />
              </EmptyState.Icon>
              <EmptyState.Title>Nada puxando o score</EmptyState.Title>
              <EmptyState.Description>
                Nenhum fator de atenção agora — o cliente está em dia.
              </EmptyState.Description>
            </EmptyState.Root>
          ) : (
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
                      +{reason.value.toFixed(0)} pts
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
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
