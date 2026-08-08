import { describe, expect, it } from "vitest";

import {
  asContactType,
  contactArticle,
  contactLabel,
  contactNoun,
  outcomeOptionsFor,
  VISIT_OUTCOME_OPTIONS,
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  VISIT_STATUS_OPTIONS,
} from "./visit";

describe("catálogos de visita", () => {
  it("label e cor cobrem os mesmos status", () => {
    expect(Object.keys(VISIT_STATUS_LABEL).sort()).toEqual(
      Object.keys(VISIT_STATUS_COLOR).sort()
    );
    expect(VISIT_STATUS_LABEL.COMPLETED).toBe("Realizada");
    expect(VISIT_STATUS_COLOR.COMPLETED).toBe("green");
  });

  it("as options derivam do mapa de label", () => {
    expect(VISIT_STATUS_OPTIONS).toContainEqual({
      value: "PENDING",
      label: "Pendente",
    });
    // Todo status tem rótulo — inclusive os que ninguém escolhe à mão —, então a
    // lista de opções é o mapa MENOS os automáticos, nunca mais que ele.
    expect(VISIT_STATUS_OPTIONS.length).toBeLessThanOrEqual(
      Object.keys(VISIT_STATUS_LABEL).length
    );
    expect(
      VISIT_STATUS_OPTIONS.every((o) => o.value in VISIT_STATUS_LABEL)
    ).toBe(true);
  });

  it('"Cliente adiou" tem rótulo mas não se escolhe num formulário', () => {
    // Ele nasce da rotina, quando um dia fixo cai numa data em que o cliente
    // pediu para não ser procurado. Ofertá-lo num select convidaria o vendedor
    // a marcá-lo numa visita comum, onde não significa nada.
    expect(VISIT_STATUS_LABEL.SKIPPED_BY_CUSTOMER).toBe("Cliente adiou");
    expect(VISIT_STATUS_OPTIONS.map((o) => o.value)).not.toContain(
      "SKIPPED_BY_CUSTOMER"
    );
  });

  it("outcome expõe os valores esperados", () => {
    expect(VISIT_OUTCOME_OPTIONS.map((o) => o.value)).toContain("SOLD");
  });
});

describe("tipo de toque tolera valor ausente", () => {
  // Um item sem `contactType` derrubava o card inteiro: `contactNoun` fazia
  // `.toLowerCase()` em undefined. Acontece com backend defasado (o campo só
  // existe depois da migration) e com o cache semeado no SSR — nenhum dos dois
  // justifica a rotina sumir da tela.
  it.each([undefined, null])("cai em visita presencial para %s", (value) => {
    expect(asContactType(value)).toBe("IN_PERSON");
    expect(() => contactNoun(value)).not.toThrow();
    expect(contactNoun(value)).toBe("visita");
    expect(contactLabel(value)).toBe("Visita");
    expect(contactArticle(value)).toBe("a");
    expect(outcomeOptionsFor(value)).toBe(VISIT_OUTCOME_OPTIONS);
  });

  it("preserva REMOTE quando ele vem de verdade", () => {
    expect(asContactType("REMOTE")).toBe("REMOTE");
    expect(contactNoun("REMOTE")).toBe("contato");
    expect(contactArticle("REMOTE")).toBe("o");
    expect(outcomeOptionsFor("REMOTE").map((o) => o.value)).toContain(
      "WANTS_VISIT"
    );
  });
});
