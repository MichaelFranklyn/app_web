import { describe, expect, it } from "vitest";
import { CommissionRow } from "./interface";
import {
  addMonths,
  factoryHighlights,
  filterByMonth,
  filterByTab,
  groupByFactory,
  isInMonth,
  latestMonthWithData,
  receivableReport,
  summarizeRows,
  yearMonthFromIso,
  defaultImpact,
} from "./utils";

const row = (over: Partial<CommissionRow>): CommissionRow => ({
  orderId: "o1",
  installmentId: "i1",
  sequence: 1,
  orderDate: "2026-03-01",
  invoicedAt: null,
  invoiceNumber: null,
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
  isOverdue: false,
  defaultedAt: null,
  isChargebackSettled: false,
  chargebackSettledAt: null,
  sellerAmount: "5",
  sellerStatus: "receivable",
  sellerReceiveDate: "2026-03-10",
  isSellerPaid: false,
  sellerChargebackMonth: null,
  isSellerChargebackSettled: false,
  sellerChargebackSettledAt: null,
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
      row({
        installmentId: "d",
        status: "pending",
        amount: "3",
        isReceivable: false,
      }),
    ]);
    expect(summary.receivable).toBe(17);
    expect(summary.received).toBe(5);
    expect(summary.pending).toBe(3);
    expect(summary.reconciledCount).toBe(1);
    expect(summary.receivableIds).toEqual(["a", "c"]);
  });

  it("zera tudo para uma lista vazia", () => {
    expect(summarizeRows([])).toEqual({
      refund: 0,
      receivable: 0,
      received: 0,
      pending: 0,
      chargeback: 0,
      reconciledCount: 0,
      receivableIds: [],
      overdueCount: 0,
    });
  });
});

