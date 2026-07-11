import type { EChartsCoreOption } from "echarts/core";

import { CHART_INK, CHART_INK_MUTED } from "@/components/Chart/chartTheme";

/** Preferências de exibição que o usuário controla pelo menu do gráfico. */
export interface ChartPrefs {
  showLabel: boolean;
  showLegend: boolean;
  showGrid: boolean;
  /** Índice da variação de forma (0 = como o gráfico foi construído). */
  variant: number;
}

/** Padrão: sem rótulos, com grade, forma base. Legenda é decidida por gráfico. */
export const DEFAULT_CHART_PREFS: ChartPrefs = {
  showLabel: false,
  showLegend: true,
  showGrid: true,
  variant: 0,
};

/** O que este gráfico permite personalizar (define quais itens o menu mostra). */
export interface ChartCapabilities {
  hasLegend: boolean;
  hasAxes: boolean;
  /** Rótulos das variações de forma (vazio ou 1 = sem opção de trocar). */
  variants: string[];
}

/** Eixo do ECharts do qual extraímos tipo e formatter (parcial). */
interface AxisLike {
  type?: string;
  axisLabel?: { formatter?: (v: number) => string };
}

const seriesOf = (option: EChartsCoreOption): Record<string, unknown>[] => {
  const s = (option as Record<string, unknown>).series;
  return (Array.isArray(s) ? s : []) as Record<string, unknown>[];
};

const namedSeries = (option: EChartsCoreOption): string[] => [
  ...new Set(
    seriesOf(option)
      .map((s) => s.name)
      .filter(Boolean) as string[]
  ),
];

// ── Variações de forma (dentro do mesmo tipo) ─────────────────────────────
/**
 * Rótulos das variações disponíveis conforme o tipo do gráfico. O índice 0 é
 * sempre a forma como o gráfico foi construído. Máximo de 2.
 */
export const chartVariants = (option: EChartsCoreOption): string[] => {
  const o = option as Record<string, unknown>;
  const first = seriesOf(option)[0];
  if (!first) return [];

  if (first.type === "line") {
    const hasArea = seriesOf(option).some((s) => s.areaStyle != null);
    return hasArea ? ["Área", "Linha"] : ["Linha", "Área"];
  }
  if (first.type === "pie") return ["Rosca", "Pizza"];
  if (first.type === "bar") {
    const horizontal = (o.xAxis as AxisLike | undefined)?.type === "value";
    return horizontal
      ? ["Barras horizontais", "Barras verticais"]
      : ["Barras verticais", "Barras horizontais"];
  }
  return [];
};

const rotateBar = (option: EChartsCoreOption): EChartsCoreOption => {
  const o = option as Record<string, unknown>;
  const oldYIsValue = (o.yAxis as AxisLike | undefined)?.type === "value";
  // Após trocar os eixos, fica horizontal se o novo eixo X (antigo Y) é de valor.
  const borderRadius = oldYIsValue ? [0, 4, 4, 0] : [4, 4, 0, 0];
  const series = seriesOf(option).map((s) =>
    s.type === "bar"
      ? {
          ...s,
          itemStyle: { ...(s.itemStyle as object | undefined), borderRadius },
        }
      : s
  );
  return {
    ...option,
    xAxis: o.yAxis,
    yAxis: o.xAxis,
    series,
  } as EChartsCoreOption;
};

/** Aplica a variação de forma escolhida (índice 0 = base, sem mudança). */
export const applyVariant = (
  option: EChartsCoreOption,
  index: number
): EChartsCoreOption => {
  if (!index) return option;
  const first = seriesOf(option)[0];
  if (!first) return option;

  if (first.type === "line") {
    const hasArea = seriesOf(option).some((s) => s.areaStyle != null);
    const series = seriesOf(option).map((s) => {
      if (s.type !== "line") return s;
      if (hasArea) {
        const { areaStyle: _drop, ...rest } = s;
        void _drop;
        return rest;
      }
      const color = ((s.lineStyle as { color?: string } | undefined)?.color ??
        (s.itemStyle as { color?: string } | undefined)?.color) as
        | string
        | undefined;
      return {
        ...s,
        areaStyle: { opacity: 0.12, ...(color ? { color } : {}) },
      };
    });
    return { ...option, series } as EChartsCoreOption;
  }

  if (first.type === "pie") {
    const series = seriesOf(option).map((s) => {
      if (s.type !== "pie") return s;
      const outer = Array.isArray(s.radius) ? s.radius[1] : (s.radius ?? "72%");
      return { ...s, radius: ["0%", outer] };
    });
    return { ...option, series } as EChartsCoreOption;
  }

  if (first.type === "bar") return rotateBar(option);

  return option;
};

export const chartCapabilities = (
  option: EChartsCoreOption
): ChartCapabilities => {
  const o = option as Record<string, unknown>;
  return {
    hasLegend: o.legend != null || namedSeries(option).length > 0,
    hasAxes: o.xAxis != null || o.yAxis != null,
    variants: chartVariants(option),
  };
};

/**
 * Default de legenda por gráfico: liga quando há legenda nativa (rosca,
 * comissões) ou 2+ séries; série única começa sem (o título já identifica).
 */
export const defaultShowLegend = (option: EChartsCoreOption): boolean => {
  const o = option as Record<string, unknown>;
  if (o.legend != null) return true;
  return seriesOf(option).length >= 2;
};

