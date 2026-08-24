"use client";

import { Card } from "@/components/Card";
import { KpiStatus } from "@/components/Card/Kpi";
import { HelpTooltip } from "@/components/HelpTooltip";
import { formatMoney, formatNumber } from "@/utils/format/masks";

import { MetricValues, percentOf } from "../../utils";

interface Props {
  label: string;
  values: MetricValues;
  /**
   * Cor do número. Fixa por indicador, como nos demais painéis do sistema
   * (dashboard, carteira, rotinas): é identidade do cartão, e a fileira se
   * reconhece de relance por ela. O quanto da meta foi cumprido continua
   * escrito embaixo, e é a coluna "Da meta" da tabela que o pinta.
   */
  status: KpiStatus;
  /** Azul não é um `status` do Card.Kpi — entra por classe, como no dashboard. */
  valueClassName?: string;
  /** O que este indicador mede — o mesmo texto das barras de cada fábrica. */
  help?: string;
  money?: boolean;
}

/** Um indicador somado do recorte: o realizado grande e a meta embaixo. */
export function GoalKpiCard({
  label,
  values,
  status,
  valueClassName,
  help,
  money,
}: Props) {
  const percent = percentOf(values);
  const format = (value: number) =>
    money ? formatMoney(value) : formatNumber(value);

  return (
    <Card.Kpi>
      <Card.Kpi.Label className="inline-flex items-center gap-2">
        {label}
        {help && <HelpTooltip label={`Sobre ${label}`} content={help} />}
      </Card.Kpi.Label>

      <Card.Kpi.Value status={status} className={valueClassName}>
        {format(values.done)}
      </Card.Kpi.Value>

      <Card.Kpi.Delta>
        {/* Sem meta não vira "0%": leria como atraso de quem nunca teve alvo
            combinado. */}
        {values.target === null
          ? "sem meta definida"
          : `${percent?.toFixed(0)}% da meta de ${format(values.target)}`}
      </Card.Kpi.Delta>
    </Card.Kpi>
  );
}
