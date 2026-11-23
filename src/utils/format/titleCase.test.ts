import { describe, expect, it } from "vitest";

import { toTitleCase } from "./titleCase";

describe("toTitleCase", () => {
  it("converte o nome todo em maiúsculas", () => {
    expect(toTitleCase("MERCADO SÃO JOSÉ LTDA")).toBe("Mercado São José Ltda");
  });

  it("deixa as preposições em minúsculas, menos na primeira palavra", () => {
    expect(toTitleCase("CASA DE CARNES DO ZÉ")).toBe("Casa de Carnes do Zé");
    expect(toTitleCase("DE TUDO UM POUCO")).toBe("De Tudo Um Pouco");
  });

  it("mantém as siglas societárias", () => {
    expect(toTitleCase("PADARIA BOM PÃO ME")).toBe("Padaria Bom Pão ME");
    expect(toTitleCase("ATACADO NORTE S/A")).toBe("Atacado Norte S/A");
  });

  it("capitaliza cada parte da palavra com hífen", () => {
    expect(toTitleCase("AUTO-PEÇAS SILVA")).toBe("Auto-Peças Silva");
  });

  it("respeita o nome que já está em caixa mista", () => {
    expect(toTitleCase("Mercado do Bairro LTDA")).toBe(
      "Mercado do Bairro LTDA"
    );
  });

  it("preserva os espaços e o texto sem letras", () => {
    expect(toTitleCase("LOJA  2")).toBe("Loja  2");
    expect(toTitleCase("123")).toBe("123");
  });
});