// ── Rótulos de dados ──────────────────────────────────────────────────────
const withDataLabels = (
  option: EChartsCoreOption,
  show: boolean
): EChartsCoreOption => {
  if (!show) return option;

  const o = option as Record<string, unknown>;
  const series = seriesOf(option);

  const xAxis = o.xAxis as AxisLike | undefined;
  const yAxis = o.yAxis as AxisLike | undefined;
  const horizontal = xAxis?.type === "value";
  const valueAxis =
    xAxis?.type === "value"
      ? xAxis
      : yAxis?.type === "value"
        ? yAxis
        : undefined;
  const valueFmt = valueAxis?.axisLabel?.formatter;

  const labeled = series.map((serie) => {
    if (serie.type === "pie") {
      return {
        ...serie,
        label: {
          show: true,
          color: CHART_INK,
          fontSize: 11,
          formatter: "{b}: {c}",
        },
        labelLine: { show: true, length: 8, length2: 8 },
      };
    }

    return {
      ...serie,
      label: {
        show: true,
        position: horizontal ? "right" : "top",
        color: CHART_INK,
        fontSize: 11,
        formatter: valueFmt
          ? (p: { value: number }) => valueFmt(Number(p.value))
          : undefined,
      },
    };
  });

  return { ...option, series: labeled } as EChartsCoreOption;
};

// ── Legenda (usa a nativa quando existe; senão cria a partir dos nomes) ────
const withLegend = (
  option: EChartsCoreOption,
  show: boolean
): EChartsCoreOption => {
  const o = option as Record<string, unknown>;
  const hasNative = o.legend != null;

  if (!show) {
    return hasNative
      ? ({
          ...option,
          legend: { ...(o.legend as object), show: false },
        } as EChartsCoreOption)
      : option;
  }

  if (hasNative) {
    return {
      ...option,
      legend: { ...(o.legend as object), show: true },
    } as EChartsCoreOption;
  }

  const names = namedSeries(option);
  if (names.length === 0) return option;

  const grid = o.grid as Record<string, unknown> | undefined;
  const topBase = typeof grid?.top === "number" ? grid.top : 24;
  return {
    ...option,
    legend: {
      top: 0,
      left: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12, color: CHART_INK_MUTED },
      data: names,
    },
    grid: { ...(grid ?? {}), top: Math.max(topBase, 32) },
  } as EChartsCoreOption;
};

// ── Linhas de grade (splitLine dos eixos) ─────────────────────────────────
const withGridLines = (
  option: EChartsCoreOption,
  show: boolean
): EChartsCoreOption => {
  if (show) return option;
  const o = option as Record<string, unknown>;
  const hide = (axis: unknown) =>
    axis ? { ...(axis as object), splitLine: { show: false } } : axis;

  const patch: Record<string, unknown> = {};
  if (o.xAxis != null) patch.xAxis = hide(o.xAxis);
  if (o.yAxis != null) patch.yAxis = hide(o.yAxis);
  return { ...option, ...patch } as EChartsCoreOption;
};

/**
 * Aplica variação de forma + preferências de exibição a uma option do ECharts.
 * Função pura e componível — os gráficos não sabem que isso existe; quem
 * orquestra é o card. A variação vem primeiro para que rótulos/orientação se
 * adaptem à forma escolhida.
 */
export const customizeChart = (
  option: EChartsCoreOption,
  prefs: ChartPrefs
): EChartsCoreOption => {
  let o = applyVariant(option, prefs.variant);
  o = withDataLabels(o, prefs.showLabel);
  o = withLegend(o, prefs.showLegend);
  o = withGridLines(o, prefs.showGrid);
  return o;
};

/** "Faturamento por fábrica" → "faturamento-por-fabrica" (nome do arquivo). */
export const chartFilename = (title: string): string =>
  title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Extrai os dados da option numa matriz pronta para CSV (cabeçalho + linhas).
 * Cobre rosca ({name,value}) e gráficos com eixo de categoria (mês/entidade)
 * com uma ou mais séries. Devolve `[]` quando não há o que exportar.
 */
export const optionToRows = (option: EChartsCoreOption): string[][] => {
  const o = option as Record<string, unknown>;
  const series = seriesOf(option);
  if (series.length === 0) return [];

  if (series[0]?.type === "pie") {
    const pieData = (Array.isArray(series[0].data) ? series[0].data : []) as {
      name?: string;
      value?: number;
    }[];
    return [
      ["Item", "Valor"],
      ...pieData.map((d) => [String(d.name ?? ""), String(d.value ?? "")]),
    ];
  }

  const xAxis = o.xAxis as { type?: string; data?: unknown[] } | undefined;
  const yAxis = o.yAxis as { type?: string; data?: unknown[] } | undefined;
  const catAxis =
    xAxis?.type === "category"
      ? xAxis
      : yAxis?.type === "category"
        ? yAxis
        : undefined;
  const categories = Array.isArray(catAxis?.data) ? catAxis.data : [];

  const header = [
    "Categoria",
    ...series.map((s, i) => String(s.name ?? `Série ${i + 1}`)),
  ];
  const rows = categories.map((c, i) => [
    String(c ?? ""),
    ...series.map((s) => {
      const seriesValues = s.data as unknown[] | undefined;
      return String(seriesValues?.[i] ?? "");
    }),
  ]);
  return [header, ...rows];
};
