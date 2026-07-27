import { describe, expect, it } from "vitest";

import { matchesSelectSearch } from "./selectFilter";

const option = {
  value: "1",
  label: "Mercado Bom Preço · 12.345.678/0001-90",
  searchText: "Bom Preço Comércio de Alimentos LTDA 12345678000190",
};

describe("matchesSelectSearch", () => {
  it("aceita qualquer opção quando o termo está vazio", () => {
    expect(matchesSelectSearch(option, "   ")).toBe(true);
  });

  it("casa pelo rótulo, ignorando caixa", () => {
    expect(matchesSelectSearch(option, "bom preço")).toBe(true);
  });

  it("casa pelo searchText (razão social fora do rótulo)", () => {
    expect(matchesSelectSearch(option, "Comércio de Alimentos")).toBe(true);
  });

  it("casa o CNPJ digitado sem pontuação", () => {
    expect(matchesSelectSearch(option, "12345678")).toBe(true);
  });

  it("casa o CNPJ digitado com pontuação parcial", () => {
    expect(matchesSelectSearch(option, "12.345")).toBe(true);
  });

  it("não casa termo que não existe em lugar nenhum", () => {
    expect(matchesSelectSearch(option, "padaria")).toBe(false);
  });

  it("exige ao menos 3 dígitos para casar por número", () => {
    const outro = { value: "2", label: "Loja 12 Centro" };
    expect(matchesSelectSearch(outro, "9")).toBe(false);
  });

  it("funciona sem searchText", () => {
    const outro = { value: "2", label: "Loja Centro" };
    expect(matchesSelectSearch(outro, "centro")).toBe(true);
  });
});
