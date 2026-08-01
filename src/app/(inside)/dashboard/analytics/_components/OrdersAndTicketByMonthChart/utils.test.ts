import { describe, expect, it } from "vitest";

import { buildOrdersAndTicketOption, toOrdersAndTicketPoints } from "./utils";

const seriesOf = (option: unknown) =>
  (
    option as {
      series: { name: string; data: number[]; yAxisIndex?: number }[];
    }
  ).series;
const axisData = (option: unknown) =>
  (option as { xAxis: { data: string[] } }).xAxis.data;

describe("toOrdersAndTicketPoints", () => {
  it("lê as duas grandezas da mesma agregação", () => {
    const result = toOrdersAndTicketPoints({
      avgTicketByMonth: [
        { month: "2026-01", avgTicket: "1500.50", orderCount: 5 },
        { month: "2026-02", avgTicket: "2000", orderCount: 8 },
      ],
    });

    expect(result).toEqual([
      { month: "2026-01", orderCount: 5, avgTicket: 1500.5 },
      { month: "2026-02", orderCount: 8, avgTicket: 2000 },
    ]);
  });

  it("ordena por mês (a leitura 'subiu/desceu' depende do eixo cronológico)", () => {
    const result = toOrdersAndTicketPoints({
      avgTicketByMonth: [
        { month: "2026-03", avgTicket: "300", orderCount: 3 },
        { month: "2026-01", avgTicket: "100", orderCount: 1 },
        { month: "2026-02", avgTicket: "200", orderCount: 2 },
      ],
    });

    expect(result.map((p) => p.month)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
    ]);
  });

  it("trata ticket inválido como zero e ausência de dados como lista vazia", () => {
    expect(
      toOrdersAndTicketPoints({
        avgTicketByMonth: [
          { month: "2026-01", avgTicket: "abc", orderCount: 1 },
        ],
      })[0].avgTicket
    ).toBe(0);
    expect(toOrdersAndTicketPoints(undefined)).toEqual([]);
    expect(toOrdersAndTicketPoints({ avgTicketByMonth: [] })).toEqual([]);
  });
});

describe("buildOrdersAndTicketOption", () => {
  it("põe o ticket médio no eixo da direita, separado da contagem", () => {
    // Contagem e dinheiro no mesmo eixo achatariam a série menor.
    const option = buildOrdersAndTicketOption([
      { month: "2026-01", orderCount: 5, avgTicket: 1500 },
      { month: "2026-02", orderCount: 8, avgTicket: 1800 },
    ]);

    const [bar, line] = seriesOf(option);
    expect(axisData(option)).toEqual(["jan/26", "fev/26"]);
    expect(bar.name).toBe("Pedidos");
    expect(bar.data).toEqual([5, 8]);
    expect(line.name).toBe("Ticket médio");
    expect(line.yAxisIndex).toBe(1);
  });
});
