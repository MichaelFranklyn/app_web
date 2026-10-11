import { describe, expect, it } from "vitest";

import { PendingReason } from "./interface";
import {
  clientDetail,
  countTone,
  destinationLabel,
  dueLabel,
  dueTone,
  hasActiveFilter,
  ITEMS_PER_PAGE,
  PENDING_TYPE_LABEL,
  PENDING_TYPE_ORDER,
  PENDING_TYPE_SINGULAR,
  pendingVariables,
  priorityHint,
  reasonText,
  scopeNote,
} from "./utils";

const REASONS: PendingReason[] = [
  "VISIT_UNANSWERED",
  "RETURN_DATE",
  "WANTS_VISIT",
  "DRAFT_STALE",
  "PENDING_INVOICE",
  "DELIVERY_UNCONFIRMED",
  "NO_CONTACT",
  "NEVER_CONTACTED",
];

describe("reasonText", () => {
  const base = {
    referenceDate: "2026-10-05",
    isRemote: false,
    allowanceDays: 7,
    isEstimated: false,
    daysLate: 2,
    scheduledDate: null,
  };

  it("tem frase para todo motivo que o backend manda", () => {
    for (const reason of REASONS) {
      const text = reasonText({ ...base, reason });
      expect(text.length).toBeGreaterThan(10);
      expect(text).not.toContain("undefined");
    }
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
  });

  it("pinta de vermelho só o que já venceu", () => {
    expect(dueTone(3)).toBe("red");
    expect(dueTone(0)).toBe("amber");
    expect(dueTone(-2)).toBe("muted");
  });
});

describe("rótulos por tipo", () => {
  it("cobre os quatro tipos no plural, no singular e no destino", () => {
    expect(PENDING_TYPE_ORDER).toHaveLength(4);
    for (const type of PENDING_TYPE_ORDER) {
      expect(PENDING_TYPE_LABEL[type]).toBeTruthy();
      expect(PENDING_TYPE_SINGULAR[type]).toBeTruthy();
      expect(destinationLabel(type)).toBeTruthy();
    }
  });

  it("manda a visita para a rota do dia e o pedido para o pedido", () => {
    expect(destinationLabel("VISIT_OVERDUE")).toContain("rota do dia");
    expect(destinationLabel("ORDER_STALLED")).toContain("pedido");
    expect(destinationLabel("RETURN_SCHEDULED")).toContain("cliente");
    expect(destinationLabel("CLIENT_NO_CONTACT")).toContain("cliente");
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

describe("pendingVariables", () => {
  it("sem filtro nenhum, manda tudo nulo — é o que o SSR semeia", () => {
    expect(pendingVariables({}, 1)).toEqual({
      types: null,
      sellerId: null,
      dueFrom: null,
      dueTo: null,
      offset: 0,
      limit: ITEMS_PER_PAGE,
    });
  });

  it("traduz filtros e página em argumentos da consulta", () => {
    const variables = pendingVariables(
      {
        type: "ORDER_STALLED",
        seller: "s-1",
        dueFrom: "2026-10-01",
        dueTo: "2026-10-31",
      },
      3
    );

    expect(variables).toEqual({
      types: ["ORDER_STALLED"],
      sellerId: "s-1",
      dueFrom: "2026-10-01",
      dueTo: "2026-10-31",
      offset: 2 * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
    });
  });

  it("ignora o vendedor da URL para quem não é gestor", () => {
    // O backend já ignoraria; mandar só faria a consulta do vendedor divergir
    // da que o servidor semeou.
    expect(pendingVariables({ seller: "s-1" }, 1, false).sellerId).toBeNull();
  });

  it("página inválida cai na primeira", () => {
    expect(pendingVariables({}, 0).offset).toBe(0);
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
      "Mostrando o que tem prazo de 01/10/2026 a 31/10/2026."
    );
    expect(scopeNote({ dueFrom: "2026-10-01" })).toContain("a partir de");
    expect(scopeNote({ dueTo: "2026-10-31" })).toContain("até 31/10/2026");
  });
});

describe("hasActiveFilter", () => {
  it("só conta os filtros desta tela", () => {
    expect(hasActiveFilter({})).toBe(false);
    expect(hasActiveFilter({ page: "2" })).toBe(false);
    expect(hasActiveFilter({ type: "VISIT_OVERDUE" })).toBe(true);
  });
});
