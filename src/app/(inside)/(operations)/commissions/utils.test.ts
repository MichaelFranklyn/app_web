import { describe, expect, it } from "vitest";
import { CommissionRow } from "./interface";
import {
  addMonths,
  groupByFactory,
  isInMonth,
  latestMonthWithData,
  receivableReport,
  summarizeRows,
  yearMonthFromIso,
} from "./utils";

const row = (over: Partial<CommissionRow>): CommissionRow => ({
  orderId: "o1",
  installmentId: "i1",
  sequence: 1,
  orderDate: "2026-03-01",
  invoicedAt: null,
  dueDate: null,
  paidAt: null,
  installmentAmount: "100",
  amount: "10",
  status: "receivable",
  receiveDate: "2026-03-10",
  isReceivable: true,
  isReceived: false,
  isReconciled: false,
  reconciledAt: null,
  client: null,
  factory: { id: "f1", nomeFantasia: "Alfa", razaoSocial: "Alfa SA" },
  seller: null,
  ...over,
});

describe("yearMonthFromIso", () => {
  it("extrai ano e mês de uma data ISO", () => {
    expect(yearMonthFromIso("2026-03-15")).toEqual({ year: 2026, month: 3 });
  });
});

describe("addMonths", () => {
  it("navega meses normalizando a virada de ano", () => {
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
  });
});

describe("isInMonth", () => {
  it("verdadeiro só quando a data ISO cai no mês/ano informado", () => {
    const ym = { year: 2026, month: 3 };
    expect(isInMonth("2026-03-10", ym)).toBe(true);
    expect(isInMonth("2026-04-01", ym)).toBe(false);
    expect(isInMonth(null, ym)).toBe(false);
  });
});

describe("groupByFactory", () => {
  it("agrupa por fábrica e ordena os grupos por nome", () => {
    const groups = groupByFactory([
      row({
        installmentId: "a",
        factory: { id: "f2", nomeFantasia: "Zeta", razaoSocial: "Z" },
      }),
      row({
        installmentId: "b",
        factory: { id: "f1", nomeFantasia: "Alfa", razaoSocial: "A" },
      }),
      row({
        installmentId: "c",
        factory: { id: "f1", nomeFantasia: "Alfa", razaoSocial: "A" },
      }),
    ]);
    expect(groups.map((g) => g.name)).toEqual(["Alfa", "Zeta"]);
    expect(groups[0].rows).toHaveLength(2);
  });

  it("junta parcelas sem fábrica em um grupo próprio", () => {
    const groups = groupByFactory([row({ factory: null })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("—");
  });
});

describe("summarizeRows", () => {
  it("soma subtotais e conta conferidas", () => {
    const summary = summarizeRows([
      row({
        installmentId: "a",
        status: "receivable",
        amount: "10",
        isReconciled: true,
      }),
      row({
        installmentId: "b",
        status: "received",
        amount: "5",
        isReceivable: false,
      }),
      row({ installmentId: "c", status: "receivable", amount: "7" }),
    ]);
    expect(summary.receivable).toBe(17);
    expect(summary.received).toBe(5);
    expect(summary.reconciledCount).toBe(1);
    expect(summary.receivableIds).toEqual(["a", "c"]);
  });

  it("zera tudo para uma lista vazia", () => {
    expect(summarizeRows([])).toEqual({
      receivable: 0,
      received: 0,
      reconciledCount: 0,
      receivableIds: [],
    });
  });
});

describe("receivableReport", () => {
  const march = { year: 2026, month: 3 };

  it("leva só o que há a receber no mês, com subtotal por fábrica e total", () => {
    const report = receivableReport(
      [
        row({ installmentId: "a", amount: "10", receiveDate: "2026-03-10" }),
        row({ installmentId: "b", amount: "7.5", receiveDate: "2026-03-20" }),
        // Fora: outro mês, previsto e já recebido.
        row({ installmentId: "c", amount: "99", receiveDate: "2026-04-01" }),
        row({ installmentId: "d", amount: "99", status: "pending" }),
        row({ installmentId: "e", amount: "99", status: "received" }),
      ],
      march
    );

    expect(report.count).toBe(2);
    expect(report.total).toBe(17.5);
    expect(report.groups).toHaveLength(1);
    expect(report.groups[0].subtotal).toBe(17.5);
    expect(report.groups[0].rows.map((r) => r.installmentId)).toEqual([
      "a",
      "b",
    ]);
  });

  it("ordena as parcelas da fábrica pela data de recebimento", () => {
    const report = receivableReport(
      [
        row({ installmentId: "tarde", receiveDate: "2026-03-28" }),
        row({ installmentId: "cedo", receiveDate: "2026-03-02" }),
      ],
      march
    );
    expect(report.groups[0].rows.map((r) => r.installmentId)).toEqual([
      "cedo",
      "tarde",
    ]);
  });

  it("devolve relatório vazio quando nada há a receber no mês", () => {
    const report = receivableReport([row({ status: "received" })], march);
    expect(report).toEqual({ groups: [], total: 0, count: 0 });
  });
});

describe("latestMonthWithData", () => {
  it("pega o mês/ano mais recente entre as datas de recebimento", () => {
    expect(
      latestMonthWithData([
        row({ receiveDate: "2026-03-10" }),
        row({ receiveDate: "2026-07-01" }),
        row({ receiveDate: "2026-05-20" }),
      ])
    ).toEqual({ year: 2026, month: 7 });
  });

  it("ignora linhas sem data e devolve null quando nenhuma tem", () => {
    expect(
      latestMonthWithData([
        row({ receiveDate: null }),
        row({ receiveDate: "2025-12-31" }),
      ])
    ).toEqual({ year: 2025, month: 12 });
    expect(latestMonthWithData([row({ receiveDate: null })])).toBeNull();
  });
});
