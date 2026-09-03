import { describe, expect, it } from "vitest";

import { CommissionRow } from "./interface";
import {
  buildCommissionsExportRows,
  byFactory,
  commissionsExportHeaders,
  filterByPeriod,
  sortForReport,
  splitTotals,
  summarize,
} from "./utils";

/** A coluna pelo cabeçalho: inserir uma coluna no meio não quebra a asserção. */
const col = (header: string, withOffice = false) =>
  commissionsExportHeaders(withOffice).indexOf(header);

/** A planilha do vendedor: sem a repartição, que é coisa de quem gerencia. */
const exportRows = (rows: CommissionRow[]) =>
  buildCommissionsExportRows(rows, false);

const row = (over: Partial<CommissionRow> = {}): CommissionRow => ({
  orderId: "o1",
  installmentId: "i1",
  sequence: 1,
  orderDate: "2026-06-10",
  invoicedAt: "2026-06-20",
  invoiceNumber: "12345",
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
  isOverdue: false,
  defaultedAt: null,
  sellerAmount: "18.00",
  sellerStatus: "receivable",
  sellerReceiveDate: "2026-07-20",
  isSellerPaid: false,
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
    const [line] = exportRows([row()]);
    expect(line[col("Valor da parcela")]).toBe(1000);
    expect(line[col("Comissão")]).toBe(30);
  });

  it("traduz a situação para o rótulo do sistema", () => {
    const [line] = exportRows([row({ status: "received" })]);
    expect(line[col("Situação")]).toBe("Recebido");
  });

  it("marca a conferência com sim/não", () => {
    const [conferida] = exportRows([row({ isReconciled: true })]);
    const [pendente] = exportRows([row({ isReconciled: false })]);
    expect(conferida[col("Conferida")]).toBe("Sim");
    expect(pendente[col("Conferida")]).toBe("Não");
  });

  it("leva a nota fiscal, e marca com traço o pedido que ainda não tem", () => {
    // A planilha da fábrica vem pela nota: sem ela na exportação, conferir o
    // repasse volta a ser casar cliente + valor no olho.
    const [comNota] = exportRows([row({ invoiceNumber: "88" })]);
    const [semNota] = exportRows([row({ invoiceNumber: null })]);
    expect(comNota[col("Nota fiscal")]).toBe("88");
    expect(semNota[col("Nota fiscal")]).toBe("—");
  });
});

describe("repartição entre a empresa e o vendedor", () => {
  it("mede as duas pontas sobre as mesmas parcelas", () => {
    // A fábrica paga 30 ao escritório, que repassa 18 ao vendedor: sobram 12.
    const split = splitTotals([row()]);

    expect(split.company).toBe(30);
    expect(split.seller).toBe(18);
    expect(split.office).toBe(12);
    expect(split.margin).toBeCloseTo(0.4);
  });

  it("ignora as situações que o relatório não conta", () => {
    // Cancelada nunca gerou comissão e estorno já descontado virou histórico:
    // somá-las faria a repartição não fechar com o total do período ao lado.
    const split = splitTotals([
      row({ status: "cancelled", amount: "99", sellerAmount: "50" }),
      row({ status: "chargeback_settled", amount: "-99", sellerAmount: "-50" }),
      row(),
    ]);

    expect(split.company).toBe(30);
    expect(split.office).toBe(12);
  });

  it("desconta o estorno dos dois lados", () => {
    // O calote volta para a fábrica E é recuperado do vendedor: o líquido cai
    // nas duas pontas, senão a margem apareceria maior do que é.
    const split = splitTotals([
      row(),
      row({ status: "chargeback", amount: "-10", sellerAmount: "-6" }),
    ]);

    expect(split.company).toBe(20);
    expect(split.seller).toBe(12);
    expect(split.office).toBe(8);
  });

  it("não divide por zero num período sem comissão", () => {
    expect(splitTotals([]).margin).toBe(0);
  });

  it("a planilha do gestor abre a comissão em três colunas", () => {
    const [line] = buildCommissionsExportRows([row()], true);

    expect(line[col("Comissão da empresa", true)]).toBe(30);
    expect(line[col("Repasse ao vendedor", true)]).toBe(18);
    expect(line[col("Fica no escritório", true)]).toBe(12);
    // O vendedor continua vendo uma coluna só, com o nome antigo.
    expect(col("Repasse ao vendedor")).toBe(-1);
  });
});

describe("devolução no total do período", () => {
  it("soma a devolução ao que há a receber", () => {
    // O cliente pagou depois de o desconto ter saído: o valor volta pelo mesmo
    // fechamento. Fora daqui, ele sumia do total.
    const totals = summarize([
      row({ amount: "10" }),
      row({ status: "refund", amount: "4" }),
    ]);

    expect(totals.receivable).toBe(14);
  });
});
