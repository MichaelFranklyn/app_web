import type { EChartsCoreOption } from "echarts/core";

import {
  baseGrid,
  categoryAxis,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import { CHART_INK_MUTED } from "@/components/Chart/chartTheme";
import { EntityPoint, EntityValueKey, RawEntityRow } from "./interface";

/** Normaliza as linhas do backend para pontos do gráfico (valor numérico). */
export const toEntityPoints = (
  rows: RawEntityRow[],
  valueKey: EntityValueKey
): EntityPoint[] =>
  rows.map((r) => ({
    entityName: r.entityName,
    value: Number(r[valueKey] ?? 0),
    orderCount: r.orderCount,
  }));

interface RankingOptions {
  valueFormatter: (v: number) => string;
  seriesName: string;
  color: string;
}

/**
 * Barra horizontal de ranking por entidade (nomes longos no eixo Y). O backend
 * já devolve na ordem certa (1º = mais relevante); invertemos p/ ele aparecer no
 * topo. Tooltip mostra o valor + nº de pedidos que compõem a média.
 */
export const buildEntityRankingOption = (
  points: EntityPoint[],
  { valueFormatter, seriesName, color }: RankingOptions
): EChartsCoreOption => {
  const ordered = [...points].reverse();

  return {
    grid: { ...baseGrid, left: 12 },
    tooltip: {
      ...tooltipBase,
      trigger: "item",
      formatter: (params: unknown) => {
        const { dataIndex } = params as { dataIndex: number };
        const row = ordered[dataIndex];
        if (!row) return "";
        return [
          row.entityName,
          `${seriesName}: <b>${valueFormatter(row.value)}</b>`,
          `<span style="color:${CHART_INK_MUTED}">${row.orderCount} pedidos</span>`,
        ].join("<br/>");
      },
    },
    xAxis: {
      ...valueAxis,
      axisLabel: {
        ...valueAxis.axisLabel,
        formatter: (v: number) => valueFormatter(v),
      },
    },
    yAxis: {
      ...categoryAxis,
      data: ordered.map((r) => r.entityName),
    },
    series: [
      {
        name: seriesName,
        type: "bar",
        barMaxWidth: 22,
        itemStyle: { color, borderRadius: [0, 4, 4, 0] },
        data: ordered.map((r) => r.value),
      },
    ],
  };
};
