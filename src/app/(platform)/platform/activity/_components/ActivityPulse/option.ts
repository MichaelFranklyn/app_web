import {
  SERIES_BLUE,
  SERIES_RED,
  baseGrid,
  categoryAxis,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";
import { ActivitySummaryItem } from "../../../interface";
import { formatDayLabel } from "../../../utils";

/**
 * Ações por dia, com as falhas empilhadas por cima.
 *
 * Empilhado, e não lado a lado: a soma das duas barras é o total de tentativas,
 * que é o número que se quer ler primeiro. Lado a lado, um dia com poucos erros
 * mostraria uma barra vermelha quase invisível e o olho perderia a proporção.
 */
export const buildPulseOption = (
  points: ActivitySummaryItem[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: tooltipBase,
  legend: {
    bottom: 0,
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { fontSize: 12 },
  },
  xAxis: { ...categoryAxis, data: points.map((p) => formatDayLabel(p.key)) },
  yAxis: valueAxis,
  series: [
    {
      name: "Concluídas",
      type: "bar",
      stack: "acoes",
      data: points.map((p) => p.total - p.errors),
      itemStyle: { color: SERIES_BLUE },
    },
    {
      name: "Com erro",
      type: "bar",
      stack: "acoes",
      data: points.map((p) => p.errors),
      // Vermelho é reservado a séries de sentido negativo — é exatamente o caso.
      itemStyle: { color: SERIES_RED, borderRadius: [3, 3, 0, 0] },
    },
  ],
});
