import { describe, expect, it } from "vitest";

import { CommissionChartRow } from "./interface";
import {
  commissionMonths,
  commissionTotalsBy,
  scopeCommissionRows,
} from "./utils";

const row = (over: Partial<CommissionChartRow> = {}): CommissionChartRow => ({
  receiveDate: "2026-03-10",
  amount: "100",
  installmentAmount: "2000",
  status: "receivable",
  seller: { id: "s1", name: "Ana" },
  factory: {
    id: "f1",
    nickname: "Lukma",
    nomeFantasia: "Lukma Confecções",
    razaoSocial: "LUKMA LTDA",
  },
  ...over,
});

const FILTERS = { from: "2026-01-01", to: "2026-12-31", sellerId: null };

describe("scopeCommissionRows", () => {
  it("normaliza a linha com mês, valores numéricos e nomes de exibição", () => {
    const [scoped] = scopeCommissionRows([row()], FILTERS);

    expect(scoped).toEqual({
      date: "2026-03-10",
      month: "2026-03",
      status: "receivable",
      amount: 100,
      base: 2000,
      sellerId: "s1",
      sellerName: "Ana",
      factoryId: "f1",
      factoryName: "Lukma", // apelido do vínculo vem antes do nome fantasia
    });
  });

  it("descarta comissão cancelada e linha sem data de recebimento", () => {
    const result = scopeCommissionRows(
      [
        row({ status: "cancelled", amount: "999" }),
        row({ receiveDate: null, amount: "888" }),
        row({ amount: "10" }),
      ],
      FILTERS
    );

    expect(result.map((r) => r.amount)).toEqual([10]);
  });

  it("respeita o intervalo [from, to] inclusive nas bordas", () => {
    const result = scopeCommissionRows(
      [
        row({ receiveDate: "2026-05-31", amount: "1" }), // dentro (borda superior)
        row({ receiveDate: "2026-02-01", amount: "2" }), // dentro (borda inferior)
        row({ receiveDate: "2026-06-01", amount: "3" }), // fora (> to)
        row({ receiveDate: "2026-01-31", amount: "4" }), // fora (< from)
      ],
      { from: "2026-02-01", to: "2026-05-31", sellerId: null }
    );

    expect(result.map((r) => r.amount)).toEqual([1, 2]);
  });

  it("filtra por vendedor quando sellerId é informado", () => {
    const result = scopeCommissionRows(
      [
        row({ amount: "100", seller: { id: "s1", name: "Ana" } }),
        row({ amount: "200", seller: { id: "s2", name: "Bruno" } }),
        row({ amount: "300", seller: null }),
      ],
      { ...FILTERS, sellerId: "s1" }
    );

    expect(result.map((r) => r.amount)).toEqual([100]);
  });

  it("corta o timestamp da data e trata valor inválido como zero", () => {
    const [scoped] = scopeCommissionRows(
      [row({ receiveDate: "2026-03-10T12:00:00.000Z", amount: "abc" })],
      FILTERS
    );

    expect(scoped.month).toBe("2026-03");
    expect(scoped.amount).toBe(0);
  });

  it("usa rótulos próprios quando a linha não tem vendedor nem fábrica", () => {
    const [scoped] = scopeCommissionRows(
      [row({ seller: null, factory: null })],
      FILTERS
    );

    expect(scoped.sellerName).toBe("Sem vendedor");
    expect(scoped.factoryName).toBe("—");
  });
});

describe("commissionMonths", () => {
  it("devolve os meses presentes, sem repetir e em ordem crescente", () => {
    const rows = scopeCommissionRows(
      [
        row({ receiveDate: "2026-05-02" }),
        row({ receiveDate: "2026-01-20" }),
        row({ receiveDate: "2026-05-28" }),
      ],
      FILTERS
    );

    expect(commissionMonths(rows)).toEqual(["2026-01", "2026-05"]);
  });
});

describe("commissionTotalsBy", () => {
  const rows = scopeCommissionRows(
    [
      row({
        seller: { id: "s1", name: "Ana" },
        amount: "100",
        status: "received",
      }),
      row({
        seller: { id: "s1", name: "Ana" },
        amount: "50",
        status: "receivable",
      }),
      row({
        seller: { id: "s1", name: "Ana" },
        amount: "25",
        status: "pending",
      }),
      row({
        seller: { id: "s2", name: "Bruno" },
        amount: "80",
        status: "received",
      }),
    ],
    FILTERS
  );

  it("consolida por vendedor separando as situações e soma a base", () => {
    const [ana, bruno] = commissionTotalsBy(rows, "seller");

    expect(ana).toEqual({
      id: "s1",
      name: "Ana",
      total: 175,
      received: 100,
      receivable: 50,
      pending: 25,
      base: 6000, // três parcelas de 2000
    });
    expect(bruno.total).toBe(80);
  });

  it("ordena pelo total, do maior para o menor", () => {
    expect(commissionTotalsBy(rows, "seller").map((t) => t.name)).toEqual([
      "Ana",
      "Bruno",
    ]);
  });

  it("agrupa por fábrica quando pedido", () => {
    const mixed = scopeCommissionRows(
      [
        row({ amount: "10" }),
        row({
          amount: "90",
          factory: {
            id: "f2",
            nickname: null,
            nomeFantasia: "Delta",
            razaoSocial: "DELTA SA",
          },
        }),
      ],
      FILTERS
    );

    expect(commissionTotalsBy(mixed, "factory").map((t) => t.name)).toEqual([
      "Delta",
      "Lukma",
    ]);
  });
});
