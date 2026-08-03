"use client";

import { Progress } from "@/components/Progress";
import { Title } from "@/components/Title";
import { formatMoney, formatNumber } from "@/utils/format/masks";

import { GoalRow } from "../../interface";
import {
  GOAL_METRICS,
  metricValues,
  percentOf,
  percentTone,
} from "../../utils";

interface Props {
  row: GoalRow;
}

/**
 * As quatro barras de um par vendedor↔fábrica no mês. Indicador sem meta
 * definida mostra só o realizado: uma barra vazia diria "está atrasado", o que
 * não é verdade quando ninguém combinou número nenhum.
 */
export function GoalMetricBars({ row }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {GOAL_METRICS.map((metric) => {
        const values = metricValues(row, metric.id);
        const percent = percentOf(values);
        const format = (value: number) =>
          metric.money ? formatMoney(value) : formatNumber(value);

        return (
          <Progress.Root key={metric.id}>
            <Progress.Header>
              <Progress.Label>{metric.label}</Progress.Label>
              <Progress.Value color={percentTone(percent)}>
                {percent === null
                  ? "sem meta"
                  : `${percent.toFixed(0)}% da meta`}
              </Progress.Value>
            </Progress.Header>
            <Progress.Bar
              value={percent === null ? 0 : Math.min(percent, 100)}
              color={percentTone(percent)}
            />
            <Title variant="body-xs" color="muted">
              {format(values.done)}
              {values.target !== null && ` de ${format(values.target)}`}
            </Title>
          </Progress.Root>
        );
      })}
    </div>
  );
}
