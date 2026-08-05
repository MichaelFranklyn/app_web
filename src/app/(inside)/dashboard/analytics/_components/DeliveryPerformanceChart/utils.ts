import { CHART_INK_MUTED, SERIES_RED } from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../../chartBuilders";
import { formatCount, formatDays, formatPercent } from "../../utils";
import { DeliveryPerformancePoint } from "./interface";

/**
 * Prazo prometido × prazo cumprido por fábrica, em barras lado a lado.
 *
 * A barra cinza é o que a fábrica prometeu; a vermelha, o que levou de fato.
 * Vermelha maior que cinza = atraso sistemático. As piores vêm primeiro, e o
 * tooltip diz sobre quantas entregas a média se apoia — uma fábrica com duas
 * entregas não sustenta conclusão.
 */
export const buildDeliveryPerformanceOption = (
  points: DeliveryPerformancePoint[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((p) => p.entityName),
    [
      {
        name: "Prazo prometido",
        color: CHART_INK_MUTED,
        data: points.map((p) => p.avgEstimatedDays ?? 0),
      },
      {
        name: "Prazo real",
        color: SERIES_RED,
        data: points.map((p) => p.avgActualDays),
      },
    ],
    formatDays,
    (index) => {
      const point = points[index];
      if (!point) return [];
      return [
        point.entityName,
        `Prazo real: <b>${formatDays(point.avgActualDays)}</b>`,
        point.avgEstimatedDays === null
          ? mutedLine("Sem previsão cadastrada")
          : `Prazo prometido: ${formatDays(point.avgEstimatedDays)}`,
        `Entregas atrasadas: <b>${formatPercent(point.lateRate)}</b>`,
        mutedLine(
          `${formatCount(point.deliveredCount, "entrega", "entregas")} no período`
        ),
      ];
    }
  );
