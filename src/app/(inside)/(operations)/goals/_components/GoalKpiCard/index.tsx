"use client";

import { Card } from "@/components/Card";
import { Progress } from "@/components/Progress";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { MetricValues, percentOf, percentTone } from "@/utils/goals";
import { formatPercentPoints } from "@/utils/format/percent";

interface Props {
  label: string;
  values: MetricValues;
  /** O que este indicador mede — o mesmo texto das barras de cada fábrica. */
  help?: string;
  money?: boolean;
}

/** Um indicador somado do recorte: o realizado grande e a meta embaixo. */
export function GoalKpiCard({ label, values, help, money }: Props) {
  const percent = percentOf(values);
  const format = (value: number) =>
    money ? formatMoney(value) : formatNumber(value);

  return (
    <Card.Kpi>
      <Card.Kpi.Label help={help}>{label}</Card.Kpi.Label>

      {/* O número é neutro: verde fixo em "Faturado" lia como "meta batida"
          com 4% feitos (crítica de 23/11/2026). Quem diz se está bom é a
          barra, pintada pelo quanto da meta foi cumprido. */}
      <Card.Kpi.Value status="neutral">{format(values.done)}</Card.Kpi.Value>

      {percent !== null && (
        <Progress.Bar
          className="mt-8"
          value={Math.min(percent, 100)}
          color={percentTone(percent)}
          label={`${label}: ${formatPercentPoints(percent)} da meta`}
        />
      )}

      <Card.Kpi.Delta>
        {/* Sem meta não vira "0%": leria como atraso de quem nunca teve alvo
            combinado. */}
        {values.target === null
          ? "sem meta definida"
          : `${formatPercentPoints(percent ?? 0)} da meta de ${format(values.target)}`}
      </Card.Kpi.Delta>
    </Card.Kpi>
  );
}
