import { describe, expect, it } from "vitest";

import { Opportunity, OpportunityKind } from "./interface";
import {
  cardCount,
  caseTotal,
  isOpportunityKind,
  OPPORTUNITY_COPY,
  REASON_COPY,
  scheduledNote,
  sortOpportunities,
} from "./utils";

const opportunity = (
  kind: OpportunityKind,
  count: number,
  blockedCount = 0
): Opportunity => ({ kind, count, blockedCount, samples: [] });

describe("sortOpportunities", () => {
  it("quem está pronto para comprar vem antes de quem ficou fora da rotina", () => {
    const sorted = sortOpportunities([
      opportunity("PRIORITY_OFF_ROUTE", 9),
      opportunity("CLIENT_OVERDUE", 2),
    ]);
    expect(sorted.map((item) => item.kind)).toEqual([
      "CLIENT_OVERDUE",
      "PRIORITY_OFF_ROUTE",
    ]);
  });

  it("descarta o que não é oportunidade (back antigo durante o deploy)", () => {
    const legacy = {
      ...opportunity("CLIENT_OVERDUE", 1),
      kind: "INSTALLMENT_OVERDUE",
    } as unknown as Opportunity;
    expect(sortOpportunities([legacy])).toEqual([]);
  });
});

describe("cardCount / caseTotal", () => {
  it("o número grande é o que depende de decisão", () => {
    const item = opportunity("PRIORITY_OFF_ROUTE", 3, 5);
    expect(cardCount(item).value).toBe(3);
    expect(caseTotal(item)).toBe(8);
  });

  it("todos explicados: mostra os explicados em vez de um zero", () => {
    expect(cardCount(opportunity("PRIORITY_OFF_ROUTE", 0, 5))).toEqual({
      value: 5,
      label: "clientes explicados",
    });
  });

  it("concorda em número", () => {
    expect(cardCount(opportunity("CLIENT_OVERDUE", 1)).label).toBe(
      "cliente já passou do próprio intervalo de compra"
    );
  });
});

describe("a copy não fala em atraso", () => {
  it("oportunidade é escolha, não cobrança", () => {
    for (const kind of Object.keys(OPPORTUNITY_COPY) as OpportunityKind[]) {
      const copy = OPPORTUNITY_COPY[kind];
      const text = [
        copy.title,
        copy.countLabel(2),
        copy.why(opportunity(kind, 2, 1)),
      ].join(" ");
      expect(text).not.toMatch(/atrasad/i);
    }
  });

  it("todo motivo de exclusão do motor tem rótulo e dica", () => {
    for (const reason of Object.values(REASON_COPY)) {
      expect(reason.label).toBeTruthy();
      expect(reason.hint.length).toBeGreaterThan(20);
    }
  });
});

describe("scheduledNote", () => {
  it("avisa o contato agendado e a visita marcada", () => {
    expect(
      scheduledNote({ nextFollowUpDate: "2026-10-14", nextVisitDate: null })
    ).toBe("Contato agendado para 14/10/2026");
    expect(
      scheduledNote({
        nextFollowUpDate: "2026-10-14",
        nextVisitDate: "2026-10-20",
      })
    ).toBe("Contato agendado para 14/10/2026 · Visita marcada para 20/10/2026");
  });

  it("nada marcado, nada a dizer", () => {
    expect(
      scheduledNote({ nextFollowUpDate: null, nextVisitDate: null })
    ).toBeNull();
  });
});

describe("isOpportunityKind", () => {
  it("só aceita do ?open= o que a tela conhece", () => {
    expect(isOpportunityKind("CLIENT_OVERDUE")).toBe(true);
    expect(isOpportunityKind("GOAL_BEHIND")).toBe(false);
    expect(isOpportunityKind(null)).toBe(false);
  });
});
