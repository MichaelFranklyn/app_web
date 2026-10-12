import { describe, expect, it } from "vitest";
import { CommissionRow } from "./interface";
import {
  addMonths,
  factoryGroupFromServer,
  factoryHighlights,
  groupByFactory,
  isInMonth,
  boletoLabel,
  lensFor,
  monthReport,
  OFFICE_LENS,
  OWN_SELLER_LENS,
  SELLER_LENS,
  monthSummaryFromServer,
  officeSplitFromServer,
  selectionScope,
  type RowsSummary,
  type YearMonth,
  yearMonthFromIso,
  defaultImpact,
  pdfVariables,
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

describe("factoryGroupFromServer", () => {
  it("lê o cartão que o servidor somou, com decimais virando número", () => {
    const group = factoryGroupFromServer({
      factoryId: "f1",
      name: "Alfa",
      count: 4,
      reconciledCount: 1,
      receivable: "17.00",
      received: "5.00",
      pending: "3.00",
      chargeback: "-2.50",
      refund: "0",
      overdueCount: 2,
      receivableIds: ["a", "c"],
    });

    expect(group).toEqual({
      factoryId: "f1",
      name: "Alfa",
      // O total é o da fábrica no recorte — não o da página aberta.
      count: 4,
      summary: {
        receivable: 17,
        received: 5,
        pending: 3,
        chargeback: -2.5,
        refund: 0,
        reconciledCount: 1,
        receivableIds: ["a", "c"],
        overdueCount: 2,
      },
    });
  });
});

describe("monthSummaryFromServer e officeSplitFromServer", () => {
  it("leem os cartões do mês e a repartição como o servidor mandou", () => {
    expect(
      monthSummaryFromServer({
        receivable: "80.00",
        received: "50.00",
        pending: "5.00",
        countReceivable: 1,
        chargeback: "-30.00",
        refund: "10.00",
      })
    ).toEqual({
      receivable: 80,
      received: 50,
      pending: 5,
      countReceivable: 1,
      chargeback: -30,
      refund: 10,
    });
    expect(
      officeSplitFromServer({
        company: "1300.00",
        seller: "550.00",
        office: "750.00",
        margin: 0.5769,
        count: 2,
      })
    ).toEqual({
      company: 1300,
      seller: 550,
      office: 750,
      margin: 0.5769,
      count: 2,
    });
  });

  it("sem resposta ainda, tudo é zero — e não NaN nos cartões", () => {
    expect(monthSummaryFromServer(undefined).receivable).toBe(0);
    expect(officeSplitFromServer(undefined)).toEqual({
      company: 0,
      seller: 0,
      office: 0,
      margin: 0,
      count: 0,
    });
  });
});

describe("factoryHighlights", () => {
  const summary: RowsSummary = {
    receivable: 10,
    received: 5,
    pending: 3,
    chargeback: 0,
    refund: 0,
    reconciledCount: 0,
    receivableIds: ["a"],
    overdueCount: 0,
  };

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

  describe("prévia do mês seguinte", () => {
    /**
     * A pergunta que vem logo depois de "quanto entra neste mês". O dado já
     * existe: a comissão nasce com data de recebimento no faturamento, então
     * boa parte do mês que vem já está lançada quando este fecha.
     */
    it("soma o que já está lançado para o mês seguinte", () => {
      const report = monthReport(
        [
          row({ installmentId: "a", amount: "10", receiveDate: "2026-03-10" }),
          row({ installmentId: "b", amount: "40", receiveDate: "2026-04-10" }),
          row({
            installmentId: "c",
            amount: "6",
            status: "pending",
            receiveDate: "2026-04-20",
          }),
          // Maio não é "o próximo mês" de março.
          row({ installmentId: "d", amount: "99", receiveDate: "2026-05-10" }),
        ],
        march
      );

      expect(report.next.month).toEqual({ year: 2026, month: 4 });
      expect(report.next.receivable).toBe(40);
      // Previsto fica FORA do firme, como no total do mês.
      expect(report.next.pending).toBe(6);
      expect(report.next.count).toBe(2);
    });

    it("vira o ano em dezembro", () => {
      const report = monthReport(
        [row({ installmentId: "a", amount: "30", receiveDate: "2027-01-10" })],
        { year: 2026, month: 12 }
      );

      expect(report.next.month).toEqual({ year: 2027, month: 1 });
      expect(report.next.receivable).toBe(30);
    });

    it("estorno agendado para o mês seguinte entra no líquido", () => {
      // É o mesmo bolso: prometer o bruto faria o vendedor cobrar a diferença.
      const report = monthReport(
        [
          row({ installmentId: "a", amount: "50", receiveDate: "2026-04-10" }),
          row({
            installmentId: "b",
            amount: "-20",
            status: "chargeback",
            receiveDate: "2026-04-10",
          }),
        ],
        march
      );

      expect(report.next.receivable).toBe(30);
    });

    it("mês seguinte vazio não é erro: é um mês ainda não faturado", () => {
      const report = monthReport(
        [row({ installmentId: "a", amount: "10", receiveDate: "2026-03-10" })],
        march
      );

      expect(report.next.receivable).toBe(0);
      expect(report.next.count).toBe(0);
    });
  });

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

describe("defaultImpact", () => {
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

    // A comissão do mês do vendedor vem somada do servidor, pelo calendário
    // DELE — e não das linhas da página, que são de uma fábrica só.
    const impacto = defaultImpact([a, b], { s1: 1000 });

    expect(impacto.factoryChargeback).toBe(800);
    expect(impacto.sellers).toHaveLength(1);
    expect(impacto.sellers[0].amount).toBe(400);
    expect(impacto.sellers[0].monthCommission).toBe(1000);
    expect(impacto.sellers[0].share).toBeCloseTo(0.4);
  });

  it("parcela sem comissão paga não gera dívida para ninguém", () => {
    const prevista = row({ installmentId: "p", status: "receivable" });
    const impacto = defaultImpact([prevista], {});

    expect(impacto.factoryChargeback).toBe(0);
    expect(impacto.sellers).toHaveLength(0);
    expect(impacto.withoutDebt).toBe(1);
  });

  it("mês sem comissão nenhuma conta como mês inteiro consumido", () => {
    // Dividir por zero mostraria "Infinity% do mês" na tela.
    const a = paga({ installmentId: "a" });
    const impacto = defaultImpact([a], {});

    expect(impacto.sellers[0].monthCommission).toBe(0);
    expect(impacto.sellers[0].share).toBe(1);
  });
});

describe("as duas óticas do fechamento", () => {
  /**
   * Cada parcela carrega duas comissões: a do escritório (o que a fábrica
   * repassa) e a do vendedor (a fatia dele, no ciclo dele). O PDF somava sempre
   * a primeira, então o papel de um vendedor específico saía com o nome dele no
   * cabeçalho e o dinheiro da empresa nas colunas.
   */
  const marco: YearMonth = { year: 2026, month: 3 };

  const parcelas = [
    row({
      installmentId: "a",
      amount: "100",
      sellerAmount: "40",
      receiveDate: "2026-03-10",
      sellerReceiveDate: "2026-03-10",
    }),
    row({
      installmentId: "b",
      amount: "200",
      sellerAmount: "80",
      receiveDate: "2026-03-20",
      sellerReceiveDate: "2026-03-20",
    }),
  ];

  it("o escritório soma o que a fábrica repassa", () => {
    expect(monthReport(parcelas, marco, OFFICE_LENS).total).toBe(300);
  });

  it("o vendedor soma só a fatia dele", () => {
    expect(monthReport(parcelas, marco, SELLER_LENS).total).toBe(120);
  });

  it("o subtotal por fábrica também muda de ótica", () => {
    // O subtotal é o número que se compara com a planilha; se ele ficasse na
    // ótica do escritório, o papel do vendedor não fecharia com o próprio total.
    const office = monthReport(parcelas, marco, OFFICE_LENS);
    const seller = monthReport(parcelas, marco, SELLER_LENS);
    expect(office.receivable.groups[0].subtotal).toBe(300);
    expect(seller.receivable.groups[0].subtotal).toBe(120);
  });

  it("o vendedor é lido pelo calendário DELE", () => {
    // A fatia do vendedor cai num mês diferente do repasse da fábrica: é o
    // caso comum, porque o escritório paga no ciclo dele. Ler a fatia pela data
    // do escritório poria o dinheiro no mês errado.
    const atrasada = [
      row({
        amount: "100",
        sellerAmount: "40",
        receiveDate: "2026-03-10",
        sellerReceiveDate: "2026-04-05",
      }),
    ];
    expect(monthReport(atrasada, marco, OFFICE_LENS).total).toBe(100);
    expect(monthReport(atrasada, marco, SELLER_LENS).total).toBe(0);
    expect(
      monthReport(atrasada, { year: 2026, month: 4 }, SELLER_LENS).total
    ).toBe(40);
  });

  it("a situação também é a do vendedor", () => {
    // A fábrica já repassou ao escritório, mas o escritório ainda não repassou
    // ao vendedor: a mesma parcela é "recebida" numa ótica e "a receber" na
    // outra, e cada papel tem de mostrar a sua.
    const meioCaminho = [
      row({
        amount: "100",
        sellerAmount: "40",
        status: "received",
        sellerStatus: "receivable",
      }),
    ];
    const office = monthReport(meioCaminho, marco, OFFICE_LENS);
    const seller = monthReport(meioCaminho, marco, SELLER_LENS);
    expect(office.received.total).toBe(100);
    expect(office.receivable.total).toBe(0);
    expect(seller.received.total).toBe(0);
    expect(seller.receivable.total).toBe(40);
  });

  it("a prévia do mês seguinte segue a mesma ótica", () => {
    const abril = [
      row({
        amount: "500",
        sellerAmount: "200",
        receiveDate: "2026-04-10",
        sellerReceiveDate: "2026-04-10",
      }),
    ];
    expect(monthReport(abril, marco, OFFICE_LENS).next.receivable).toBe(500);
    expect(monthReport(abril, marco, SELLER_LENS).next.receivable).toBe(200);
  });

  describe("lensFor", () => {
    it("o gestor escolhe de quem é o papel", () => {
      expect(lensFor("seller", true)).toBe(SELLER_LENS);
      expect(lensFor("office", true)).toBe(OFFICE_LENS);
    });

    it("o vendedor logado só tem a ótica dele, e lê os campos principais", () => {
      // O backend monta a lista no nível de quem pergunta: para o vendedor,
      // `amount` JÁ é a fatia dele e `sellerAmount` repete o mesmo número.
      // Se a lista um dia passar a vir sempre no nível do escritório, é ESTA
      // lente que muda — e o papel dele não pode virar o da empresa calado.
      const lente = lensFor("office", false);
      expect(lente).toBe(OWN_SELLER_LENS);
      expect(lensFor("seller", false)).toBe(OWN_SELLER_LENS);

      const linha = row({ amount: "40", sellerAmount: "40" });
      expect(lente.amount(linha)).toBe(40);
      expect(lente.audience).toBe("seller");
    });

    it("cada ótica nomeia quem paga", () => {
      // O extrato do vendedor não pode dizer "a receber das fábricas": quem
      // deve a ele é o escritório, e o papel impresso não tem outra pista.
      expect(OFFICE_LENS.receivableLabel).toContain("fábricas");
      expect(SELLER_LENS.receivableLabel).toContain("escritório");
      expect(SELLER_LENS.receivedLabel).toContain("repassado");
      expect(OFFICE_LENS.title).not.toBe(SELLER_LENS.title);
      // Os dois papéis do mesmo mês convivem na pasta de downloads.
      expect(OFFICE_LENS.fileTag).not.toBe(SELLER_LENS.fileTag);
    });
  });

  it("o padrão do monthReport continua o do escritório", () => {
    // Compatibilidade: a tela e os outros consumidores chamam sem lente.
    expect(monthReport(parcelas, marco).total).toBe(
      monthReport(parcelas, marco, OFFICE_LENS).total
    );
  });
});

describe("pdfVariables", () => {
  it("pede o mês e o seguinte (prévia), o boleto pago no mês — e nada da carteira inteira", () => {
    expect(pdfVariables("s1", { year: 2026, month: 12 })).toEqual({
      sellerId: "s1",
      from: "2026-12-01",
      to: "2027-01-31",
      paidFrom: "2026-12-01",
      paidTo: "2026-12-31",
    });
  });
});

describe("selectionScope", () => {
  const base = { factoryName: "Herc", periodLabel: "agosto de 2026" };

  it("sem seleção, só o recorte", () => {
    expect(
      selectionScope({ ...base, selected: 0, total: 120, offPage: 0 })
    ).toEqual({ label: "agosto de 2026", sentence: "" });
  });

  it("diz quanto da fábrica foi marcado", () => {
    const scope = selectionScope({
      ...base,
      selected: 50,
      total: 120,
      offPage: 0,
    });
    expect(scope.label).toBe(
      "Herc · agosto de 2026 · 50 de 120 parcelas desta fábrica"
    );
    expect(scope.sentence).toBe(
      "Esta ação vale para as 50 parcelas selecionadas de Herc (agosto de 2026)."
    );
  });

  it("seleção acumulada entre páginas é dita com todas as letras", () => {
    const scope = selectionScope({
      ...base,
      selected: 62,
      total: 120,
      offPage: 12,
    });
    expect(scope.label).toContain("62 de 120 parcelas desta fábrica");
    expect(scope.label).toContain("12 estão em outra página");
    expect(scope.sentence).toContain("12 delas não estão na página aberta");
  });

  it("a fábrica inteira marcada não vira '120 de 120'", () => {
    expect(
      selectionScope({ ...base, selected: 120, total: 120, offPage: 70 }).label
    ).toContain("todas as parcelas desta fábrica");
  });
});
