import { describe, expect, it } from "vitest";

import { CommissionRow } from "./interface";
import {
  buildCommissionsExportRows,
  byFactory,
  filterByPeriod,
  sortForReport,
  summarize,
} from "./utils";

const row = (over: Partial<CommissionRow> = {}): CommissionRow => ({
  orderId: "o1",
  installmentId: "i1",
  sequence: 1,
  orderDate: "2026-06-10",
  invoicedAt: "2026-06-20",
  dueDate: "2026-07-20",
  paidAt: null,
  installmentAmount: "1000.00",
  amount: "30.00",
  status: "receivable",
  receiveDate: "2026-07-20",
  isReceivable: true,
  isReceived: false,
  isReconciled: false,
  reconciledAt: null,
  client: {
    id: "c1",
    razaoSocial: "CASA DO SONO LTDA",
    nomeFantasia: "Casa do Sono",
  },
  factory: { id: "f1", razaoSocial: "HERC LTDA", nomeFantasia: "Herc" },
  seller: { id: "s1", name: "Rafael" },
  ...over,
});

describe("filterByPeriod", () => {
  it("recorta pela data em que a comissão CAI, não pela do pedido", () => {
    // Pedido de junho, faturado em junho, com prazo de 30 dias: a comissão é de
    // julho, e é em julho que ela tem de aparecer.
    const rows = [
      row({ installmentId: "junho", receiveDate: "2026-06-15" }),
      row({ installmentId: "julho", receiveDate: "2026-07-20" }),
    ];

    const julho = filterByPeriod(rows, "2026-07-01", "2026-07-31");
    expect(julho.map((r) => r.installmentId)).toEqual(["julho"]);
  });

  it("inclui as duas pontas do período", () => {
    const rows = [
      row({ installmentId: "primeiro", receiveDate: "2026-07-01" }),
      row({ installmentId: "ultimo", receiveDate: "2026-07-31" }),
    ];
    expect(filterByPeriod(rows, "2026-07-01", "2026-07-31")).toHaveLength(2);
  });

  it("parcela sem data de recebimento fica fora de qualquer período", () => {
    // Ainda não tem quando cair: depende do faturamento da fábrica.
    const rows = [row({ receiveDate: null })];
    expect(filterByPeriod(rows, "2026-01-01", "2036-12-31")).toEqual([]);
  });
});

describe("summarize", () => {
  it("separa a comissão nas três situações", () => {
    const totals = summarize([
      row({ status: "receivable", amount: "30" }),
      row({ status: "receivable", amount: "20" }),
      row({ status: "received", amount: "50" }),
      row({ status: "pending", amount: "10" }),
    ]);

    expect(totals.receivable).toBe(50);
    expect(totals.countReceivable).toBe(2);
    expect(totals.received).toBe(50);
    expect(totals.pending).toBe(10);
    expect(totals.count).toBe(4);
  });

  it("cancelada não entra em nenhuma soma, mas é contada como linha", () => {
    const totals = summarize([row({ status: "cancelled", amount: "999" })]);
    expect(totals.receivable + totals.received + totals.pending).toBe(0);
    expect(totals.count).toBe(1);
  });
});

describe("byFactory", () => {
  it("agrupa por fábrica e ordena pela maior comissão do período", () => {
    const groups = byFactory([
      row({
        factory: { id: "f1", razaoSocial: "HERC LTDA", nomeFantasia: "Herc" },
        amount: "10",
      }),
      row({
        factory: { id: "f2", razaoSocial: "DELTA LTDA", nomeFantasia: "Delta" },
        amount: "100",
      }),
      row({
        factory: { id: "f2", razaoSocial: "DELTA LTDA", nomeFantasia: "Delta" },
        amount: "50",
      }),
    ]);

    expect(groups.map((g) => g.name)).toEqual(["Delta", "Herc"]);
    expect(groups[0].receivable).toBe(150);
    expect(groups[0].count).toBe(2);
  });

  it("parcela sem fábrica não derruba o agrupamento", () => {
    const groups = byFactory([row({ factory: null })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("—");
  });
});

describe("sortForReport", () => {
  it("ordena pela data de recebimento e, no empate, por cliente", () => {
    const rows = [
      row({
        installmentId: "b",
        receiveDate: "2026-07-20",
        client: { id: "c2", razaoSocial: "ZEBRA LTDA", nomeFantasia: null },
      }),
      row({
        installmentId: "a",
        receiveDate: "2026-07-20",
        client: { id: "c1", razaoSocial: "ALFA LTDA", nomeFantasia: null },
      }),
      row({ installmentId: "antes", receiveDate: "2026-07-05" }),
    ];

    expect(sortForReport(rows).map((r) => r.installmentId)).toEqual([
      "antes",
      "a",
      "b",
    ]);
  });

  it("parcela sem data vai para o fim", () => {
    const rows = [
      row({ installmentId: "sem", receiveDate: null }),
      row({ installmentId: "com", receiveDate: "2026-07-20" }),
    ];
    expect(sortForReport(rows).map((r) => r.installmentId)).toEqual([
      "com",
      "sem",
    ]);
  });

  it("não altera o array recebido", () => {
    const rows = [
      row({ installmentId: "b", receiveDate: "2026-07-20" }),
      row({ installmentId: "a", receiveDate: "2026-07-01" }),
    ];
    sortForReport(rows);
    expect(rows.map((r) => r.installmentId)).toEqual(["b", "a"]);
  });
});

describe("buildCommissionsExportRows", () => {
  it("grava valor da parcela e comissão como número", () => {
    const [line] = buildCommissionsExportRows([row()]);
    expect(line[5]).toBe(1000);
    expect(line[6]).toBe(30);
  });

  it("traduz a situação para o rótulo do sistema", () => {
    const [line] = buildCommissionsExportRows([row({ status: "received" })]);
    expect(line[7]).toBe("Recebido");
  });

  it("marca a conferência com sim/não", () => {
    const [conferida] = buildCommissionsExportRows([
      row({ isReconciled: true }),
    ]);
    const [pendente] = buildCommissionsExportRows([
      row({ isReconciled: false }),
    ]);
    expect(conferida[8]).toBe("Sim");
    expect(pendente[8]).toBe("Não");
  });
});
