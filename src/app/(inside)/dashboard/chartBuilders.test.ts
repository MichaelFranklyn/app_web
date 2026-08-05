import { describe, expect, it } from "vitest";

import {
  buildBarLineOption,
  buildHorizontalBarOption,
  buildMonthLinesOption,
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

describe("buildStackedBarOption — tooltip do chamador", () => {
  it("usa tooltipLines quando informado, com o índice da categoria", () => {
    const labels = ["jan", "fev"];
    const option = buildStackedBarOption(
      labels,
      [{ name: "A", color: "#111", data: [1, 2] }],
      String,
      (index) => [labels[index]]
    );
    const formatter = (
      option as { tooltip: { formatter: (p: unknown) => string } }
    ).tooltip.formatter;

    expect(formatter([{ dataIndex: 1 }])).toBe("fev");
  });

  it("sem tooltipLines, mantém o formatter de valor das séries", () => {
    const option = buildStackedBarOption(
      ["jan"],
      [{ name: "A", color: "#111", data: [1] }],
      (v) => `${v} un`
    );
    const tooltip = (
      option as {
        tooltip: {
          formatter?: unknown;
          valueFormatter?: (v: unknown) => string;
        };
      }
    ).tooltip;

    expect(tooltip.formatter).toBeUndefined();
    expect(tooltip.valueFormatter?.(3)).toBe("3 un");
  });
});

describe("buildMonthLinesOption", () => {
  it("desenha uma linha por série sobre os meses recebidos", () => {
    const option = buildMonthLinesOption(
      ["jan/26", "fev/26"],
      [
        { name: "Ana", color: "#111", data: [10, 20] },
        { name: "Bruno", color: "#222", data: [0, 5] },
      ],
      String
    );

    expect(axisData((option as { xAxis: unknown }).xAxis)).toEqual([
      "jan/26",
      "fev/26",
    ]);
    expect(seriesOf(option).map((s) => s.type)).toEqual(["line", "line"]);
    expect(seriesOf(option).map((s) => s.name)).toEqual(["Ana", "Bruno"]);
    expect(seriesOf(option)[1].data).toEqual([0, 5]);
  });

  it("encosta a linha na borda do eixo (sem folga de categoria)", () => {
    const option = buildMonthLinesOption(
      ["jan/26"],
      [{ name: "Ana", color: "#111", data: [10] }],
      String
    );
    expect(
      (option as { xAxis: { boundaryGap: boolean } }).xAxis.boundaryGap
    ).toBe(false);
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

  it("empilha as séries na mesma barra quando pedido", () => {
    const option = buildHorizontalBarOption(
      ["A"],
      [
        { name: "Recebido", color: "#111", data: [1] },
        { name: "A receber", color: "#222", data: [2] },
      ],
      String,
      () => [],
      { stacked: true }
    );

    expect(seriesOf(option).map((s) => s.stack)).toEqual(["total", "total"]);
    // Só a ponta da barra (última série da pilha) arredonda.
    expect(
      seriesOf(option).map(
        (s) => (s.itemStyle as { borderRadius: number[] }).borderRadius
      )
    ).toEqual([
      [0, 0, 0, 0],
      [0, 4, 4, 0],
    ]);
  });

  it("sem empilhar, cada série vira uma barra própria arredondada", () => {
    const option = buildHorizontalBarOption(
      ["A"],
      [
        { name: "V", color: "#111", data: [1] },
        { name: "W", color: "#222", data: [2] },
      ],
      String,
      () => []
    );

    expect(seriesOf(option).map((s) => s.stack)).toEqual([
      undefined,
      undefined,
    ]);
    expect(
      seriesOf(option).map(
        (s) => (s.itemStyle as { borderRadius: number[] }).borderRadius
      )
    ).toEqual([
      [0, 4, 4, 0],
      [0, 4, 4, 0],
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
