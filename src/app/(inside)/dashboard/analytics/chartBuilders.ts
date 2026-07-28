import {
  baseGrid,
  categoryAxis,
  CHART_INK_MUTED,
  tooltipBase,
  valueAxis,
} from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";

/**
 * Formas de gráfico usadas por mais de um dos gráficos da aba. Ficam no pai
 * (e não dentro de um deles) porque são código compartilhado entre irmãos.
 * São funções puras: recebem categorias + séries já numéricas e devolvem a
 * option do ECharts, sem saber de onde os dados vieram.
 */

/** Legenda no topo, fora da área do gráfico (o grid abre espaço para ela). */
const topLegend = {
  top: 0,
  left: 0,
  icon: "roundRect" as const,
  itemWidth: 12,
  itemHeight: 12,
  textStyle: { fontSize: 12 },
};

export interface StackedSeries {
  name: string;
  color: string;
  data: number[];
}

/**
 * Barras empilhadas por categoria (tipicamente meses). Empilhar — em vez de
 * agrupar — mantém o total do mês legível de relance, que é o que interessa
 * quando as séries são partes de um todo (novos + recompra, situação dos
 * pedidos).
 */
export const buildStackedBarOption = (
  categories: string[],
  series: StackedSeries[],
  valueFormatter: (v: number) => string = String
): EChartsCoreOption => ({
  grid: { ...baseGrid, top: 40 },
  legend: topLegend,
  tooltip: {
    ...tooltipBase,
    valueFormatter: (v: unknown) => valueFormatter(Number(v)),
  },
  xAxis: { ...categoryAxis, data: categories },
  yAxis: {
    ...valueAxis,
    axisLabel: {
      ...valueAxis.axisLabel,
      formatter: (v: number) => valueFormatter(v),
    },
  },
  series: series.map((s, index) => ({
    name: s.name,
    type: "bar",
    stack: "total",
    barMaxWidth: 32,
    itemStyle: {
      color: s.color,
      // Só a última série da pilha arredonda o topo.
      borderRadius: index === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0],
    },
    data: s.data,
  })),
});

export interface BarLineSpec {
  name: string;
  color: string;
  data: number[];
  formatter: (v: number) => string;
}

/**
 * Barra (volume, eixo à esquerda) + linha (taxa/acumulado, eixo à direita).
 * Os dois eixos existem porque as grandezas não são comparáveis: contagem e
 * porcentagem no mesmo eixo achatariam uma das duas.
 */
export const buildBarLineOption = (
  categories: string[],
  bar: BarLineSpec,
  line: BarLineSpec,
  options?: { lineMax?: number }
): EChartsCoreOption => ({
  grid: { ...baseGrid, top: 40, right: 48 },
  legend: topLegend,
  tooltip: {
    ...tooltipBase,
    formatter: (params: unknown) => {
      const rows = params as { dataIndex: number }[];
      const index = rows[0]?.dataIndex ?? 0;
      return [
        categories[index],
        `${bar.name}: <b>${bar.formatter(bar.data[index] ?? 0)}</b>`,
        `${line.name}: <b>${line.formatter(line.data[index] ?? 0)}</b>`,
      ].join("<br/>");
    },
  },
  xAxis: { ...categoryAxis, data: categories },
  yAxis: [
    {
      ...valueAxis,
      axisLabel: {
        ...valueAxis.axisLabel,
        formatter: (v: number) => bar.formatter(v),
      },
    },
    {
      ...valueAxis,
      max: options?.lineMax,
      splitLine: { show: false },
      axisLabel: {
        ...valueAxis.axisLabel,
        formatter: (v: number) => line.formatter(v),
      },
    },
  ],
  series: [
    {
      name: bar.name,
      type: "bar",
      barMaxWidth: 32,
      itemStyle: { color: bar.color, borderRadius: [4, 4, 0, 0] },
      data: bar.data,
    },
    {
      name: line.name,
      type: "line",
      yAxisIndex: 1,
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 2, color: line.color },
      itemStyle: { color: line.color },
      data: line.data,
    },
  ],
});

export interface HorizontalSeries {
  name: string;
  color: string;
  data: number[];
  /**
   * Cor por barra, na mesma ordem de `data`. Sobrepõe `color` quando a cor
   * carrega significado item a item (ex.: cliente já atrasado × ainda no
   * prazo) em vez de identificar a série.
   */
  itemColors?: string[];
}

/**
 * Ranking em barras horizontais, com uma ou mais séries por linha (agrupadas).
 * Horizontal porque os rótulos são nomes de cliente/fábrica/vendedor — não
 * cabem deitados no eixo X. A ordem recebida é preservada, com o primeiro item
 * no topo.
 */
export const buildHorizontalBarOption = (
  labels: string[],
  series: HorizontalSeries[],
  valueFormatter: (v: number) => string,
  tooltipLines: (index: number) => string[]
): EChartsCoreOption => {
  // O eixo Y do ECharts cresce de baixo para cima: invertemos para que o
  // primeiro item da lista apareça no topo.
  const order = labels.map((_, index) => labels.length - 1 - index);
  const reindex = (values: number[]) => order.map((i) => values[i] ?? 0);

  return {
    grid: { ...baseGrid, top: series.length > 1 ? 40 : 24, left: 12 },
    ...(series.length > 1 ? { legend: topLegend } : {}),
    tooltip: {
      ...tooltipBase,
      formatter: (params: unknown) => {
        const rows = params as { dataIndex: number }[];
        const position = rows[0]?.dataIndex ?? 0;
        return tooltipLines(order[position]).join("<br/>");
      },
    },
    xAxis: {
      ...valueAxis,
      axisLabel: {
        ...valueAxis.axisLabel,
        formatter: (v: number) => valueFormatter(v),
      },
    },
    yAxis: { ...categoryAxis, data: order.map((i) => labels[i]) },
    series: series.map((s) => ({
      name: s.name,
      type: "bar",
      barMaxWidth: 22,
      itemStyle: { color: s.color, borderRadius: [0, 4, 4, 0] },
      data: s.itemColors
        ? order.map((i) => ({
            value: s.data[i] ?? 0,
            itemStyle: { color: s.itemColors?.[i] ?? s.color },
          }))
        : reindex(s.data),
    })),
  };
};

/** Linha de apoio para tooltips: texto secundário, em cinza. */
export const mutedLine = (text: string): string =>
  `<span style="color:${CHART_INK_MUTED}">${text}</span>`;
