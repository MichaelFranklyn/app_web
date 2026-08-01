import { describe, expect, it } from "vitest";

import { OrderSizeBandPoint } from "./interface";
import { buildOrderSizeDistributionOption, hasOrderSizeData } from "./utils";

const band = (over: Partial<OrderSizeBandPoint> = {}): OrderSizeBandPoint => ({
  band: "ate_1k",
  label: "Até R$ 1 mil",
  orderCount: 3,
  totalAmount: "2400",
  share: 0.25,
  ...over,
});

const seriesData = (option: unknown) =>
  (option as { series: { data: number[] }[] }).series[0].data;
const axisData = (option: unknown) =>
  (option as { xAxis: { data: string[] } }).xAxis.data;
const tooltip = (option: unknown) =>
  (option as { tooltip: { formatter: (p: unknown) => string } }).tooltip
    .formatter;

describe("hasOrderSizeData", () => {
  it("faixas zeradas não contam como dado", () => {
    // O backend devolve as cinco faixas sempre: ter linha ≠ ter pedido.
    expect(
      hasOrderSizeData([band({ orderCount: 0 }), band({ orderCount: 0 })])
    ).toBe(false);
  });

  it("uma faixa com pedido já é dado", () => {
    expect(hasOrderSizeData([band({ orderCount: 0 }), band()])).toBe(true);
  });

  it("sem faixa nenhuma não há dado", () => {
    expect(hasOrderSizeData([])).toBe(false);
  });
});

describe("buildOrderSizeDistributionOption", () => {
  it("mantém a ordem das faixas recebida do backend", () => {
    const option = buildOrderSizeDistributionOption([
      band({ label: "Até R$ 1 mil", orderCount: 3 }),
      band({ label: "R$ 1 mil a R$ 3 mil", orderCount: 9 }),
      band({ label: "Acima de R$ 10 mil", orderCount: 1 }),
    ]);

    expect(axisData(option)).toEqual([
      "Até R$ 1 mil",
      "R$ 1 mil a R$ 3 mil",
      "Acima de R$ 10 mil",
    ]);
    expect(seriesData(option)).toEqual([3, 9, 1]);
  });

  it("o tooltip traz a fatia e o faturamento da faixa", () => {
    const option = buildOrderSizeDistributionOption([
      band({
        label: "R$ 3 mil a R$ 5 mil",
        orderCount: 1,
        share: 0.5,
        totalAmount: "4000",
      }),
    ]);

    const text = tooltip(option)([{ dataIndex: 0 }]);
    expect(text).toContain("R$ 3 mil a R$ 5 mil");
    expect(text).toContain("1 pedido"); // singular
    expect(text).toContain("50%");
    expect(text).toContain("4.000,00");
  });
});
