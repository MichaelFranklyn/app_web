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

/** Barra de quantidade de pedidos por mês (1 série → hue azul). */
export const buildOrdersByMonthOption = (
  points: OrdersByMonthPoint[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: { ...tooltipBase },
  xAxis: {
    ...categoryAxis,
    data: points.map((p) => monthKeyToLabel(p.month)),
  },
  yAxis: {
    ...valueAxis,
    minInterval: 1,
  },
  series: [
    {
      name: "Pedidos",
      type: "bar",
      barMaxWidth: 28,
      itemStyle: { color: SERIES_BLUE, borderRadius: [4, 4, 0, 0] },
      data: points.map((p) => p.count),
    },
  ],
});
