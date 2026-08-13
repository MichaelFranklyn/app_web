import {
  SERIES_BLUE,
  SERIES_RED,
  baseGrid,
  categoryAxis,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";
import { OperationPulsePoint } from "../../interface";
import { formatDayLabel } from "../../../utils";

/**
 * Latência e falha no mesmo eixo do tempo.
 *
 * O p95 é linha em eixo próprio porque a ordem de grandeza não é a das falhas —
 * juntos, três erros ao lado de 900ms virariam uma linha colada no chão. As
 * falhas são barra vermelha: são eventos discretos, e é o degrau delas que se
 * procura.
 *
 * O que este gráfico responde e a tabela de operações não: DESDE QUANDO. Um
 * degrau que começa numa terça diz onde procurar — costuma ser o deploy daquele
 * dia.
 */
export const buildTrendOption = (
  points: OperationPulsePoint[]
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
    data: points.map((point) => formatDayLabel(point.day)),
  },
  yAxis: [
    { ...valueAxis, minInterval: 1 },
    {
      ...valueAxis,
      axisLabel: { ...valueAxis.axisLabel, formatter: "{value}ms" },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: "Falhas",
      type: "bar",
      data: points.map((point) => point.errors),
      // Teto de largura: com um dia só na janela, a barra do ECharts se estica
      // pela categoria inteira e uma única falha vira um bloco vermelho do
      // tamanho do gráfico — alarme visual sem nada por trás.
      barMaxWidth: 24,
      itemStyle: { color: SERIES_RED, borderRadius: [3, 3, 0, 0] },
    },
    {
      name: "p95",
      type: "line",
      yAxisIndex: 1,
      smooth: true,
      symbolSize: 4,
      data: points.map((point) => point.p95Ms),
      itemStyle: { color: SERIES_BLUE },
      lineStyle: { color: SERIES_BLUE, width: 2 },
    },
  ],
});
