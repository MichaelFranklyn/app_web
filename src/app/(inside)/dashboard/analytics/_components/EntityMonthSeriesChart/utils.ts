import {
  baseGrid,
  categoryAxis,
  CHART_PALETTE,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { monthKeyToLabel } from "../../utils";
import { EntityMonthPoint, PivotedSeries } from "./interface";

/**
 * Vira as linhas (mês, entidade) em séries contínuas.
 *
 * O eixo passa a ter TODOS os meses presentes na resposta, e cada entidade
 * recebe um valor para cada um deles — zero nos meses em que não vendeu. Sem
 * esse preenchimento a linha "pularia" o mês vazio e ligaria dois meses não
 * adjacentes, sugerindo uma continuidade que não existiu.
 */
export const pivotEntityMonths = (rows: EntityMonthPoint[]): PivotedSeries => {
  const months = [...new Set(rows.map((r) => r.month))].sort();
  const monthIndex = new Map(months.map((m, index) => [m, index]));

  const byEntity = new Map<string, { name: string; values: number[] }>();
  for (const row of rows) {
    const entry = byEntity.get(row.entityId) ?? {
      name: row.entityName,
      values: Array(months.length).fill(0),
    };
    entry.values[monthIndex.get(row.month) ?? 0] = Number(row.total) || 0;
    byEntity.set(row.entityId, entry);
  }

  // Maior faturamento no período primeiro: a ordem da legenda passa a ser a
  // ordem de importância, e as cores ficam estáveis entre recargas.
  const series = [...byEntity.entries()]
    .map(([entityId, entry]) => ({
      entityId,
      entityName: entry.name,
      values: entry.values,
    }))
    .sort(
      (a, b) =>
        b.values.reduce((sum, v) => sum + v, 0) -
        a.values.reduce((sum, v) => sum + v, 0)
    );

  return { months, series };
};

/**
 * Uma linha por entidade ao longo dos meses. É o gráfico que responde "quem
 * está subindo e quem está caindo" — o ranking do período inteiro esconde
 * exatamente isso.
 */
export const buildEntityMonthSeriesOption = ({
  months,
  series,
}: PivotedSeries): EChartsCoreOption => ({
  grid: { ...baseGrid, top: 40 },
  legend: {
    top: 0,
    left: 0,
    icon: "roundRect",
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { fontSize: 12 },
  },
  tooltip: {
    ...tooltipBase,
    valueFormatter: (v: unknown) => formatMoney(Number(v)),
  },
  xAxis: {
    ...categoryAxis,
    boundaryGap: false,
    data: months.map(monthKeyToLabel),
  },
  yAxis: {
    ...valueAxis,
    axisLabel: {
      ...valueAxis.axisLabel,
      formatter: (v: number) => formatMoney(v),
    },
  },
  series: series.map((serie, index) => {
    const color = CHART_PALETTE[index % CHART_PALETTE.length];
    return {
      name: serie.entityName,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      data: serie.values,
    };
  }),
});
