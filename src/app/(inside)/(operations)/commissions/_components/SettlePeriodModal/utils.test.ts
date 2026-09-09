import { describe, expect, it } from "vitest";

import { outOfScopeCount, settleScopeLabel } from "./utils";

describe("escopo da baixa em período", () => {
  it("nomeia o vendedor quando a baixa é de um só", () => {
    expect(settleScopeLabel("s1", "Calazans")).toBe("de Calazans");
  });

  it("sem vendedor no recorte, a baixa é de todos", () => {
    expect(settleScopeLabel(null, null)).toBe("de todos os vendedores");
  });

  it("sem o nome à mão, ainda diz que o recorte existe", () => {
    expect(settleScopeLabel("s1", null)).toBe("de este vendedor");
  });
});

describe("o que a baixa deixa de fora", () => {
  it("conta os boletos dos colegas no mesmo período", () => {
    // O caso real: 99 na carteira do gestor, 773 no período inteiro.
    expect(outOfScopeCount(99, 773, "s1")).toBe(674);
  });

  it("sem recorte de vendedor não há o que ficar de fora", () => {
    expect(outOfScopeCount(99, 773, null)).toBe(0);
  });

  it("enquanto a prévia geral não chega, não afirma nada", () => {
    expect(outOfScopeCount(99, undefined, "s1")).toBe(0);
  });

  it("nunca devolve negativo", () => {
    expect(outOfScopeCount(99, 50, "s1")).toBe(0);
  });
});