describe("factoryHighlights", () => {
  const summary = summarizeRows([
    row({ installmentId: "a", status: "receivable", amount: "10" }),
    row({ installmentId: "b", status: "received", amount: "5" }),
    row({ installmentId: "c", status: "pending", amount: "3" }),
  ]);

  it("destaca só o valor da situação filtrada", () => {
    expect(factoryHighlights(summary, "receivable")).toEqual([
      { label: "A receber", value: 10, color: "amber" },
    ]);
    expect(factoryHighlights(summary, "received")).toEqual([
      { label: "Recebido", value: 5, color: "green" },
    ]);
    expect(factoryHighlights(summary, "pending")).toEqual([
      { label: "Previsto", value: 3 },
    ]);
  });

  it("com todas as situações, mostra a receber e recebido", () => {
    expect(factoryHighlights(summary, "all").map((h) => h.label)).toEqual([
      "A receber",
      "Recebido",
    ]);
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

describe("estorno nos subtotais", () => {
  it("desconta o estorno do que há a receber", () => {
    // O cartão da fábrica precisa fechar no LÍQUIDO: a fábrica paga 10 e
    // desconta 4 do calote, então o mês vale 6.
    const summary = summarizeRows([
      row({ installmentId: "a", status: "receivable", amount: "10" }),
      row({ installmentId: "b", status: "chargeback", amount: "-4" }),
    ]);
    expect(summary.receivable).toBe(6);
    expect(summary.chargeback).toBe(-4);
    // O estorno não é uma parcela a receber: não entra no repasse em massa.
    expect(summary.receivableIds).toEqual(["a"]);
  });

  it("conta boleto vencido e calote como atraso", () => {
    const summary = summarizeRows([
      row({ installmentId: "a", isOverdue: true }),
      row({ installmentId: "b", defaultedAt: "2026-03-20" }),
      row({ installmentId: "c" }),
    ]);
    expect(summary.overdueCount).toBe(2);
  });
});

describe("filterByTab", () => {
  const rows = [
    row({ installmentId: "a", status: "receivable" }),
    row({ installmentId: "b", status: "received" }),
    row({ installmentId: "c", status: "receivable", isOverdue: true }),
    row({ installmentId: "d", status: "cancelled", defaultedAt: "2026-03-20" }),
  ];

  it("filtra pelo status da comissão nas abas de comissão", () => {
    expect(filterByTab(rows, "received").map((r) => r.installmentId)).toEqual([
      "b",
    ]);
  });

  it('junta vencido e calote em "Boleto em atraso"', () => {
    // Vencido ainda tem comissão a receber (modo Faturamento) e calote já foi
    // cancelado: a aba é do BOLETO, não do status da comissão.
    expect(filterByTab(rows, "overdue").map((r) => r.installmentId)).toEqual([
      "c",
      "d",
    ]);
  });

  it("não filtra nada em Todas", () => {
    expect(filterByTab(rows, "all")).toHaveLength(4);
  });
});

describe("filterByMonth", () => {
  const rows = [
    row({
      installmentId: "a",
      receiveDate: "2026-03-10",
      dueDate: "2026-01-05",
    }),
    row({
      installmentId: "b",
      receiveDate: "2026-05-10",
      dueDate: "2026-03-05",
    }),
  ];

  it("usa a data do recebimento nas abas de comissão", () => {
    expect(
      filterByMonth(rows, { year: 2026, month: 3 }, "receivable").map(
        (r) => r.installmentId
      )
    ).toEqual(["a"]);
  });

  it("não recorta a aba de boleto em atraso", () => {
    // Atraso é acúmulo, não evento de mês: a conferência é feita contra o
    // relatório da fábrica, que vem com vencimentos espalhados. Recortando,
    // seria um lote por mês de vencimento para um relatório só.
    expect(
      filterByMonth(rows, { year: 2026, month: 3 }, "overdue").map(
        (r) => r.installmentId
      )
    ).toEqual(["a", "b"]);
  });
});

describe("estorno e devolução no fechamento", () => {
  const estorno = row({
    installmentId: "i-estorno",
    status: "chargeback",
    amount: "-30",
    receiveDate: "2026-03-10",
  });
  const descontado = row({
    installmentId: "i-descontado",
    status: "chargeback_settled",
    amount: "-30",
    receiveDate: "2026-03-10",
  });
  const devolucao = row({
    installmentId: "i-devolucao",
    status: "refund",
    amount: "30",
    receiveDate: "2026-03-10",
  });

  it("a aba A receber mostra o que compõe o fechamento, não só o positivo", () => {
    // Estorno e devolução caem no mesmo mês e no mesmo bolso: separá-los faria
    // o gestor somar de cabeça para saber quanto entra.
    const rows = [row({}), estorno, devolucao, descontado];
    const ids = filterByTab(rows, "receivable").map((r) => r.installmentId);
    expect(ids).toEqual(["i1", "i-estorno", "i-devolucao"]);
  });

  it("estorno já descontado não pesa mais no total", () => {
    // Ele saiu no mês em que saiu; repetir a conta cobraria a dívida duas vezes.
    const summary = summarizeRows([row({}), descontado]);
    expect(summary.receivable).toBe(10);
    expect(summary.chargeback).toBe(0);
  });

  it("devolução soma como dinheiro que volta", () => {
    const summary = summarizeRows([estorno, devolucao]);
    expect(summary.chargeback).toBe(-30);
    expect(summary.refund).toBe(30);
    // Um anula o outro: o mês fecha zerado, que é o certo.
    expect(summary.receivable).toBe(0);
  });
});

describe("defaultImpact", () => {
  const julho = { year: 2026, month: 7 };
  const vendedor = { id: "s1", name: "Rafael" };

  const paga = (over: Partial<CommissionRow>) =>
    row({
      status: "received",
      isReceived: true,
      isSellerPaid: true,
      seller: vendedor,
      amount: "400",
      sellerAmount: "200",
      receiveDate: "2026-07-10",
      ...over,
    });

  it("soma o que volta para a fábrica e o que há a recuperar do vendedor", () => {
    const a = paga({ installmentId: "a" });
    const b = paga({ installmentId: "b" });
    const mes = row({
      installmentId: "mes",
      status: "receivable",
      seller: vendedor,
      sellerStatus: "receivable",
      sellerAmount: "1000",
      receiveDate: "2026-07-10",
      sellerReceiveDate: "2026-07-10",
    });

    const impacto = defaultImpact([a, b], [a, b, mes], julho);

    expect(impacto.factoryChargeback).toBe(800);
    expect(impacto.sellers).toHaveLength(1);
    expect(impacto.sellers[0].amount).toBe(400);
    // Medido contra o fechamento DO VENDEDOR (sellerAmount pela data dele), e
    // não contra o do escritório: são dois números diferentes.
    expect(impacto.sellers[0].monthCommission).toBe(1000);
    expect(impacto.sellers[0].share).toBeCloseTo(0.4);
  });

  it("parcela sem comissão paga não gera dívida para ninguém", () => {
    const prevista = row({ installmentId: "p", status: "receivable" });
    const impacto = defaultImpact([prevista], [prevista], julho);

    expect(impacto.factoryChargeback).toBe(0);
    expect(impacto.sellers).toHaveLength(0);
    expect(impacto.withoutDebt).toBe(1);
  });

  it("mês sem comissão nenhuma conta como mês inteiro consumido", () => {
    // Dividir por zero mostraria "Infinity% do mês" na tela.
    const a = paga({ installmentId: "a" });
    const impacto = defaultImpact([a], [a], { year: 2026, month: 12 });

    expect(impacto.sellers[0].monthCommission).toBe(0);
    expect(impacto.sellers[0].share).toBe(1);
  });
});
