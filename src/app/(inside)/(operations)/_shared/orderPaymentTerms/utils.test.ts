import { describe, expect, it } from "vitest";

import { findTermIdByName, sortTermsForTier, suggestTermId } from "./utils";

const TERMS = [
  { id: "t1", name: "30/45/60" },
  { id: "t2", name: "À vista" },
];

describe("achar a condição pelo nome", () => {
  it("acha pelo nome que a ficha guardou", () => {
    expect(findTermIdByName(TERMS, "30/45/60")).toBe("t1");
  });

  it("não se perde em caixa e espaço sobrando", () => {
    // A ficha é um arquivo que passa por Excel, LibreOffice e cópia manual.
    expect(findTermIdByName(TERMS, " à  VISTA ")).toBe("t2");
  });

  it("devolve null quando a condição não existe mais na fábrica", () => {
    // Ficha velha, condição apagada: melhor o campo vazio do que o prazo errado.
    expect(findTermIdByName(TERMS, "30/60/90")).toBeNull();
    expect(findTermIdByName(TERMS, "")).toBeNull();
  });
});

// Ventisol: capital compra em 30/60/90, interior em 45/75/105; à vista vale p/ todos.
const TIERED = [
  { id: "cap", priceTierId: "capital", minOrderAmount: 1500 },
  { id: "cap4k", priceTierId: "capital", minOrderAmount: 4000 },
  { id: "avista", priceTierId: null, minOrderAmount: null },
  { id: "int4k", priceTierId: "interior", minOrderAmount: 4000 },
  { id: "int", priceTierId: "interior", minOrderAmount: 1500 },
];

describe("condição pelo nível do cliente", () => {
  it("põe as do nível primeiro, depois as de todos, por último as de outro nível", () => {
    const ids = sortTermsForTier(TIERED, "interior").map((t) => t.id);
    expect(ids).toEqual(["int4k", "int", "avista", "cap", "cap4k"]);
  });

  it("sem nível conhecido, mantém a ordem que veio", () => {
    expect(sortTermsForTier(TIERED, null)).toBe(TIERED);
  });

  it("sugere a do nível com o menor mínimo", () => {
    expect(suggestTermId(TIERED, "interior")).toBe("int");
    expect(suggestTermId(TIERED, "capital")).toBe("cap");
  });

  it("não sugere nada sem nível ou sem condição do nível", () => {
    expect(suggestTermId(TIERED, null)).toBeNull();
    expect(suggestTermId(TIERED, "outro")).toBeNull();
  });
});
