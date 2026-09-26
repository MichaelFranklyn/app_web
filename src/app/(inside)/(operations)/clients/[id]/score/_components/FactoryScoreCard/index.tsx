"use client";
import { Card } from "@/components/Card";

import { Badge } from "@/components/Badges";
import { factoryName } from "@/utils/company";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { scoreBarColor, scoreLevel } from "@/utils/score";
import { ChevronRight } from "lucide-react";
import { FactoryVisitScore } from "../../../interface";

interface Props {
  score: FactoryVisitScore;
  onSelect: (score: FactoryVisitScore) => void;
}

/** Card de uma fábrica: o número, o que ele significa e um convite a abrir. */
export function FactoryScoreCard({ score, onSelect }: Props) {
  const total = parseFloat(score.scoreTotal) || 0;
  const level = scoreLevel(total);
  const factoryLabel = factoryName(score.clientFactoryLink?.factory);

  return (
    <Card.Button
      onClick={() => onSelect(score)}
      aria-label={`Ver por que ${factoryLabel} tem score ${total.toFixed(0)}`}
    >
      <div className="flex items-start justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-2">
          <Title variant="body" weight="semibold" className="truncate">
            {factoryLabel}
          </Title>
          <Title variant="micro" color="muted">
            {formatDate(score.scoreDate)}
          </Title>
        </div>
        <Badge.Root color={level.tone} appearance="tinted">
          <Badge.Text>{level.label}</Badge.Text>
        </Badge.Root>
      </div>

      <div className="flex items-end justify-between gap-8">
        <Title
          variant="kpi"
          color={scoreBarColor(total)}
          className="text-[40px]"
        >
          {total.toFixed(0)}
        </Title>
        <div className="flex items-center gap-4 pb-4">
          <Title variant="micro" color="secondary">
            Ver o porquê
          </Title>
          <ChevronRight size={14} className="text-(--muted)" />
        </div>
      </div>
    </Card.Button>
  );
}
