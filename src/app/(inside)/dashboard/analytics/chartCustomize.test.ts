import type { EChartsCoreOption } from "echarts/core";
import { describe, expect, it } from "vitest";

import {
  applyVariant,
  chartCapabilities,
  chartFilename,
  chartVariants,
  customizeChart,
  DEFAULT_CHART_PREFS,
  defaultShowLegend,
  optionToRows,
} from "./chartCustomize";

const getSeries = (option: EChartsCoreOption) =>
  (option as { series: Record<string, unknown>[] }).series;

const barHorizontal = () =>
  ({
    xAxis: { type: "value", axisLabel: { formatter: (v: number) => `R$${v}` } },
    yAxis: { type: "category", data: ["A", "B"], splitLine: { show: true } },
    legend: { top: 0 },
    series: [{ name: "Faturamento", type: "bar", data: [10, 20] }],
  }) as EChartsCoreOption;

const lineArea = () =>
  ({
    xAxis: { type: "category", data: ["jan", "fev"] },
    yAxis: { type: "value" },
    series: [
      {
        name: "Faturamento",
        type: "line",
        lineStyle: { color: "#2563c4" },
        areaStyle: { opacity: 0.12 },
        data: [10, 20],
      },
    ],
  }) as EChartsCoreOption;

const lineOnly = () =>
  ({
    xAxis: { type: "category", data: ["jan", "fev"] },
    yAxis: { type: "value" },
    series: [{ name: "Pedidos", type: "line", data: [3, 5] }],
  }) as EChartsCoreOption;

const donut = () =>
  ({
    legend: {},
    series: [
      { name: "Pedidos", type: "pie", radius: ["48%", "72%"], data: [] },
    ],
  }) as EChartsCoreOption;

describe("chartCapabilities", () => {
  it("barra: legenda, eixos e variação horizontal/vertical", () => {
    expect(chartCapabilities(barHorizontal())).toEqual({
      hasLegend: true,
      hasAxes: true,
      variants: ["Barras horizontais", "Barras verticais"],
    });
  });

  it("rosca: legenda, sem eixos, variação rosca/pizza", () => {
    expect(chartCapabilities(donut())).toEqual({
      hasLegend: true,
      hasAxes: false,
      variants: ["Rosca", "Pizza"],
    });
  });

  it("série única sem legenda nativa ainda oferece o toggle de legenda", () => {
    expect(chartCapabilities(lineOnly()).hasLegend).toBe(true);
  });
});

describe("chartVariants", () => {
  it("linha com área começa em Área", () => {
    expect(chartVariants(lineArea())).toEqual(["Área", "Linha"]);
  });
  it("linha sem área começa em Linha", () => {
    expect(chartVariants(lineOnly())).toEqual(["Linha", "Área"]);
  });
});

describe("applyVariant", () => {
  it("índice 0 devolve a option original", () => {
    const opt = lineOnly();
    expect(applyVariant(opt, 0)).toBe(opt);
  });

  it("linha → área adiciona areaStyle herdando a cor da linha", () => {
    const opt = applyVariant(lineOnly(), 1);
    const area = getSeries(opt)[0].areaStyle as { opacity: number };
    expect(area.opacity).toBe(0.12);
  });

  it("área → linha remove o areaStyle", () => {
    const opt = applyVariant(lineArea(), 1);
    expect(getSeries(opt)[0].areaStyle).toBeUndefined();
  });

  it("rosca → pizza zera o raio interno", () => {
    const opt = applyVariant(donut(), 1);
    expect(getSeries(opt)[0].radius).toEqual(["0%", "72%"]);
  });

  it("barra horizontal → vertical troca os eixos", () => {
    const opt = applyVariant(barHorizontal(), 1) as {
      xAxis: { type: string };
      yAxis: { type: string };
    };
    expect(opt.xAxis.type).toBe("category");
    expect(opt.yAxis.type).toBe("value");
  });
});

describe("defaultShowLegend", () => {
  it("liga com legenda nativa", () => {
    expect(defaultShowLegend(donut())).toBe(true);
  });
  it("desliga em série única sem legenda nativa", () => {
    expect(defaultShowLegend(lineOnly())).toBe(false);
  });
});

describe("customizeChart", () => {
  it("com o padrão não liga rótulos", () => {
    const opt = customizeChart(barHorizontal(), DEFAULT_CHART_PREFS);
    expect(getSeries(opt)[0].label).toBeUndefined();
  });

  it("liga rótulos reusando o formatter do eixo de valor", () => {
    const opt = customizeChart(barHorizontal(), {
      ...DEFAULT_CHART_PREFS,
      showLabel: true,
    });
    const label = getSeries(opt)[0].label as {
      show: boolean;
      position: string;
      formatter: (p: { value: number }) => string;
    };
    expect(label.show).toBe(true);
    expect(label.position).toBe("right");
    expect(label.formatter({ value: 10 })).toBe("R$10");
  });

  it("oculta a legenda quando showLegend=false", () => {
    const opt = customizeChart(barHorizontal(), {
      ...DEFAULT_CHART_PREFS,
      showLegend: false,
    });
    expect((opt as { legend: { show: boolean } }).legend.show).toBe(false);
  });

  it("cria legenda em série única quando showLegend=true", () => {
    const opt = customizeChart(lineOnly(), {
      ...DEFAULT_CHART_PREFS,
      showLegend: true,
    });
    const legend = (opt as { legend?: { data: string[] } }).legend;
    expect(legend?.data).toEqual(["Pedidos"]);
  });

  it("oculta as linhas de grade quando showGrid=false", () => {
    const opt = customizeChart(barHorizontal(), {
      ...DEFAULT_CHART_PREFS,
      showGrid: false,
    });
    const yAxis = (opt as { yAxis: { splitLine: { show: boolean } } }).yAxis;
    expect(yAxis.splitLine.show).toBe(false);
  });

  it("variante vertical faz o rótulo ir para o topo", () => {
    const opt = customizeChart(barHorizontal(), {
      ...DEFAULT_CHART_PREFS,
      showLabel: true,
      variant: 1,
    });
    const label = getSeries(opt)[0].label as { position: string };
    expect(label.position).toBe("top");
  });
});

describe("optionToRows", () => {
  it("exporta rosca como Item/Valor", () => {
    const pie = {
      series: [
        {
          type: "pie",
          data: [
            { name: "Real PE", value: 30 },
            { name: "CimNor", value: 10 },
          ],
        },
      ],
    } as EChartsCoreOption;
    expect(optionToRows(pie)).toEqual([
      ["Item", "Valor"],
      ["Real PE", "30"],
      ["CimNor", "10"],
    ]);
  });

  it("exporta barra com eixo de categoria + séries nomeadas", () => {
    expect(optionToRows(barHorizontal())).toEqual([
      ["Categoria", "Faturamento"],
      ["A", "10"],
      ["B", "20"],
    ]);
  });
});

describe("chartFilename", () => {
  it("remove acentos e normaliza para kebab-case", () => {
    expect(chartFilename("Faturamento por fábrica")).toBe(
      "faturamento-por-fabrica"
    );
  });

  it("colapsa separadores e apara as pontas", () => {
    expect(chartFilename("  Comissões: a receber / recebidas  ")).toBe(
      "comissoes-a-receber-recebidas"
    );
  });
});
