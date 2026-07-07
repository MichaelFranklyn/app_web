"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";
import { explainScore, SCORE_TONE_BG, ScoreDimensions } from "@/utils/score";

interface Props {
  score: ScoreDimensions | null;
}

// Tag de score no header do cliente, ao lado de Ativo/Inativo. O tooltip
// (hover/foco) explica o nível, os fatores que puxam o score e o que fazer.
export function ScoreTag({ score }: Props) {
  if (!score) return null;
  const { total, level, reasons } = explainScore(score);

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

      <div className="px-[12px] py-[8px]">
        <Title variant="body-sm" color="secondary">
          {level.summary}
        </Title>
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
          <Badge.Text>Score {total.toFixed(0)}</Badge.Text>
        </Badge.Root>
      </span>
    </Tooltip>
  );
}
