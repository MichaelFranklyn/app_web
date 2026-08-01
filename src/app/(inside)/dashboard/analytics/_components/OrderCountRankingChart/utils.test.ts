import { describe, expect, it } from "vitest";

import { OrderCountPoint } from "./interface";
import { buildOrderCountRankingOption } from "./utils";

const point = (over: Partial<OrderCountPoint> = {}): OrderCountPoint => ({
  entityId: "c1",
  entityName: "Casa das Tintas",
  orderCount: 12,
  ...over,
});

const seriesData = (option: unknown) =>
  (option as { series: { data: number[] }[] }).series[0].data;
const axisData = (option: unknown) =>
  (option as { yAxis: { data: string[] } }).yAxis.data;
const tooltip = (option: unknown) =>
  (option as { tooltip: { formatter: (p: unknown) => string } }).tooltip
    .formatter;

describe("buildOrderCountRankingOption", () => {
  it("mantém o maior no topo (o backend já devolve ordenado)", () => {
    const option = buildOrderCountRankingOption(
      [
        point({ entityName: "Primeiro", orderCount: 12 }),
        point({ entityName: "Segundo", orderCount: 7 }),
      ],
      "#111"
    );

    expect(axisData(option)).toEqual(["Segundo", "Primeiro"]);
    expect(seriesData(option)).toEqual([7, 12]);
  });

  it("o tooltip usa o índice original e concorda o plural", () => {
    const option = buildOrderCountRankingOption(
      [
        point({ entityName: "Primeiro", orderCount: 12 }),
        point({ entityName: "Segundo", orderCount: 1 }),
      ],
      "#111"
    );

    // dataIndex 0 é a barra de baixo = o ÚLTIMO da lista original.
    expect(tooltip(option)([{ dataIndex: 0 }])).toContain("1 pedido");
    expect(tooltip(option)([{ dataIndex: 1 }])).toContain("12 pedidos");
  });
});
