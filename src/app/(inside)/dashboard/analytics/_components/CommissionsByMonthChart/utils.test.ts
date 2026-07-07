import { describe, expect, it } from "vitest";

import { CommissionChartRow } from "./interface";
import { bucketCommissionsByMonth } from "./utils";

const row = (over: Partial<CommissionChartRow>): CommissionChartRow => ({
  receiveDate: "2026-03-10",
  amount: "100",
  isReceivable: true,
  isReceived: false,
  seller: { id: "s1" },
  ...over,
});

const FILTERS = { from: "2026-01-01", to: "2026-12-31", sellerId: null };

describe("bucketCommissionsByMonth", () => {
  it("agrega por mês da receiveDate e ordena crescente", () => {
    const result = bucketCommissionsByMonth(
      [
        row({ receiveDate: "2026-03-10", amount: "100" }),
        row({ receiveDate: "2026-03-25", amount: "50" }),
        row({ receiveDate: "2026-01-05", amount: "30" }),
      ],
      FILTERS
    );

    expect(result.map((b) => b.month)).toEqual(["2026-01", "2026-03"]);
    expect(result[1]).toEqual({
      month: "2026-03",
      receivable: 150,
      received: 0,
    });
  });

  it("separa recebido de a receber (recebido tem precedência)", () => {
    const result = bucketCommissionsByMonth(
      [
        row({ amount: "100", isReceivable: true, isReceived: false }),
        // isReceived vence, mesmo com isReceivable true, e não conta como a receber
        row({ amount: "40", isReceivable: true, isReceived: true }),
      ],
      FILTERS
    );

    expect(result).toEqual([
      { month: "2026-03", receivable: 100, received: 40 },
    ]);
  });

  it("ignora linhas sem receiveDate", () => {
    const result = bucketCommissionsByMonth(
      [row({ receiveDate: null, amount: "999" }), row({ amount: "10" })],
      FILTERS
    );

    expect(result).toEqual([{ month: "2026-03", receivable: 10, received: 0 }]);
  });

  it("respeita o intervalo [from, to] inclusive nas bordas", () => {
    const result = bucketCommissionsByMonth(
      [
        row({ receiveDate: "2026-05-31", amount: "1" }), // dentro (borda superior)
        row({ receiveDate: "2026-06-01", amount: "2" }), // fora (> to)
        row({ receiveDate: "2026-01-31", amount: "4" }), // fora (< from)
      ],
      { from: "2026-02-01", to: "2026-05-31", sellerId: null }
    );

    expect(result).toEqual([{ month: "2026-05", receivable: 1, received: 0 }]);
  });

  it("filtra por vendedor quando sellerId é informado", () => {
    const result = bucketCommissionsByMonth(
      [
        row({ amount: "100", seller: { id: "s1" } }),
        row({ amount: "200", seller: { id: "s2" } }),
        row({ amount: "300", seller: null }),
      ],
      { ...FILTERS, sellerId: "s1" }
    );

    expect(result).toEqual([
      { month: "2026-03", receivable: 100, received: 0 },
    ]);
  });

  it("normaliza receiveDate com timestamp cortando para o dia", () => {
    const result = bucketCommissionsByMonth(
      [row({ receiveDate: "2026-03-10T12:00:00.000Z", amount: "5" })],
      FILTERS
    );

    expect(result).toEqual([{ month: "2026-03", receivable: 5, received: 0 }]);
  });

  it("trata amount inválido como zero", () => {
    const result = bucketCommissionsByMonth([row({ amount: "abc" })], FILTERS);

    expect(result).toEqual([{ month: "2026-03", receivable: 0, received: 0 }]);
  });
});
