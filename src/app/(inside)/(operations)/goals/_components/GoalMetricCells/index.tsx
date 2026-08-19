"use client";

import { Table } from "@/components/Table";
import { formatMoney, formatNumber } from "@/utils/format/masks";

import { GOAL_METRICS, MetricValues, percentOf } from "../../utils";

interface Props {
  /** Meta e realizado por indicador — de um vendedor ou de uma fábrica dele. */
  totals: Record<string, MetricValues>;
}

/**
 * As quatro células de indicador de uma linha: o realizado em cima, o quanto da
 * meta embaixo.
 *
 * Mesma célula na lista de vendedores e na de fábricas de um vendedor — as duas
 * respondem a mesma pergunta em recortes diferentes, e ler o número de um jeito
 * numa tela e de outro na seguinte é o que faz alguém desconfiar do total.
 */
export function GoalMetricCells({ totals }: Props) {
  return (
    <>
      {GOAL_METRICS.map((metric) => {
        const values = totals[metric.id];
        const percent = percentOf(values);
        const format = (value: number) =>
          metric.money ? formatMoney(value) : formatNumber(value);

        return (
          <Table.Cell
            key={metric.id}
            align="right"
            className="whitespace-nowrap"
          >
            <div className="flex flex-col items-end gap-2">
              <Table.CellText variant="strong">
                {format(values.done)}
              </Table.CellText>
              {/* Sem meta não vira "0%": leria como atraso de quem nunca teve
                  alvo combinado. */}
              <Table.CellText variant="dim2">
                {values.target === null
                  ? "sem meta"
                  : `${percent?.toFixed(0)}% de ${format(values.target)}`}
              </Table.CellText>
            </div>
          </Table.Cell>
        );
      })}
    </>
  );
}
