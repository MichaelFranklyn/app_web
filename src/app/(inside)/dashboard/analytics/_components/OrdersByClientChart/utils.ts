import type { EChartsCoreOption } from "echarts/core";

import {
  baseGrid,
  categoryAxis,
  SERIES_GREEN,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { formatNumber } from "@/utils/format/masks";
import { OrderCountPoint } from "./interface";

/**
 * Barra horizontal do nº de pedidos por cliente (nomes longos no eixo Y,
 * podem ser muitos). Backend devolve desc; invertemos p/ o maior no topo.
 */
export const buildOrdersByClientOption = (
  points: OrderCountPoint[]
): EChartsCoreOption => {
  const ordered = [...points].reverse();

  return {
    grid: { ...baseGrid, left: 12 },
    tooltip: {
      ...tooltipBase,
      trigger: "item",
      valueFormatter: (v: unknown) => `${formatNumber(Number(v))} pedidos`,
    },
    xAxis: {
      ...valueAxis,
      minInterval: 1,
      axisLabel: {
        ...valueAxis.axisLabel,
        formatter: (v: number) => formatNumber(v),
      },
    },
    yAxis: {
      ...categoryAxis,
      data: ordered.map((p) => p.entityName),
    },
    series: [
      {
        name: "Pedidos",
        type: "bar",
        barMaxWidth: 22,
        itemStyle: { color: SERIES_GREEN, borderRadius: [0, 4, 4, 0] },
        data: ordered.map((p) => p.orderCount),
      },
    ],
  };
};
