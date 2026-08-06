import { describe, expect, it } from "vitest";

import { BillingRow } from "./interface";
import {
  buildBillingExportRows,
  dueDateLabel,
  filterByScope,
  overdueLabel,
  sumBy,
} from "./utils";

const row = (patch: Partial<BillingRow>): BillingRow => ({
  installmentId: "i1",
  orderId: "o1",
  sequence: 1,
  clientId: "c1",
  clientName: "CLIENTE",
  factoryId: "f1",
  factoryName: "FÁBRICA",
  sellerId: "s1",
  sellerName: "VENDEDOR",
  invoicedAt: "2026-07-01",
  dueDate: "2026-08-01",
  amount: "100",
  commissionAmount: "5",
  situation: "DUE",
  paidAt: null,
  daysOverdue: 0,
  isCommissionReceived: false,
  ...patch,
});

describe("filterByScope", () => {
  const rows = [
    row({ installmentId: "a", situation: "DUE" }),
    row({ installmentId: "b", situation: "OVERDUE" }),
    row({ installmentId: "c", situation: "PAID" }),
  ];

  it("devolve tudo em 'todas'", () => {
    expect(filterByScope(rows, "all")).toHaveLength(3);
  });

  it("recorta por situação", () => {
    expect(filterByScope(rows, "overdue").map((r) => r.installmentId)).toEqual([
      "b",
    ]);
    expect(filterByScope(rows, "paid").map((r) => r.installmentId)).toEqual([
      "c",
    ]);
    expect(filterByScope(rows, "due").map((r) => r.installmentId)).toEqual([
      "a",
    ]);
  });
});

describe("sumBy", () => {
  it("soma valores que chegam como string do GraphQL", () => {
    const rows = [row({ amount: "100.50" }), row({ amount: "9.50" })];
    expect(sumBy(rows, (r) => r.amount)).toBe(110);
  });

  it("trata valor vazio como zero", () => {
    expect(sumBy([row({ amount: "" })], (r) => r.amount)).toBe(0);
  });
});

describe("overdueLabel", () => {
  it("escreve o atraso por extenso", () => {
    expect(overdueLabel(1)).toBe("1 dia");
    expect(overdueLabel(12)).toBe("12 dias");
  });

  it("sem atraso não inventa número", () => {
    expect(overdueLabel(0)).toBe("—");
  });
});

describe("dueDateLabel", () => {
  it("diz que não há data em vez de mostrar traço", () => {
    // Parcela sem vencimento existe (prazo que não gerou data) e não pode ser
    // confundida com uma linha vazia.
    expect(dueDateLabel(null)).toBe("sem data");
  });

  it("formata a data no padrão brasileiro", () => {
    expect(dueDateLabel("2026-08-01")).toBe("01/08/2026");
  });
});

describe("buildBillingExportRows", () => {
  it("exporta valores como número, para a planilha somar", () => {
    const [line] = buildBillingExportRows([
      row({ amount: "100.50", commissionAmount: "5.25" }),
    ]);
    expect(line[8]).toBe(100.5);
    expect(line[9]).toBe(5.25);
  });

  it("traduz a situação para o rótulo da cobrança", () => {
    const [line] = buildBillingExportRows([row({ situation: "OVERDUE" })]);
    expect(line[1]).toBe("Vencida");
  });
});
