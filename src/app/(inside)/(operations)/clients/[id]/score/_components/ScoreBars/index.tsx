"use client";

import { Progress } from "@/components/Progress";
import { ProgressColor } from "@/components/Progress/Root/interface";
import { ScoreDimensions } from "@/utils/score";

// Teto de cada dimensão na escala bruta (espelha _DIMENSION_MAX no backend).
// Cada barra mostra a dimensão normalizada por regra de 3 para 0–100 (bruto /
// teto), então todas ficam na mesma escala e o número bate com o preenchimento.
// Somá-las NÃO dá o total: o total é a média PONDERADA (cada dimensão tem um
// peso diferente), explicada no tooltip do card.
const SCORE_MAX = {
  urgency: 100,
  priority: 50,
  frequency: 40,
  potential: 30,
  recency: 20,
} as const;

interface Bar {
  label: string;
  /** Dimensão normalizada para 0–100 (regra de 3 sobre o teto). */
  pct: number;
  color: ProgressColor;
}

const buildBars = (score: ScoreDimensions): Bar[] => {
  const bar = (
    label: string,
    raw: string,
    max: number,
    color: ProgressColor
  ): Bar => {
    const parsedValue = parseFloat(raw) || 0;
    return { label, pct: (parsedValue / max) * 100, color };
  };

  return [
    bar("Urgência", score.scoreUrgency, SCORE_MAX.urgency, "red"),
    bar("Prioridade", score.scorePriority, SCORE_MAX.priority, "amber"),
    bar("Frequência", score.scoreFrequency, SCORE_MAX.frequency, "blue"),
    bar("Potencial", score.scorePotential, SCORE_MAX.potential, "green"),
    bar("Recência", score.scoreRecency, SCORE_MAX.recency, "cyan"),
  ];
};

export function ScoreBars({ score }: { score: ScoreDimensions }) {
  return (
    <div className="flex flex-col gap-6">
      {buildBars(score).map((bar) => (
        <Progress.Root key={bar.label}>
          <Progress.Header>
            <Progress.Label>{bar.label}</Progress.Label>
            <Progress.Value color={bar.color}>
              {bar.pct.toFixed(0)}
            </Progress.Value>
          </Progress.Header>
          <Progress.Bar value={bar.pct} color={bar.color} />
        </Progress.Root>
      ))}
    </div>
  );
}
