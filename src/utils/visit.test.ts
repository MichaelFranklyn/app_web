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
    expect(VISIT_STATUS_OPTIONS).toHaveLength(
      Object.keys(VISIT_STATUS_LABEL).length
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
