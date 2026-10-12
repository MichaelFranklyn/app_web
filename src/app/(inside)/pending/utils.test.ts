import { describe, expect, it } from "vitest";

import { PendingReason } from "./interface";
import {
  clientDetail,
  countTone,
  destinationLabel,
  dueLabel,
  dueTone,
  hasActiveFilter,
  followUpDefaultDate,
  ITEMS_PER_PAGE,
  PENDING_TYPE_LABEL,
  PENDING_TYPE_ORDER,
  PENDING_TYPE_SINGULAR,
  cardSubtitle,
  isPendingType,
  openTypeOf,
  PENDING_TYPE_COPY,
  pendingCasesVariables,
  pendingSummaryVariables,
  postSaleMessage,
  priorityHint,
  reasonText,
  SAMPLE_SIZE,
  scopeNote,
  visibleTypeCounts,
} from "./utils";

const REASONS: PendingReason[] = [
  "VISIT_UNANSWERED",
  "RETURN_DATE",
  "WANTS_VISIT",
  "FOLLOW_UP_DUE",
  "DRAFT_STALE",
  "PENDING_INVOICE",
  "DELIVERY_UNCONFIRMED",
  "NO_CONTACT",
  "NEVER_CONTACTED",
  "FREQUENCY_DUE",
  "INSTALLMENT_UNPAID",
  "LOCATION_MISSING",
  "LOCATION_APPROXIMATE",
];

describe("reasonText", () => {
  const base = {
    referenceDate: "2026-10-05",
    isRemote: false,
    allowanceDays: 7,
    isEstimated: false,
    daysLate: 2,
    scheduledDate: null,
    note: null,
    installmentCount: null,
    amount: null,
  };

  it("tem frase para todo motivo que o backend manda", () => {
    for (const reason of REASONS) {
      const text = reasonText({ ...base, reason });
      expect(text.length).toBeGreaterThan(10);
      expect(text).not.toContain("undefined");
    }
  });

  it("contato agendado diz o motivo que a pessoa escreveu", () => {
    expect(
      reasonText({
        ...base,
        reason: "FOLLOW_UP_DUE",
        allowanceDays: null,
        note: "Retornar sobre o orçamento",
      })
    ).toBe("Retornar sobre o orçamento — agendado em 05/10/2026.");
  });

  it("diz a data do fato, e distingue ligação de visita", () => {
    const visit = { ...base, reason: "VISIT_UNANSWERED" as const };

    expect(reasonText({ ...visit, isRemote: false })).toContain(
      "A visita de 05/10/2026"
    );
    expect(reasonText({ ...visit, isRemote: true })).toContain(
      "A ligação de 05/10/2026"
    );
  });

  it("escreve a régua: há quanto tempo e qual prazo foi considerado", () => {
    // Confirmado há 9 dias = 7 da régua + 2 de atraso.
    const text = reasonText({ ...base, reason: "PENDING_INVOICE" });
    expect(text).toContain("Confirmado em 05/10/2026, há 9 dias");
    expect(text).toContain("Prazo considerado: 7 dias");
  });

  it("pedido sem carimbo de confirmação avisa que o prazo é estimado", () => {
    const text = reasonText({
      ...base,
      reason: "PENDING_INVOICE",
      isEstimated: true,
    });
    expect(text).toContain("Pedido de 05/10/2026, há 9 dias");
    expect(text).toContain("estimado");
    expect(text).not.toContain("Confirmado em");
  });

  it("entrega conta do faturamento, com o prazo de entrega", () => {
    const text = reasonText({
      ...base,
      reason: "DELIVERY_UNCONFIRMED",
      allowanceDays: 15,
      daysLate: 5,
    });
    expect(text).toContain("Faturado em 05/10/2026, há 20 dias");
    expect(text).toContain("Prazo de entrega considerado: 15 dias");
  });

  it("nunca contatado conta da entrada na carteira", () => {
    const text = reasonText({
      ...base,
      reason: "NEVER_CONTACTED",
      allowanceDays: 30,
    });
    expect(text).toContain("Na carteira desde 05/10/2026");
    expect(text).toContain("Régua: 30 dias sem contato");
  });

  it("avisa a visita marcada longe, que não dispensou a pendência", () => {
    const text = reasonText({
      ...base,
      reason: "NO_CONTACT",
      allowanceDays: 30,
      scheduledDate: "2027-01-20",
    });
    expect(text).toContain("contato marcado para 20/01/2027");
    expect(reasonText({ ...base, reason: "NO_CONTACT" })).not.toContain(
      "marcado"
    );
  });
});

