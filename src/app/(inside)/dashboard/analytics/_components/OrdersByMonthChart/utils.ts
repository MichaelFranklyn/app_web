import type { EChartsCoreOption } from "echarts/core";

import {
  baseGrid,
  categoryAxis,
  SERIES_BLUE,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { monthKeyToLabel } from "../../utils";
import { OrdersByMonthPoint } from "./interface";

/** Linha de quantidade de pedidos por mês (série temporal → tendência). Linha
 * limpa (sem área) para contrastar com a área do faturamento ao lado. */
export const buildOrdersByMonthOption = (
  points: OrdersByMonthPoint[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: { ...tooltipBase },
  xAxis: {
    ...categoryAxis,
    boundaryGap: false,
    data: points.map((p) => monthKeyToLabel(p.month)),
  },
  yAxis: {
    ...valueAxis,
    minInterval: 1,
  },
  series: [
    {
      name: "Pedidos",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 2, color: SERIES_BLUE },
      itemStyle: { color: SERIES_BLUE },
      data: points.map((p) => p.count),
    },
  ],
});
