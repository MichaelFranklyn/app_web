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
 *
 * `tooltipLines` assume o tooltip quando a leitura precisa de algo que não está
 * desenhado — a fatia que uma das partes representa, o dinheiro por trás da
 * contagem. Sem ele, o tooltip lista as séries com o `valueFormatter`.
 */
export const buildStackedBarOption = (
  categories: string[],
  series: StackedSeries[],
  valueFormatter: (v: number) => string = String,
  tooltipLines?: (index: number) => string[]
): EChartsCoreOption => ({
  grid: { ...baseGrid, top: 40 },
  legend: topLegend,
  tooltip: {
    ...tooltipBase,
    ...(tooltipLines
      ? {
          formatter: (params: unknown) => {
            const rows = params as { dataIndex: number }[];
            return tooltipLines(rows[0]?.dataIndex ?? 0).join("<br/>");
          },
        }
      : { valueFormatter: (v: unknown) => valueFormatter(Number(v)) }),
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

/**
 * Barra vertical por categoria, com o tooltip escrito pelo chamador.
 *
 * Difere de `buildStackedBarOption` no tooltip: aqui a linha de apoio costuma
 * ser outra grandeza (a fatia do total, o dinheiro daquela barra), que não é o
 * valor desenhado e por isso não sai de um `valueFormatter`.
 *
 * Vertical (e não deitada) porque as categorias são uma escala com ordem
 * natural — faixas de valor da menor para a maior, dias de segunda a domingo —
 * e a ordem se lê da esquerda para a direita.
 */
export const buildVerticalBarOption = (
  categories: string[],
  series: { name: string; color: string; data: number[] },
  valueFormatter: (v: number) => string,
  tooltipLines: (index: number) => string[]
): EChartsCoreOption => ({
  grid: baseGrid,
  tooltip: {
    ...tooltipBase,
    formatter: (params: unknown) => {
      const rows = params as { dataIndex: number }[];
      return tooltipLines(rows[0]?.dataIndex ?? 0).join("<br/>");
    },
  },
  xAxis: { ...categoryAxis, data: categories },
  yAxis: {
    ...valueAxis,
    minInterval: 1,
    axisLabel: {
      ...valueAxis.axisLabel,
      formatter: (v: number) => valueFormatter(v),
    },
  },
  series: [
    {
      name: series.name,
      type: "bar",
      barMaxWidth: 44,
      itemStyle: { color: series.color, borderRadius: [4, 4, 0, 0] },
      data: series.data,
    },
  ],
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

export interface MonthLineSeries {
  name: string;
  color: string;
  data: number[];
}

/**
 * Uma linha por série ao longo dos meses (o eixo X já vem rotulado). É a forma
 * de responder "como isso vem se comportando mês a mês" quando as séries
 * convivem no mesmo gráfico para serem comparadas — quem sobe, quem cai, quem
 * ficou parado.
 */
export const buildMonthLinesOption = (
  monthLabels: string[],
  series: MonthLineSeries[],
  valueFormatter: (v: number) => string
): EChartsCoreOption => ({
  grid: { ...baseGrid, top: 40 },
  legend: topLegend,
  tooltip: {
    ...tooltipBase,
    valueFormatter: (v: unknown) => valueFormatter(Number(v)),
  },
  xAxis: { ...categoryAxis, boundaryGap: false, data: monthLabels },
  yAxis: {
    ...valueAxis,
    axisLabel: {
      ...valueAxis.axisLabel,
      formatter: (v: number) => valueFormatter(v),
    },
  },
  series: series.map((s) => ({
    name: s.name,
    type: "line",
    smooth: true,
    symbol: "circle",
    symbolSize: 7,
    lineStyle: { width: 2, color: s.color },
    itemStyle: { color: s.color },
    data: s.data,
  })),
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
 *
 * Com `stacked`, as séries viram uma única barra por linha: use quando elas são
 * partes de um mesmo total (recebido + a receber, faixas de atraso) e o
 * comprimento da barra inteira precisa ser lido de relance. Sem isso, cada
 * série ganha sua própria barra ao lado — o certo quando as grandezas se
 * comparam mas não somam.
 */
export const buildHorizontalBarOption = (
  labels: string[],
  series: HorizontalSeries[],
  valueFormatter: (v: number) => string,
  tooltipLines: (index: number) => string[],
  options?: { stacked?: boolean }
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
    series: series.map((s, index) => ({
      name: s.name,
      type: "bar",
      barMaxWidth: 22,
      ...(options?.stacked ? { stack: "total" } : {}),
      itemStyle: {
        color: s.color,
        // Empilhado: só a última série arredonda a ponta da barra.
        borderRadius:
          options?.stacked && index !== series.length - 1
            ? [0, 0, 0, 0]
            : [0, 4, 4, 0],
      },
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
