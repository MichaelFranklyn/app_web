import { describe, expect, it } from "vitest";
import { CommissionRow } from "./interface";
import {
  addMonths,
  factoryHighlights,
  filterByMonth,
  filterByTab,
  groupByFactory,
  isInMonth,
  boletoLabel,
  monthReport,
  officeSplit,
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

describe("monthReport", () => {
  const march = { year: 2026, month: 3 };

  it("separa as três seções de comissão pelo mês em que a comissão cai", () => {
    const report = monthReport(
      [
        row({ installmentId: "a", amount: "10", receiveDate: "2026-03-10" }),
        row({ installmentId: "b", amount: "7.5", receiveDate: "2026-03-20" }),
        row({
          installmentId: "c",
          amount: "5",
          status: "received",
          receiveDate: "2026-03-05",
        }),
        row({
          installmentId: "d",
          amount: "3",
          status: "pending",
          receiveDate: "2026-03-28",
        }),
        // Fora: cai em abril.
        row({ installmentId: "e", amount: "99", receiveDate: "2026-04-01" }),
      ],
      march
    );

    expect(report.receivable.total).toBe(17.5);
    expect(report.received.total).toBe(5);
    expect(report.pending.total).toBe(3);
    // O previsto NÃO entra no total: ainda não é dinheiro de ninguém.
    expect(report.total).toBe(22.5);
    expect(report.count).toBe(4);
  });

  it("leva estorno e devolução para o a receber, que fecha no líquido", () => {
    // É o mesmo bolso e o mesmo mês: separá-los faria o gestor somar de cabeça.
    const report = monthReport(
      [
        row({ installmentId: "a", amount: "10" }),
        row({ installmentId: "b", amount: "-4", status: "chargeback" }),
        row({ installmentId: "c", amount: "2", status: "refund" }),
      ],
      march
    );

    expect(report.receivable.count).toBe(3);
    expect(report.receivable.total).toBe(8);
  });

  it("agrupa cada seção por fábrica e ordena por data de recebimento", () => {
    const report = monthReport(
      [
        row({
          installmentId: "tarde",
          receiveDate: "2026-03-28",
          factory: { id: "f1", nomeFantasia: "Alfa", razaoSocial: "A" },
        }),
        row({
          installmentId: "cedo",
          receiveDate: "2026-03-02",
          factory: { id: "f1", nomeFantasia: "Alfa", razaoSocial: "A" },
        }),
        row({
          installmentId: "outra",
          receiveDate: "2026-03-15",
          factory: { id: "f2", nomeFantasia: "Zeta", razaoSocial: "Z" },
        }),
      ],
      march
    );

    expect(report.receivable.groups.map((g) => g.name)).toEqual([
      "Alfa",
      "Zeta",
    ]);
    expect(
      report.receivable.groups[0].rows.map((r) => r.installmentId)
    ).toEqual(["cedo", "tarde"]);
  });

  it("lista os boletos liquidados pelo mês do PAGAMENTO, não do da comissão", () => {
    // O cliente pagou em março; a comissão desse boleto só cai em abril. Se a
    // seção seguisse a data da comissão, o pagamento sumiria do papel do mês.
    const report = monthReport(
      [
        row({
          installmentId: "pago",
          paidAt: "2026-03-12",
          receiveDate: "2026-04-10",
        }),
        row({ installmentId: "aberto", paidAt: null }),
      ],
      march
    );

    expect(report.settled.map((r) => r.installmentId)).toEqual(["pago"]);
  });

  it("traz os inadimplentes de todos os vencimentos, não só do mês", () => {
    // Calote não é evento de mês: ele fica travado até ser resolvido, e a
    // planilha da fábrica vem com vencimentos misturados.
    const report = monthReport(
      [
        row({
          installmentId: "velho",
          defaultedAt: "2025-11-02",
          dueDate: "2025-10-30",
          receiveDate: "2025-11-10",
        }),
        row({ installmentId: "ok" }),
      ],
      march
    );

    expect(report.defaulted.map((r) => r.installmentId)).toEqual(["velho"]);
  });

  it("devolve tudo vazio quando o mês não tem nada", () => {
    const report = monthReport([row({ receiveDate: "2026-04-01" })], march);

    expect(report.count).toBe(0);
    expect(report.total).toBe(0);
    expect(report.defaulted).toEqual([]);
    expect(report.settled).toEqual([]);
  });
});

describe("boletoLabel", () => {
  it("o calote manda, mesmo com vencimento no futuro", () => {
    expect(
      boletoLabel(row({ defaultedAt: "2026-03-12", dueDate: "2026-09-01" }))
    ).toBe("Não pagou 12/03/2026");
  });

  it("diz quando o cliente pagou, venceu ou ainda vai vencer", () => {
    expect(boletoLabel(row({ paidAt: "2026-03-02" }))).toBe("Pago 02/03/2026");
    expect(boletoLabel(row({ isOverdue: true, dueDate: "2026-02-10" }))).toBe(
      "Vencido 10/02/2026"
    );
    expect(boletoLabel(row({ dueDate: "2026-05-10" }))).toBe(
      "Vence 10/05/2026"
    );
    expect(boletoLabel(row({ dueDate: null }))).toBe("—");
  });
});

describe("officeSplit", () => {
  const march = { year: 2026, month: 3 };

  it("mede as duas pontas sobre as mesmas parcelas", () => {
    // A fábrica paga 100 ao escritório, que repassa 60 ao vendedor: sobram 40.
    const split = officeSplit(
      [
        row({ installmentId: "a", amount: "100", sellerAmount: "60" }),
        // Fora do mês: nem a comissão nem o repasse entram.
        row({
          installmentId: "b",
          amount: "500",
          sellerAmount: "300",
          receiveDate: "2026-04-10",
        }),
      ],
      march
    );

    expect(split.company).toBe(100);
    expect(split.seller).toBe(60);
    expect(split.office).toBe(40);
    expect(split.margin).toBeCloseTo(0.4);
    expect(split.count).toBe(1);
  });

  it("soma o que já foi recebido junto com o que há a receber", () => {
    // A pergunta é "quanto a fábrica paga neste mês", e o que já entrou é parte
    // disso — só o previsto fica de fora, porque ainda depende de acontecer.
    const split = officeSplit(
      [
        row({ installmentId: "a", amount: "10", sellerAmount: "5" }),
        row({
          installmentId: "b",
          amount: "20",
          sellerAmount: "8",
          status: "received",
        }),
        row({
          installmentId: "c",
          amount: "50",
          sellerAmount: "25",
          status: "pending",
        }),
      ],
      march
    );

    expect(split.company).toBe(30);
    expect(split.office).toBe(17);
  });

  it("não divide por zero num mês sem comissão", () => {
    const split = officeSplit([row({ status: "pending" })], march);

    expect(split.margin).toBe(0);
    expect(split.count).toBe(0);
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
