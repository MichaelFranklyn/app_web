import { describe, expect, it } from "vitest";

import { BackorderMonthPoint } from "./interface";
import { buildBackorderWeightOption, hasBackorders } from "./utils";

const point = (
  over: Partial<BackorderMonthPoint> = {}
): BackorderMonthPoint => ({
  month: "2026-07",
  newOrders: 134,
  backorders: 4,
  backorderShare: 4 / 138,
  backorderAmount: "20928.31",
  ...over,
});

const seriesOf = (option: unknown) =>
  (option as { series: { name: string; stack: string; data: number[] }[] })
    .series;
const axisData = (option: unknown) =>
  (option as { xAxis: { data: string[] } }).xAxis.data;
const tooltip = (option: unknown) =>
  (option as { tooltip: { formatter: (p: unknown) => string } }).tooltip
    .formatter;

describe("hasBackorders", () => {
  it("período sem sobra nenhuma não é dado", () => {
    // Sem sobra, o gráfico seria só uma barra azul repetindo "pedidos por mês".
    expect(hasBackorders([point({ backorders: 0 })])).toBe(false);
    expect(hasBackorders([])).toBe(false);
  });

  it("uma sobra em qualquer mês já é dado", () => {
    expect(
      hasBackorders([point({ backorders: 0 }), point({ backorders: 1 })])
    ).toBe(true);
  });
});

describe("buildBackorderWeightOption", () => {
  it("empilha venda nova e sobra na mesma barra do mês", () => {
    const option = buildBackorderWeightOption([
      point({ month: "2026-06", newOrders: 168, backorders: 0 }),
      point({ month: "2026-07", newOrders: 134, backorders: 4 }),
    ]);

    const [novos, sobras] = seriesOf(option);
    expect(axisData(option)).toEqual(["jun/26", "jul/26"]);
    expect(novos.name).toBe("Venda nova");
    expect(novos.data).toEqual([168, 134]);
    expect(sobras.name).toBe("Sobra de faturamento");
    expect(sobras.data).toEqual([0, 4]);
    // Mesma pilha: a barra inteira é o volume que a lista de pedidos mostra.
    expect([novos.stack, sobras.stack]).toEqual(["total", "total"]);
  });

  it("o tooltip traz o total do mês, a fatia da sobra e o valor parado", () => {
    const option = buildBackorderWeightOption([
      point({
        month: "2026-07",
        newOrders: 134,
        backorders: 4,
        backorderShare: 0.029,
        backorderAmount: "20928.31",
      }),
    ]);

    const text = tooltip(option)([{ dataIndex: 0 }]);
    expect(text).toContain("jul/26");
    expect(text).toContain("138 pedidos no mês"); // 134 + 4
    expect(text).toContain("3%"); // 2,9% arredondado
    expect(text).toContain("20.928,31");
  });

  it("mês com um pedido só concorda o singular", () => {
    const option = buildBackorderWeightOption([
      point({ newOrders: 0, backorders: 1, backorderShare: 1 }),
    ]);

    expect(tooltip(option)([{ dataIndex: 0 }])).toContain("1 pedido no mês");
  });
});
