import { describe, expect, it } from "vitest";

import { CHART_INK_MUTED, SERIES_RED } from "@/components/Chart/chartTheme";
import { ClientRiskPoint } from "./interface";
import { buildClientsAtRiskOption } from "./utils";

const point = (overrides: Partial<ClientRiskPoint>): ClientRiskPoint => ({
  entityId: "c1",
  entityName: "Alto",
  lastOrderDate: "2026-06-01",
  daysSinceLastOrder: 60,
  avgIntervalDays: 30,
  riskRatio: 2,
  orderCount: 4,
  ...overrides,
});

type Bar = { value: number; itemStyle: { color: string } };
const chartOf = (points: ClientRiskPoint[]) =>
  buildClientsAtRiskOption(points) as unknown as {
    yAxis: { data: string[] };
    series: [{ data: Bar[] }];
    tooltip: { formatter: (params: unknown) => string };
  };

describe("clientes em risco", () => {
  it("marca em vermelho quem já passou do próprio ritmo", () => {
    // A comparação é sempre com o costume do cliente: quem compra a cada 20
    // dias e sumiu há 60 está atrasado; quem compra a cada 90 e sumiu há 80
    // ainda está dentro dele.
    const chart = chartOf([
      point({ entityName: "Atrasado", riskRatio: 3 }),
      point({ entityName: "No limite", riskRatio: 0.9 }),
    ]);

    // A ordem do eixo vem invertida (o primeiro da lista fica no topo).
    expect(chart.yAxis.data).toEqual(["No limite", "Atrasado"]);
    expect(chart.series[0].data.map((bar) => bar.itemStyle.color)).toEqual([
      CHART_INK_MUTED,
      SERIES_RED,
    ]);
  });

  it("quem chegou exatamente no próprio ciclo já conta como atrasado", () => {
    const chart = chartOf([point({ riskRatio: 1 })]);

    expect(chart.series[0].data[0].itemStyle.color).toBe(SERIES_RED);
  });

  it("a barra são os dias parados, não a razão de risco", () => {
    const chart = chartOf([point({ daysSinceLastOrder: 47, riskRatio: 1.5 })]);

    expect(chart.series[0].data[0].value).toBe(47);
  });

  it("o tooltip diz quantos dias, o costume do cliente e a última compra", () => {
    const chart = chartOf([
      point({
        entityName: "Alto",
        daysSinceLastOrder: 60,
        avgIntervalDays: 30,
        lastOrderDate: "2026-06-01",
      }),
    ]);
    const text = chart.tooltip.formatter([{ dataIndex: 0 }]);

    expect(text).toContain("Alto");
    expect(text).toContain("60 dias");
    expect(text).toContain("Costuma comprar a cada 30 dias");
    expect(text).toContain("01/06/2026");
  });
});
