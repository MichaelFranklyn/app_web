import { describe, expect, it } from "vitest";

import { buildRevenueByFactoryOption } from "./utils";

const option = (points: { factoryName: string; total: string }[]) =>
  buildRevenueByFactoryOption(
    points.map((p, i) => ({ factoryId: `f${i}`, ...p }))
  ) as {
    yAxis: { data: string[] };
    series: [{ data: number[] }];
  };

describe("faturamento por fábrica", () => {
  it("põe a maior fábrica no topo da barra deitada", () => {
    // O backend devolve do maior para o menor; o eixo Y do ECharts cresce para
    // CIMA, então a lista tem de ir invertida para o topo ser o maior.
    const chart = option([
      { factoryName: "HERC", total: "10000" },
      { factoryName: "Silvana", total: "4000" },
      { factoryName: "Vonder", total: "900" },
    ]);

    expect(chart.yAxis.data).toEqual(["Vonder", "Silvana", "HERC"]);
    expect(chart.series[0].data).toEqual([900, 4000, 10000]);
  });

  it("lê o total que vem como texto do backend", () => {
    const chart = option([{ factoryName: "HERC", total: "1234.56" }]);

    expect(chart.series[0].data).toEqual([1234.56]);
  });

  it("sem fábrica no período, o gráfico sai vazio e não quebra", () => {
    const chart = option([]);

    expect(chart.yAxis.data).toEqual([]);
    expect(chart.series[0].data).toEqual([]);
  });
});
