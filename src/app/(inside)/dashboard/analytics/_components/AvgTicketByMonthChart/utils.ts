import {
  baseGrid,
  categoryAxis,
  CHART_INK_MUTED,
  SERIES_GREEN,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { formatCount, monthKeyToLabel } from "../../utils";
import { AvgTicketByMonthPoint } from "./interface";

/**
 * Evolução do ticket médio. Verde (e não o azul do faturamento) porque a
 * pergunta é outra: não "quanto vendemos", mas "quanto vale cada venda".
 * O tooltip traz o nº de pedidos que compõe a média — média de 2 pedidos e de
 * 200 pedidos não merecem a mesma confiança.
 */
export const buildAvgTicketByMonthOption = (
  points: AvgTicketByMonthPoint[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: {
    ...tooltipBase,
    formatter: (params: unknown) => {
      const rows = params as { dataIndex: number }[];
      const point = points[rows[0]?.dataIndex ?? 0];
      if (!point) return "";
      return [
        monthKeyToLabel(point.month),
        `Ticket médio: <b>${formatMoney(Number(point.avgTicket))}</b>`,
        `<span style="color:${CHART_INK_MUTED}">${formatCount(point.orderCount, "pedido", "pedidos")}</span>`,
      ].join("<br/>");
    },
  },
  xAxis: { ...categoryAxis, data: points.map((p) => monthKeyToLabel(p.month)) },
  yAxis: {
    ...valueAxis,
    axisLabel: {
      ...valueAxis.axisLabel,
      formatter: (v: number) => formatMoney(v),
    },
  },
  series: [
    {
      name: "Ticket médio",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 2, color: SERIES_GREEN },
      itemStyle: { color: SERIES_GREEN },
      areaStyle: { color: SERIES_GREEN, opacity: 0.12 },
      data: points.map((p) => Number(p.avgTicket)),
    },
  ],
});