describe("reasonText — tipos que vieram de /insights", () => {
  const base = {
    referenceDate: "2026-09-01",
    isRemote: false,
    allowanceDays: 30,
    isEstimated: false,
    daysLate: 10,
    scheduledDate: null,
    note: null,
    installmentCount: null,
    amount: null,
  };

  it("frequência vencida escreve a última visita e o ciclo", () => {
    const text = reasonText({ ...base, reason: "FREQUENCY_DUE" });
    expect(text).toContain("Última visita em 01/09/2026, há 40 dias");
    expect(text).toContain("a cada 30 dias");
  });

  it("boleto diz parcelas, valor em aberto e o vencimento mais antigo", () => {
    const text = reasonText({
      ...base,
      allowanceDays: 0,
      reason: "INSTALLMENT_UNPAID",
      installmentCount: 3,
      amount: "806.00",
    });
    expect(text).toMatch(/^3 parcelas vencidas, R\$\s806,00 em aberto\./);
    expect(text).toContain("A mais antiga venceu em 01/09/2026, há 10 dias");
    // Conferir não é pagar: só o pagamento baixado tira o boleto daqui.
    expect(text).toContain("conferir a comissão não tira o boleto da lista");
  });

  it("boleto de uma parcela fala no singular", () => {
    expect(
      reasonText({
        ...base,
        allowanceDays: 0,
        reason: "INSTALLMENT_UNPAID",
        installmentCount: 1,
        amount: null,
      })
    ).toMatch(/^1 parcela vencida\. Venceu em 01\/09\/2026/);
  });

  it("endereço diz o que corrigir", () => {
    expect(
      reasonText({ ...base, reason: "LOCATION_MISSING", daysLate: null })
    ).toContain("corrija rua, número e CEP");
  });
});

describe("priorityHint", () => {
  it("diz quando o degrau sobe para Alta, ou que nunca sobe", () => {
    expect(priorityHint({ priority: "MEDIUM", highAfterDays: 3 })).toContain(
      "Vira Alta com 3 dias de atraso"
    );
    expect(priorityHint({ priority: "MEDIUM", highAfterDays: null })).toContain(
      "não chega a Alta"
    );
    expect(priorityHint({ priority: "HIGH", highAfterDays: 3 })).not.toContain(
      "Vira Alta"
    );
  });
});

describe("dueLabel / dueTone", () => {
  it("fala em singular, plural, hoje e amanhã", () => {
    expect(dueLabel(0)).toBe("vence hoje");
    expect(dueLabel(1)).toBe("venceu há 1 dia");
    expect(dueLabel(12)).toBe("venceu há 12 dias");
    expect(dueLabel(-1)).toBe("vence amanhã");
    expect(dueLabel(-5)).toBe("vence em 5 dias");
    expect(dueLabel(null)).toBe("sem prazo");
  });

  it("pinta de vermelho só o que já venceu", () => {
    expect(dueTone(3)).toBe("red");
    expect(dueTone(0)).toBe("amber");
    expect(dueTone(-2)).toBe("muted");
    expect(dueTone(null)).toBe("muted");
  });
});

describe("rótulos por tipo", () => {
  it("cobre os oito tipos no plural, no singular e no destino", () => {
    expect(PENDING_TYPE_ORDER).toHaveLength(8);
    for (const type of PENDING_TYPE_ORDER) {
      expect(PENDING_TYPE_LABEL[type]).toBeTruthy();
      expect(PENDING_TYPE_SINGULAR[type]).toBeTruthy();
      expect(destinationLabel(type)).toBeTruthy();
    }
  });

  it("a ação diz para onde vai: rota, pedido, contato ou cadastro", () => {
    expect(destinationLabel("VISIT_OVERDUE")).toContain("rota");
    expect(destinationLabel("ORDER_STALLED")).toContain("pedido");
    expect(destinationLabel("INSTALLMENT_OVERDUE")).toContain("pedido");
    expect(destinationLabel("RETURN_SCHEDULED")).toContain("cliente");
    expect(destinationLabel("CLIENT_NO_CONTACT")).toContain("cliente");
    expect(destinationLabel("FOLLOW_UP")).toContain("contato");
    expect(destinationLabel("ADDRESS_ISSUE")).toBe("Corrigir cadastro");
  });

  it("os três assuntos de visita têm nomes que não se confundem", () => {
    const names = [
      PENDING_TYPE_LABEL.VISIT_OVERDUE,
      PENDING_TYPE_LABEL.VISIT_FREQUENCY,
      PENDING_TYPE_LABEL.CLIENT_NO_CONTACT,
    ];
    expect(new Set(names).size).toBe(3);
    expect(PENDING_TYPE_LABEL.VISIT_OVERDUE).toBe("Visitas sem resposta");
    expect(PENDING_TYPE_LABEL.VISIT_FREQUENCY).toContain("Frequência");
    // "atrasada" ficou ambíguo entre os dois primeiros — não volta.
    expect(names.join(" ")).not.toMatch(/atrasad/i);
  });

  it("todo assunto tem ícone, o porquê e o nome da ação que abre a lista", () => {
    for (const type of PENDING_TYPE_ORDER) {
      const copy = PENDING_TYPE_COPY[type];
      expect(copy.icon).toBeTruthy();
      expect(copy.why.length).toBeGreaterThan(20);
      expect(copy.listAction).toMatch(/^Ver /);
    }
  });
});

