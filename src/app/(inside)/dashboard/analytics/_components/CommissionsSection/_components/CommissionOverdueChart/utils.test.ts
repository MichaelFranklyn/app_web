import { describe, expect, it } from "vitest";

import { ScopedCommissionRow } from "../../interface";
import { overdueByFactory } from "./utils";

const TODAY = "2026-08-01";

const row = (over: Partial<ScopedCommissionRow> = {}): ScopedCommissionRow => ({
  date: "2026-07-20",
  month: "2026-07",
  status: "receivable",
  amount: 100,
  base: 2000,
  sellerId: "s1",
  sellerName: "Ana",
  factoryId: "f1",
  factoryName: "Lukma",
  ...over,
});

describe("overdueByFactory", () => {
  it("classifica por tempo de atraso em três faixas", () => {
    const [factory] = overdueByFactory(
      [
        row({ date: "2026-07-20", amount: 10 }), // 12 dias
        row({ date: "2026-06-01", amount: 20 }), // 61 dias
        row({ date: "2026-01-01", amount: 30 }), // 212 dias
      ],
      TODAY
    );

    expect(factory).toEqual({
      factoryId: "f1",
      name: "Lukma",
      upTo30: 10,
      upTo90: 20,
      over90: 30,
      total: 60,
      count: 3,
    });
  });

  it("ignora o que ainda está no prazo (hoje inclusive)", () => {
    const result = overdueByFactory(
      [
        row({ date: TODAY, amount: 10 }), // vence hoje: no prazo
        row({ date: "2026-09-10", amount: 20 }), // futuro
      ],
      TODAY
    );

    expect(result).toEqual([]);
  });

  it("conta só o que está a receber (previsto e recebido ficam fora)", () => {
    const result = overdueByFactory(
      [
        row({ amount: 10, status: "receivable" }),
        row({ amount: 999, status: "pending" }),
        row({ amount: 888, status: "received" }),
      ],
      TODAY
    );

    expect(result[0].total).toBe(10);
    expect(result[0].count).toBe(1);
  });

  it("usa a borda de 30 dias como último dia da primeira faixa", () => {
    const [factory] = overdueByFactory(
      [
        row({ date: "2026-07-02", amount: 10 }), // 30 dias
        row({ date: "2026-07-01", amount: 20 }), // 31 dias
      ],
      TODAY
    );

    expect(factory.upTo30).toBe(10);
    expect(factory.upTo90).toBe(20);
  });

  it("ordena as fábricas pelo total atrasado e corta no limite", () => {
    const delta = (over: Partial<ScopedCommissionRow>) =>
      row({ factoryId: "f2", factoryName: "Delta", ...over });

    const result = overdueByFactory(
      [
        row({ amount: 10 }),
        delta({ amount: 90 }),
        row({ factoryId: "f3", factoryName: "Herc", amount: 50 }),
      ],
      TODAY,
      2
    );

    expect(result.map((f) => f.name)).toEqual(["Delta", "Herc"]);
  });
});
