"use client";
import { Dot } from "@/components/Dot";
import { TooltipPanel } from "@/components/TooltipPanel";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { explainScore, isUrgent, ScoreDimensions } from "@/utils/score";
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
    <TooltipPanel.Root width={280}>
      <TooltipPanel.Header
        aside={
          <Title variant="label" color="amber">
            {total.toFixed(0)}
          </Title>
        }
      >
        <div className="flex items-center gap-6">
          <Dot.Root
            color={level.tone}
            size="md"
            pulse={false}
            className="opacity-100"
          />
          <Title variant="label">{level.label}</Title>
        </div>
      </TooltipPanel.Header>

      <TooltipPanel.Section className="gap-4">
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
      </TooltipPanel.Section>

      {reasons.length > 0 && (
        <TooltipPanel.Section>
          {reasons.map((reason) => (
            <div key={reason.key} className="flex gap-6">
              <Dot.Root
                color={reason.tone}
                pulse={false}
                className="mt-[5px] opacity-100"
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
        </TooltipPanel.Section>
      )}
    </TooltipPanel.Root>
  );

  return (
    <Tooltip content={tooltip} panel>
      <span className="inline-flex cursor-help">
        <Badge.Root color={level.tone} appearance="tinted" size="sm">
          <Badge.Text>{label}</Badge.Text>
        </Badge.Root>
      </span>
    </Tooltip>
  );
}
