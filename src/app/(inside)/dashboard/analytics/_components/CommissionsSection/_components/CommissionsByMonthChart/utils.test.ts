import { describe, expect, it } from "vitest";

import { ScopedCommissionRow } from "../../interface";
import { bucketCommissionsByMonth } from "./utils";

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

describe("bucketCommissionsByMonth", () => {
  it("agrega por mês e ordena do mais antigo para o mais novo", () => {
    const result = bucketCommissionsByMonth([
      row({ month: "2026-03", amount: 100 }),
      row({ month: "2026-03", amount: 50 }),
      row({ month: "2026-01", amount: 30 }),
    ]);

    expect(result.map((b) => b.month)).toEqual(["2026-01", "2026-03"]);
    expect(result[1]).toEqual({
      month: "2026-03",
      received: 0,
      receivable: 150,
      pending: 0,
    });
  });

  it("separa as três situações no mesmo mês", () => {
    const result = bucketCommissionsByMonth([
      row({ amount: 100, status: "receivable" }),
      row({ amount: 40, status: "received" }),
      row({ amount: 15, status: "pending" }),
    ]);

    expect(result).toEqual([
      { month: "2026-03", received: 40, receivable: 100, pending: 15 },
    ]);
  });

  it("não inventa meses vazios entre os que têm comissão", () => {
    const result = bucketCommissionsByMonth([
      row({ month: "2026-01" }),
      row({ month: "2026-04" }),
    ]);

    expect(result.map((b) => b.month)).toEqual(["2026-01", "2026-04"]);
  });

  it("devolve lista vazia sem linhas", () => {
    expect(bucketCommissionsByMonth([])).toEqual([]);
  });
});
