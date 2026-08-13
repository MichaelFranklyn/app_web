import {
  SERIES_BLUE,
  baseGrid,
  categoryAxis,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";
import { ActivitySummaryItem } from "../../../../interface";
import { formatDayLabel } from "../../../../utils";

/**
 * Uso da empresa dia a dia.
 *
 * Linha com área, não as barras empilhadas do pulso da plataforma: aqui o que
 * se lê é a TENDÊNCIA de uma empresa só — está aumentando, sumindo, ou parou
 * de um dia para o outro. A linha mostra a inclinação; a barra mostraria bem o
 * valor de cada dia e mal a direção, que é o contrário do que se quer.
 *
 * Erro não entra: nesta leitura ele é ruído. Quem investiga defeito abre a
 * saúde das operações.
 */
export const buildTenantActivityOption = (
  points: ActivitySummaryItem[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: tooltipBase,
  xAxis: { ...categoryAxis, data: points.map((p) => formatDayLabel(p.key)) },
  yAxis: valueAxis,
  series: [
    {
      name: "Ações",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: points.map((p) => p.total),
      itemStyle: { color: SERIES_BLUE },
      areaStyle: { opacity: 0.12 },
    },
  ],
});
