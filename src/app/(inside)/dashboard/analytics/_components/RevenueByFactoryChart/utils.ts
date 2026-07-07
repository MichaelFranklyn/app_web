import type { EChartsCoreOption } from "echarts/core";

import {
  baseGrid,
  categoryAxis,
  SERIES_BLUE,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import { RevenueByFactoryPoint } from "./interface";

/** Barra horizontal (nomes de fábrica longos), maiores no topo. */
export const buildRevenueByFactoryOption = (
  points: RevenueByFactoryPoint[]
): EChartsCoreOption => {
  // Backend devolve desc; invertemos p/ o maior aparecer no topo (eixo Y cresce p/ cima).
  const ordered = [...points].reverse();

  return {
    grid: { ...baseGrid, left: 12 },
    tooltip: {
      ...tooltipBase,
      trigger: "item",
      valueFormatter: (v: unknown) => formatMoney(Number(v)),
    },
    xAxis: {
      ...valueAxis,
      axisLabel: {
        ...valueAxis.axisLabel,
        formatter: (v: number) => formatMoney(v),
      },
    },
    yAxis: {
      ...categoryAxis,
      data: ordered.map((p) => p.factoryName),
    },
    series: [
      {
        name: "Faturamento",
        type: "bar",
        barMaxWidth: 22,
        itemStyle: { color: SERIES_BLUE, borderRadius: [0, 4, 4, 0] },
        data: ordered.map((p) => Number(p.total)),
      },
    ],
  };
};
