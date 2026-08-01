import { describe, expect, it } from "vitest";

import { ScopedCommissionRow } from "../../interface";
import { pivotCommissionBySellerMonth } from "./utils";

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

const bruno = (over: Partial<ScopedCommissionRow> = {}) =>
  row({ sellerId: "s2", sellerName: "Bruno", ...over });

describe("pivotCommissionBySellerMonth", () => {
  it("alinha cada vendedor com todos os meses, com zero onde não ganhou", () => {
    const { months, series } = pivotCommissionBySellerMonth([
      row({ month: "2026-01", amount: 100 }),
      row({ month: "2026-02", amount: 200 }),
      bruno({ month: "2026-02", amount: 50 }),
    ]);

    expect(months).toEqual(["2026-01", "2026-02"]);
    expect(series).toEqual([
      { sellerId: "s1", sellerName: "Ana", values: [100, 200] },
      { sellerId: "s2", sellerName: "Bruno", values: [0, 50] },
    ]);
  });

  it("soma as três situações no valor do mês", () => {
    const { series } = pivotCommissionBySellerMonth([
      row({ amount: 100, status: "received" }),
      row({ amount: 30, status: "receivable" }),
      row({ amount: 20, status: "pending" }),
    ]);

    expect(series[0].values).toEqual([150]);
  });

  it("ordena os vendedores pelo total do período", () => {
    const { series } = pivotCommissionBySellerMonth([
      row({ amount: 10 }),
      bruno({ amount: 90 }),
    ]);

    expect(series.map((s) => s.sellerName)).toEqual(["Bruno", "Ana"]);
  });

  it("mantém só os maiores até o limite, sem somá-los aos de fora", () => {
    const { series } = pivotCommissionBySellerMonth(
      [
        row({ amount: 100 }),
        bruno({ amount: 90 }),
        row({ sellerId: "s3", sellerName: "Carla", amount: 80 }),
      ],
      2
    );

    expect(series.map((s) => s.sellerName)).toEqual(["Ana", "Bruno"]);
    expect(series.map((s) => s.values)).toEqual([[100], [90]]);
  });

  it("devolve eixo e séries vazios sem linhas", () => {
    expect(pivotCommissionBySellerMonth([])).toEqual({
      months: [],
      series: [],
    });
  });
});
