import { describe, expect, it } from "vitest";

import { coverageHint, suggestCoverageDays } from "./coverageSuggestion";

/**
 * O campo "dura quantos dias na loja?" estava preenchido em 0 de 265 pedidos
 * (medição de 07/08/2026) — e é a única fonte de DURAÇÃO que o motor de rotina
 * tem. A sugestão existe para transformar "digitar do zero" em "confirmar".
 */
describe("suggestCoverageDays", () => {
  it("usa a recorrência observada do cliente", () => {
    expect(suggestCoverageDays({ days: 45, source: "observada" })).toBe(45);
  });

  it("usa a mediana da fábrica quando o cliente não tem histórico", () => {
    expect(suggestCoverageDays({ days: 92, source: "tipica" })).toBe(92);
  });

  it("não sugere nada quando o sistema não sabe", () => {
    // Um chute pré-preenchido viraria dado declarado — pior que o vazio.
    expect(
      suggestCoverageDays({ days: null, source: "desconhecida" })
    ).toBeNull();
    expect(suggestCoverageDays(null)).toBeNull();
    expect(suggestCoverageDays(undefined)).toBeNull();
  });

  it("não sugere fora dos limites que o backend aceita", () => {
    expect(suggestCoverageDays({ days: 1, source: "observada" })).toBeNull();
    expect(suggestCoverageDays({ days: 400, source: "observada" })).toBeNull();
  });

  it("arredonda para dias inteiros", () => {
    expect(suggestCoverageDays({ days: 30.6, source: "observada" })).toBe(31);
  });
});

describe("coverageHint", () => {
  it("diz que o número veio dos pedidos daquele cliente", () => {
    const hint = coverageHint({ days: 45, source: "observada" });
    expect(hint).toContain("45");
    expect(hint).toContain("últimos pedidos deste cliente");
  });

  it("avisa quando o número é a média da fábrica", () => {
    const hint = coverageHint({ days: 92, source: "tipica" });
    expect(hint).toContain("92");
    expect(hint).toContain("ainda não tem histórico");
  });

  it("sem sugestão, explica para que serve o campo", () => {
    expect(coverageHint(null)).toContain("quando voltar");
  });
});