describe("clientDetail", () => {
  it("junta fábrica e valor do pedido", () => {
    const text = clientDetail({ factoryName: "Herc", amount: "1500.00" });
    expect(text).toContain("Herc · ");
    expect(text).toContain("1.500,00");
  });

  it("fica nulo quando a pendência não é de pedido", () => {
    expect(clientDetail({ factoryName: null, amount: null })).toBeNull();
  });
});

describe("countTone", () => {
  it("vermelho com alta prioridade, âmbar com alguma, apagado zerado", () => {
    expect(countTone(5, 2)).toBe("red");
    expect(countTone(5, 0)).toBe("amber");
    expect(countTone(0, 0)).toBe("muted");
  });
});

describe("variables das consultas", () => {
  it("o resumo sem filtro manda tudo nulo — é o que o SSR semeia", () => {
    expect(pendingSummaryVariables({})).toEqual({
      sellerId: null,
      dueFrom: null,
      dueTo: null,
      when: null,
      sampleSize: SAMPLE_SIZE,
    });
  });

  it("o resumo não leva o assunto aberto: os cartões contam todos", () => {
    const variables = pendingSummaryVariables({
      type: "ORDER_STALLED",
      section: "charges",
      when: "OVERDUE",
    });
    expect(variables).not.toHaveProperty("types");
    expect(variables.when).toBe("OVERDUE");
  });

  it("a lista leva o assunto, o mesmo recorte e a página", () => {
    const filters = {
      seller: "s-1",
      dueFrom: "2026-10-01",
      dueTo: "2026-10-31",
      when: "OVERDUE",
    };
    expect(pendingCasesVariables(filters, "ORDER_STALLED", 3)).toEqual({
      types: ["ORDER_STALLED"],
      sellerId: "s-1",
      dueFrom: "2026-10-01",
      dueTo: "2026-10-31",
      when: "OVERDUE",
      offset: 2 * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
    });
    // O recorte é o MESMO do resumo: a lista nunca tem mais nem menos linhas
    // do que o número do cartão.
    const summaryScope: Record<string, unknown> = {
      ...pendingSummaryVariables(filters),
    };
    delete summaryScope.sampleSize;
    expect(pendingCasesVariables(filters, "ORDER_STALLED", 1)).toMatchObject(
      summaryScope
    );
  });

  it("ignora o vendedor da URL para quem não é gestor", () => {
    // O backend já ignoraria; mandar só faria a consulta do vendedor divergir
    // da que o servidor semeou.
    expect(
      pendingSummaryVariables({ seller: "s-1" }, false).sellerId
    ).toBeNull();
    expect(
      pendingCasesVariables({ seller: "s-1" }, "FOLLOW_UP", 1, false).sellerId
    ).toBeNull();
  });

  it("página inválida cai na primeira", () => {
    expect(pendingCasesVariables({}, "FOLLOW_UP", 0).offset).toBe(0);
  });
});

describe("scopeNote", () => {
  it("sem período, avisa que a lista não é 'tudo'", () => {
    const note = scopeNote({});
    expect(note).toContain("próximos 7 dias");
    expect(note).toContain("Filtros");
  });

  it("descreve o período escolhido, inteiro ou pela metade", () => {
    expect(scopeNote({ dueFrom: "2026-10-01", dueTo: "2026-10-31" })).toBe(
      "Contando o que tem prazo de 01/10/2026 a 31/10/2026."
    );
    expect(scopeNote({ dueFrom: "2026-10-01" })).toContain("a partir de");
    expect(scopeNote({ dueTo: "2026-10-31" })).toContain("até 31/10/2026");
  });
});

