import { describe, expect, it } from "vitest";

import { WeekdayVolumePoint } from "./interface";
import { buildOrdersByWeekdayOption, hasWeekdayData } from "./utils";

const day = (over: Partial<WeekdayVolumePoint> = {}): WeekdayVolumePoint => ({
  weekday: 1,
  label: "Segunda",
  orderCount: 4,
  totalAmount: "12000",
  share: 0.4,
  ...over,
});

const seriesData = (option: unknown) =>
  (option as { series: { data: number[] }[] }).series[0].data;
const axisData = (option: unknown) =>
  (option as { xAxis: { data: string[] } }).xAxis.data;
const tooltip = (option: unknown) =>
  (option as { tooltip: { formatter: (p: unknown) => string } }).tooltip
    .formatter;

describe("hasWeekdayData", () => {
  it("semana inteira zerada não é dado", () => {
    expect(
      hasWeekdayData([day({ orderCount: 0 }), day({ orderCount: 0 })])
    ).toBe(false);
  });

  it("um dia com pedido já é dado", () => {
    expect(hasWeekdayData([day({ orderCount: 0 }), day()])).toBe(true);
  });
});

describe("buildOrdersByWeekdayOption", () => {
  it("desenha os dias na ordem recebida, inclusive os zerados", () => {
    const option = buildOrdersByWeekdayOption([
      day({ label: "Segunda", orderCount: 4 }),
      day({ weekday: 2, label: "Terça", orderCount: 0 }),
      day({ weekday: 3, label: "Quarta", orderCount: 2 }),
    ]);

    expect(axisData(option)).toEqual(["Segunda", "Terça", "Quarta"]);
    // O dia sem pedido continua no eixo: a ausência é a informação.
    expect(seriesData(option)).toEqual([4, 0, 2]);
  });

  it("o tooltip traz a fatia da semana e o faturamento do dia", () => {
    const option = buildOrdersByWeekdayOption([
      day({ label: "Quinta", orderCount: 3, share: 0.3, totalAmount: "9000" }),
    ]);

    const text = tooltip(option)([{ dataIndex: 0 }]);
    expect(text).toContain("Quinta");
    expect(text).toContain("3 pedidos");
    expect(text).toContain("30%");
    expect(text).toContain("9.000,00");
  });
});
