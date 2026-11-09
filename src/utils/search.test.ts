import { describe, expect, it } from "vitest";

import { matchesSearchText } from "./search";

describe("matchesSearchText", () => {
  it("casa por trecho sem diferenciar maiúsculas", () => {
    expect(matchesSearchText("Mercado Bom Preço", "bom pre")).toBe(true);
    expect(matchesSearchText("Mercado Bom Preço", "padaria")).toBe(false);
  });

  it("termo vazio casa com tudo", () => {
    expect(matchesSearchText("Mercado", "   ")).toBe(true);
  });

  it("CNPJ com máscara casa com o guardado só em dígitos e vice-versa", () => {
    expect(matchesSearchText("Loja 12345678000190", "12.345.678/0001")).toBe(
      true
    );
    expect(matchesSearchText("Loja 12.345.678/0001-90", "0001")).toBe(true);
  });

  it("menos de 3 dígitos não vira busca por documento", () => {
    expect(matchesSearchText("Loja 12.345", "1-2")).toBe(false);
  });
});