describe("hasActiveFilter", () => {
  it("só conta os filtros desta tela", () => {
    expect(hasActiveFilter({})).toBe(false);
    expect(hasActiveFilter({ page: "2" })).toBe(false);
    expect(hasActiveFilter({ when: "TODAY" })).toBe(true);
    expect(hasActiveFilter({ seller: "s-1" })).toBe(true);
    expect(hasActiveFilter({ dueFrom: "2026-10-01" })).toBe(true);
    // O assunto aberto escolhe a lista que se vê, não o que os cartões contam.
    expect(hasActiveFilter({ type: "VISIT_OVERDUE" })).toBe(false);
    expect(hasActiveFilter({ section: "charges" })).toBe(false);
  });
});

describe("postSaleMessage", () => {
  it("o cliente reconhece o pedido pela fábrica e pela data", () => {
    expect(
      postSaleMessage({ factoryName: "Herc", orderDate: "2026-07-30" }, 9)
    ).toBe(
      "Olá, bom dia! Tudo bem? Passando para saber se o pedido da Herc feito em 30/07/2026 já foi entregue e se chegou tudo certo. Qualquer coisa, estou à disposição."
    );
  });

  it("sem fábrica nem data, a pergunta continua de pé", () => {
    expect(
      postSaleMessage({ factoryName: null, orderDate: null }, 15)
    ).toContain(
      "boa tarde! Tudo bem? Passando para saber se o pedido já foi entregue"
    );
  });
});

describe("followUpDefaultDate", () => {
  it("o dia combinado no futuro vale; passado ou sem dia vira hoje", () => {
    expect(followUpDefaultDate("2999-01-01")).toBe("2999-01-01");
    expect(followUpDefaultDate("2000-01-01")).not.toBe("2000-01-01");
    expect(followUpDefaultDate(null)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("assunto aberto", () => {
  it("vem do `type` da URL, e ignora o que não é tipo", () => {
    expect(openTypeOf({ type: "ORDER_STALLED" })).toBe("ORDER_STALLED");
    expect(openTypeOf({ type: "QUALQUER_COISA" })).toBeNull();
    expect(openTypeOf({})).toBeNull();
    expect(isPendingType("ADDRESS_ISSUE")).toBe(true);
    expect(isPendingType(undefined)).toBe(false);
  });

  it("o link antigo de Cobranças abre o cartão dos boletos", () => {
    expect(openTypeOf({ section: "charges" })).toBe("INSTALLMENT_OVERDUE");
    expect(openTypeOf({ type: "INSTALLMENT_OVERDUE" })).toBe(
      "INSTALLMENT_OVERDUE"
    );
    // O tipo explícito vence a seção herdada.
    expect(openTypeOf({ section: "charges", type: "FOLLOW_UP" })).toBe(
      "FOLLOW_UP"
    );
  });
});

describe("cartões por assunto", () => {
  const counts = [
    { type: "CLIENT_NO_CONTACT" as const, count: 167, highCount: 0 },
    { type: "VISIT_OVERDUE" as const, count: 0, highCount: 0 },
    { type: "INSTALLMENT_OVERDUE" as const, count: 278, highCount: 250 },
    { type: "ORDER_STALLED" as const, count: 86, highCount: 86 },
  ];

  it("só os assuntos com pendência, na ordem fixa dos tipos", () => {
    expect(visibleTypeCounts(counts).map((row) => row.type)).toEqual([
      "ORDER_STALLED",
      "INSTALLMENT_OVERDUE",
      "CLIENT_NO_CONTACT",
    ]);
  });

  it("o assunto aberto fica mesmo zerado: a lista dele está na página", () => {
    expect(
      visibleTypeCounts(counts, "VISIT_OVERDUE").map((row) => row.type)
    ).toEqual([
      "VISIT_OVERDUE",
      "ORDER_STALLED",
      "INSTALLMENT_OVERDUE",
      "CLIENT_NO_CONTACT",
    ]);
  });

  it("sem pendência nenhuma não há cartão", () => {
    expect(visibleTypeCounts([])).toEqual([]);
    expect(
      visibleTypeCounts([{ type: "FOLLOW_UP", count: 0, highCount: 0 }])
    ).toEqual([]);
  });

  it("a linha sob o título diz quantas não podem esperar", () => {
    expect(cardSubtitle(counts[2])).toBe("250 de prioridade alta");
    expect(cardSubtitle(counts[3])).toBe("todas de prioridade alta");
    expect(cardSubtitle(counts[0])).toBe("nenhuma de prioridade alta");
    expect(cardSubtitle({ type: "FOLLOW_UP", count: 1, highCount: 1 })).toBe(
      "de prioridade alta"
    );
    // Endereço não tem prazo nem chega a Alta: o que importa é o efeito.
    expect(
      cardSubtitle({ type: "ADDRESS_ISSUE", count: 150, highCount: 0 })
    ).toBe("sem prazo — trava a rotina");
  });
});
