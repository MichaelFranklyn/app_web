import { describe, expect, it } from "vitest";

import { ScopedCommissionRow } from "../../interface";
import { factoryCommissionRates, formatRate } from "./utils";

const row = (over: Partial<ScopedCommissionRow> = {}): ScopedCommissionRow => ({
  date: "2026-03-10",
  month: "2026-03",
  status: "receivable",
  amount: 100,
  base: 2000,
  sellerId: "s1",
  sellerName: "Ana",
  factoryId: "f1",
  factoryName: "Lukma",
  ...over,
});

const delta = (over: Partial<ScopedCommissionRow> = {}) =>
  row({ factoryId: "f2", factoryName: "Delta", ...over });

describe("factoryCommissionRates", () => {
  it("calcula a taxa efetiva sobre o faturado das parcelas", () => {
    const [factory] = factoryCommissionRates([
      row({ amount: 100, base: 2000 }),
      row({ amount: 50, base: 1000 }),
    ]);

    expect(factory).toEqual({
      factoryId: "f1",
      name: "Lukma",
      rate: 0.05, // 150 de comissão sobre 3000 faturados
      commission: 150,
      invoiced: 3000,
    });
  });

  it("ordena pela taxa, não pelo valor da comissão", () => {
    const result = factoryCommissionRates([
      row({ amount: 300, base: 10000 }), // 3%
      delta({ amount: 80, base: 1000 }), // 8%
    ]);

    expect(result.map((f) => f.name)).toEqual(["Delta", "Lukma"]);
  });

  it("descarta fábrica sem valor faturado (não há taxa a calcular)", () => {
    const result = factoryCommissionRates([
      row({ amount: 100, base: 2000 }),
      delta({ amount: 40, base: 0 }),
    ]);

    expect(result.map((f) => f.name)).toEqual(["Lukma"]);
  });

  it("corta no limite pedido", () => {
    const result = factoryCommissionRates(
      [
        row({ amount: 100, base: 1000 }),
        delta({ amount: 200, base: 1000 }),
        row({ factoryId: "f3", factoryName: "Herc", amount: 300, base: 1000 }),
      ],
      2
    );

    expect(result.map((f) => f.name)).toEqual(["Herc", "Delta"]);
  });
});

describe("formatRate", () => {
  it("mostra uma casa decimal com vírgula", () => {
    expect(formatRate(0.045)).toBe("4,5%");
    expect(formatRate(0.03)).toBe("3,0%");
  });
});
