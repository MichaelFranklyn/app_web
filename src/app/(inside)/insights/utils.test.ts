import { describe, expect, it } from "vitest";

import { Insight, InsightKind } from "./interface";
import {
  cardCount,
  caseTotal,
  insightsByTone,
  INSIGHT_COPY,
  REASON_COPY,
  toneOf,
  totalCases,
  urgentCount,
} from "./utils";

const insight = (
  kind: InsightKind,
  count: number,
  blockedCount = 0
): Insight => ({
  kind,
  group: "WALLET",
  count,
  blockedCount,
  amount: null,
  daysLeft: null,
  samples: [],
});

describe("toneOf", () => {
  it("segue o tom do tipo quando há caso a decidir", () => {
    expect(toneOf(insight("INSTALLMENT_OVERDUE", 3))).toBe("urgent");
    expect(toneOf(insight("PRIORITY_OFF_ROUTE", 2))).toBe("attention");
  });

  it("rebaixa para 'de olho' a pendência que o sistema inteiramente explica", () => {
    // Cinco clientes travados por pedido em aberto não pedem decisão de
    // ninguém hoje: pedem que o pedido ande. Competir em âmbar com o que
    // precisa de ação treina a pessoa a ignorar o âmbar.
    expect(toneOf(insight("PRIORITY_OFF_ROUTE", 0, 5))).toBe("info");
  });

  it("não rebaixa quando há acionável junto do travado", () => {
    expect(toneOf(insight("PRIORITY_OFF_ROUTE", 1, 5))).toBe("attention");
  });

  it("a seção usa o tom calculado, não o do tipo", () => {
    const travado = insight("PRIORITY_OFF_ROUTE", 0, 5);
    expect(insightsByTone([travado], "attention")).toEqual([]);
    expect(insightsByTone([travado], "info")).toEqual([travado]);
  });

  it("pendência só travada não conta como urgente no resumo", () => {
    expect(urgentCount([insight("INSTALLMENT_OVERDUE", 0, 4)])).toBe(0);
    expect(urgentCount([insight("INSTALLMENT_OVERDUE", 4)])).toBe(1);
  });
});

describe("cardCount", () => {
  it("mostra o que depende de decisão quando existe", () => {
    expect(cardCount(insight("PRIORITY_OFF_ROUTE", 3, 5))).toEqual({
      value: 3,
      label: "casos",
    });
  });

  it("troca para os travados em vez de exibir um zero enorme", () => {
    expect(cardCount(insight("PRIORITY_OFF_ROUTE", 0, 5))).toEqual({
      value: 5,
      label: "travados",
    });
  });

  it("concorda em número", () => {
    expect(cardCount(insight("PRIORITY_OFF_ROUTE", 1)).label).toBe("caso");
    expect(cardCount(insight("PRIORITY_OFF_ROUTE", 0, 1)).label).toBe(
      "travado"
    );
  });
});

describe("caseTotal e totalCases", () => {
  it("o total é o tamanho da lista que o modal abre", () => {
    expect(caseTotal(insight("PRIORITY_OFF_ROUTE", 3, 5))).toBe(8);
  });

  it("o resumo soma decidíveis e travados de todas as pendências", () => {
    expect(
      totalCases([
        insight("CLIENT_OVERDUE", 23),
        insight("PRIORITY_OFF_ROUTE", 0, 5),
      ])
    ).toBe(28);
  });
});

describe("copy do prioritário fora da rotina", () => {
  const copy = INSIGHT_COPY.PRIORITY_OFF_ROUTE;

  it("fala de rotina quando há cliente sem explicação", () => {
    const pendencia = insight("PRIORITY_OFF_ROUTE", 2);
    expect(copy.title(pendencia)).toContain("fora da rotina");
    expect(copy.why(pendencia)).toContain("não entraram no roteiro");
  });

  it("fala de pendência quando todos têm explicação", () => {
    const pendencia = insight("PRIORITY_OFF_ROUTE", 0, 5);
    expect(copy.title(pendencia)).toContain("travados");
    // O ponto do texto: não mandar rever a rotina por um erro que não existe.
    expect(copy.why(pendencia)).toContain("de propósito");
  });

  it("avisa dos travados mesmo quando há acionáveis", () => {
    expect(copy.why(insight("PRIORITY_OFF_ROUTE", 2, 5))).toContain("Outros 5");
  });
});

describe("REASON_COPY", () => {
  it("todo motivo do backend tem texto — sem isso a etiqueta some da lista", () => {
    const doBackend = [
      "ORDER_OPEN",
      "VISIT_PENDING",
      "DEFERRED",
      "NO_GEOCODE",
      "NO_ROOM",
    ] as const;
    for (const reason of doBackend) {
      expect(REASON_COPY[reason].label.length).toBeGreaterThan(0);
      expect(REASON_COPY[reason].hint.length).toBeGreaterThan(0);
    }
  });
});
