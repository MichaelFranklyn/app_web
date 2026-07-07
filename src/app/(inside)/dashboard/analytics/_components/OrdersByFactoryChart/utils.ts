import type { EChartsCoreOption } from "echarts/core";

import {
  CHART_INK_MUTED,
  CHART_PALETTE,
  CHART_SURFACE,
  tooltipBase,
} from "@/components/Chart/chartTheme";
import { formatNumber } from "@/utils/format/masks";
import { OrderCountPoint } from "./interface";

/**
 * Rosca (donut) de participação das fábricas no nº de pedidos. Escolhido em vez
 * de barra para mostrar composição — quanto cada fábrica pesa no total. Poucas
 * fábricas, então a rosca fica legível. Rótulo central some (limpo); tooltip e
 * legenda trazem os nomes.
 */
export const buildOrdersByFactoryDonutOption = (
  points: OrderCountPoint[]
): EChartsCoreOption => {
  const total = points.reduce((sum, p) => sum + p.orderCount, 0);

  return {
    color: CHART_PALETTE,
    tooltip: {
      ...tooltipBase,
      trigger: "item",
      formatter: (params: unknown) => {
        const { name, value } = params as { name: string; value: number };
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        return [
          name,
          `Pedidos: <b>${formatNumber(value)}</b>`,
          `<span style="color:${CHART_INK_MUTED}">${pct}% do total</span>`,
        ].join("<br/>");
      },
    },
    legend: {
      type: "scroll",
      bottom: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: CHART_INK_MUTED, fontSize: 12 },
    },
    series: [
      {
        name: "Pedidos por fábrica",
        type: "pie",
        radius: ["48%", "72%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: CHART_SURFACE,
          borderWidth: 2,
          borderRadius: 4,
        },
        label: { show: false },
        labelLine: { show: false },
        data: points.map((p) => ({ name: p.entityName, value: p.orderCount })),
      },
    ],
  };
};
