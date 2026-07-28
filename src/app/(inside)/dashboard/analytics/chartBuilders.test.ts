import { describe, expect, it } from "vitest";

import {
  buildBarLineOption,
  buildHorizontalBarOption,
  buildStackedBarOption,
} from "./chartBuilders";

/** Acesso tipado ao que interessa checar dentro da option do ECharts. */
const seriesOf = (option: unknown) =>
  (option as { series: Record<string, unknown>[] }).series;
const axisData = (axis: unknown) => (axis as { data: unknown[] }).data;

describe("buildStackedBarOption", () => {
  it("empilha todas as séries na mesma pilha", () => {
    const option = buildStackedBarOption(
      ["jan", "fev"],
      [
        { name: "A", color: "#111", data: [1, 2] },
        { name: "B", color: "#222", data: [3, 4] },
      ]
    );
    expect(seriesOf(option).map((s) => s.stack)).toEqual(["total", "total"]);
  });

  it("só a série do topo arredonda o canto", () => {
    const option = buildStackedBarOption(
      ["jan"],
      [
        { name: "A", color: "#111", data: [1] },
        { name: "B", color: "#222", data: [2] },
      ]
    );
    const radii = seriesOf(option).map(
      (s) => (s.itemStyle as { borderRadius: number[] }).borderRadius
    );
    expect(radii).toEqual([
      [0, 0, 0, 0],
      [4, 4, 0, 0],
    ]);
  });
});

describe("buildBarLineOption", () => {
  it("põe a linha no segundo eixo para não ser achatada pela barra", () => {
    const option = buildBarLineOption(
      ["jan"],
      { name: "Volume", color: "#111", data: [100], formatter: String },
      { name: "Taxa", color: "#222", data: [0.5], formatter: String }
    );
    const [bar, line] = seriesOf(option);
    expect(bar.yAxisIndex).toBeUndefined();
    expect(line.yAxisIndex).toBe(1);
  });

  it("aplica o teto do eixo da linha quando informado", () => {
    const option = buildBarLineOption(
      ["jan"],
      { name: "Volume", color: "#111", data: [100], formatter: String },
      { name: "Taxa", color: "#222", data: [0.5], formatter: String },
      { lineMax: 1 }
    );
    // Sem teto, uma taxa de 50% ocuparia o eixo inteiro e pareceria 100%.
    const [, rightAxis] = (option as { yAxis: { max?: number }[] }).yAxis;
    expect(rightAxis.max).toBe(1);
  });
});

describe("buildHorizontalBarOption", () => {
  it("inverte a ordem para o primeiro item aparecer no topo", () => {
    // O eixo Y do ECharts cresce de baixo para cima.
    const option = buildHorizontalBarOption(
      ["Primeiro", "Segundo", "Terceiro"],
      [{ name: "V", color: "#111", data: [3, 2, 1] }],
      String,
      () => []
    );
    expect(axisData((option as { yAxis: unknown }).yAxis)).toEqual([
      "Terceiro",
      "Segundo",
      "Primeiro",
    ]);
    expect(seriesOf(option)[0].data).toEqual([1, 2, 3]);
  });

  it("o tooltip recebe o índice na ordem original", () => {
    const labels = ["Primeiro", "Segundo"];
    const option = buildHorizontalBarOption(
      labels,
      [{ name: "V", color: "#111", data: [10, 20] }],
      String,
      (index) => [labels[index]]
    );
    const formatter = (
      option as { tooltip: { formatter: (p: unknown) => string } }
    ).tooltip.formatter;
    // dataIndex 0 é a barra de baixo, que corresponde ao ÚLTIMO da lista.
    expect(formatter([{ dataIndex: 0 }])).toBe("Segundo");
    expect(formatter([{ dataIndex: 1 }])).toBe("Primeiro");
  });

  it("cores por item seguem a mesma inversão dos valores", () => {
    const option = buildHorizontalBarOption(
      ["Primeiro", "Segundo"],
      [
        {
          name: "V",
          color: "#000",
          data: [10, 20],
          itemColors: ["#aaa", "#bbb"],
        },
      ],
      String,
      () => []
    );
    expect(seriesOf(option)[0].data).toEqual([
      { value: 20, itemStyle: { color: "#bbb" } },
      { value: 10, itemStyle: { color: "#aaa" } },
    ]);
  });

  it("só mostra legenda quando há mais de uma série", () => {
    const uma = buildHorizontalBarOption(
      ["A"],
      [{ name: "V", color: "#111", data: [1] }],
      String,
      () => []
    );
    const duas = buildHorizontalBarOption(
      ["A"],
      [
        { name: "V", color: "#111", data: [1] },
        { name: "W", color: "#222", data: [2] },
      ],
      String,
      () => []
    );
    expect((uma as { legend?: unknown }).legend).toBeUndefined();
    expect((duas as { legend?: unknown }).legend).toBeDefined();
  });
});
