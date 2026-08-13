import {
  SERIES_BLUE,
  SERIES_GREEN,
  SERIES_ORANGE,
  baseGrid,
  categoryAxis,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";
import { PlatformGrowthPoint } from "../../interface";
import { formatMonthLabel } from "../../utils";

/**
 * Adesão e uso no mesmo eixo do tempo.
 *
 * Empresas e pessoas são barras (contagem de eventos discretos, que se
 * comparam de mês a mês); pedidos são linha em eixo próprio, porque a ordem de
 * grandeza é outra — no mesmo eixo, duas empresas novas viram uma barra
 * invisível ao lado de trezentos pedidos.
 */
export const buildGrowthOption = (
  points: PlatformGrowthPoint[]
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
    data: points.map((p) => formatMonthLabel(p.month)),
  },
  yAxis: [
    { ...valueAxis, name: "" },
    {
      ...valueAxis,
      // O eixo da direita não repete as linhas de grade do da esquerda: duas
      // grades sobrepostas em escalas diferentes só produzem ruído.
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: "Empresas novas",
      type: "bar",
      data: points.map((p) => p.newCompanies),
      itemStyle: { color: SERIES_GREEN, borderRadius: [3, 3, 0, 0] },
    },
    {
      name: "Pessoas novas",
      type: "bar",
      data: points.map((p) => p.newUsers),
      itemStyle: { color: SERIES_BLUE, borderRadius: [3, 3, 0, 0] },
    },
    {
      name: "Pedidos",
      type: "line",
      yAxisIndex: 1,
      smooth: true,
      symbolSize: 6,
      data: points.map((p) => p.orders),
      itemStyle: { color: SERIES_ORANGE },
      lineStyle: { color: SERIES_ORANGE, width: 2 },
    },
  ],
});
