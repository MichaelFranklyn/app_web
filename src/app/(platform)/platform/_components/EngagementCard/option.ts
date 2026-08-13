import {
  SERIES_BLUE,
  SERIES_CYAN,
  baseGrid,
  categoryAxis,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";
import { EngagementPoint } from "../../interface";
import { formatShortDay } from "../../utils";

/**
 * Pessoas por dia, com as empresas atrás.
 *
 * As duas séries no MESMO eixo de propósito: a distância entre elas é a leitura
 * que interessa — quanto mais próximas, mais a plataforma depende de uma pessoa
 * por empresa, e uma conta com um usuário só sai inteira quando essa pessoa sai.
 *
 * Área e não barra: o fim de semana vira um vale visível, e é assim que se
 * distingue o vale esperado (todo sábado) do vale que não deveria estar ali
 * (uma quarta-feira vazia).
 */
export const buildEngagementOption = (
  points: EngagementPoint[]
): EChartsCoreOption => ({
  grid: { ...baseGrid, right: 24 },
  tooltip: tooltipBase,
  legend: {
    bottom: 0,
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { fontSize: 12 },
  },
  xAxis: {
    ...categoryAxis,
    data: points.map((point) => formatShortDay(point.day)),
  },
  yAxis: { ...valueAxis, minInterval: 1 },
  series: [
    {
      name: "Pessoas",
      type: "line",
      smooth: true,
      symbolSize: 4,
      data: points.map((point) => point.users),
      itemStyle: { color: SERIES_BLUE },
      lineStyle: { color: SERIES_BLUE, width: 2 },
      areaStyle: { color: SERIES_BLUE, opacity: 0.12 },
    },
    {
      name: "Empresas",
      type: "line",
      smooth: true,
      symbolSize: 4,
      data: points.map((point) => point.companies),
      itemStyle: { color: SERIES_CYAN },
      lineStyle: { color: SERIES_CYAN, width: 2, type: "dashed" },
    },
  ],
});
