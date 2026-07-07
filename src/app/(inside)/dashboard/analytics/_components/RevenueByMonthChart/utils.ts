import type { EChartsCoreOption } from "echarts/core";

import { formatMoney } from "@/utils/format/masks";
import {
  baseGrid,
  categoryAxis,
  SERIES_BLUE,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { monthKeyToLabel } from "../../utils";
import { RevenueByMonthPoint } from "./interface";

/** Área/linha de faturamento por mês (1 série → hue azul, sem legenda). */
export const buildRevenueByMonthOption = (
  points: RevenueByMonthPoint[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: {
    ...tooltipBase,
    valueFormatter: (v: unknown) => formatMoney(Number(v)),
  },
  xAxis: {
    ...categoryAxis,
    data: points.map((p) => monthKeyToLabel(p.month)),
  },
  yAxis: {
    ...valueAxis,
    axisLabel: {
      ...valueAxis.axisLabel,
      formatter: (v: number) => formatMoney(v),
    },
  },
  series: [
    {
      name: "Faturamento",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 2, color: SERIES_BLUE },
      itemStyle: { color: SERIES_BLUE },
      areaStyle: { color: SERIES_BLUE, opacity: 0.12 },
      data: points.map((p) => Number(p.total)),
    },
  ],
});
