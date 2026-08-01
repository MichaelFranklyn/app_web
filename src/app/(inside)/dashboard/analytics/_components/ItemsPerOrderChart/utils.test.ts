import { describe, expect, it } from "vitest";

import { ItemsPerOrderPoint } from "./interface";
import { buildItemsPerOrderOption, formatItems } from "./utils";

const point = (over: Partial<ItemsPerOrderPoint> = {}): ItemsPerOrderPoint => ({
  entityId: "f1",
  entityName: "Lukma",
  avgItems: 3.4,
  avgUnits: 201.7,
  orderCount: 28,
  ...over,
});

const seriesData = (option: unknown) =>
  (option as { series: { data: number[] }[] }).series[0].data;
const axisData = (option: unknown) =>
  (option as { yAxis: { data: string[] } }).yAxis.data;
const tooltip = (option: unknown) =>
  (option as { tooltip: { formatter: (p: unknown) => string } }).tooltip
    .formatter;

describe("formatItems", () => {
  it("uma casa decimal com vírgula", () => {
    expect(formatItems(3.44)).toBe("3,4");
    expect(formatItems(3)).toBe("3,0");
  });
});

describe("buildItemsPerOrderOption", () => {
  it("põe a fábrica mais funda no topo do eixo", () => {
    // O eixo Y do ECharts cresce de baixo para cima: o builder inverte.
    const option = buildItemsPerOrderOption([
      point({ entityName: "Lukma", avgItems: 3.4 }),
      point({ entityName: "Delta", avgItems: 2.1 }),
    ]);

    expect(axisData(option)).toEqual(["Delta", "Lukma"]);
    expect(seriesData(option)).toEqual([2.1, 3.4]);
  });

  it("o tooltip traz peças e nº de pedidos junto dos itens", () => {
    const option = buildItemsPerOrderOption([
      point({
        entityName: "Lukma",
        avgItems: 3.4,
        avgUnits: 201.7,
        orderCount: 1,
      }),
    ]);

    // dataIndex 0 é a barra de baixo — com um item só, é a própria.
    const text = tooltip(option)([{ dataIndex: 0 }]);
    expect(text).toContain("Lukma");
    expect(text).toContain("3,4 itens");
    expect(text).toContain("202 peças");
    expect(text).toContain("1 pedido no período"); // singular
  });
});
