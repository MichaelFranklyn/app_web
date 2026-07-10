"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";
import {
  explainScore,
  isUrgent,
  SCORE_TONE_BG,
  ScoreDimensions,
} from "@/utils/score";
import { FactoryVisitScore } from "../../interface";

interface Props {
  score: ScoreDimensions | null;
  /** Score de cada fábrica do cliente; alimenta o nome e o contador de urgentes. */
  factoryScores?: FactoryVisitScore[];
}

// Tag de score no header do cliente, ao lado de Ativo/Inativo. O tooltip
// (hover/foco) explica o nível, os fatores que puxam o score e o que fazer.
//
// O número é o MAIOR score entre as fábricas do cliente, não a média: um cliente
// com 10 numa fábrica e 90 em outra precisa de visita naquela outra. Por isso a
// tag nomeia a fábrica de onde o número veio — sem isso ele parece sair do nada.
export function ScoreTag({ score, factoryScores = [] }: Props) {
  if (!score) return null;
  const { total, level, reasons } = explainScore(score);

  const topFactory = factoryScores[0]?.clientFactoryLink?.factory?.nomeFantasia;
  // O topo já está incluído na contagem; "+N" são as OUTRAS fábricas urgentes.
  const otherUrgent = Math.max(
    0,
    factoryScores.filter((s) => isUrgent(Number(s.scoreTotal))).length - 1
  );

  const label = [
    `Score ${total.toFixed(0)}`,
    topFactory && `· ${topFactory}`,
    otherUrgent > 0 && `+${otherUrgent}`,
  ]
    .filter(Boolean)
    .join(" ");

  const tooltip = (
    <div className="flex w-[280px] flex-col">
      <div className="flex items-center justify-between gap-8 border-b border-(--border) px-[12px] py-[10px]">
        <div className="flex items-center gap-6">
          <span
            className={cn(
              "h-[8px] w-[8px] rounded-full",
              SCORE_TONE_BG[level.tone]
            )}
          />
          <Title variant="label">{level.label}</Title>
        </div>
        <Title variant="label" color="amber">
          {total.toFixed(0)}
        </Title>
      </div>

      <div className="flex flex-col gap-4 px-[12px] py-[8px]">
        <Title variant="body-sm" color="secondary">
          {level.summary}
        </Title>
        {topFactory && (
          <Title variant="micro" color="muted">
            Score mais alto na fábrica {topFactory}.
            {otherUrgent > 0 &&
              ` Outras ${otherUrgent} fábricas também estão urgentes.`}
          </Title>
        )}
      </div>

      {reasons.length > 0 && (
        <div className="flex flex-col gap-8 border-t border-(--border) px-[12px] py-[10px]">
          {reasons.map((reason) => (
            <div key={reason.key} className="flex gap-6">
              <span
                className={cn(
                  "mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full",
                  SCORE_TONE_BG[reason.tone]
                )}
              />
              <div className="flex flex-col gap-1">
                <Title variant="body-sm">
                  <b>{reason.label}</b> — {reason.why}
                </Title>
                {reason.tip && (
                  <Title variant="micro" color="muted">
                    {reason.tip}
                  </Title>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltip} className="max-w-none p-0 whitespace-normal">
      <span className="inline-flex cursor-help">
        <Badge.Root color={level.tone} appearance="tinted" size="sm">
          <Badge.Text>{label}</Badge.Text>
        </Badge.Root>
      </span>
    </Tooltip>
  );
}
