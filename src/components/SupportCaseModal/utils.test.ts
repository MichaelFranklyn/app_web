import { describe, expect, it } from "vitest";
import { parseAmount } from "./utils";

describe("parseAmount", () => {
  it("lê o texto mascarado do campo de moeda", () => {
    expect(parseAmount("R$ 1.234,56")).toBe(1234.56);
  });

  // Trocar só a vírgula transformaria mil reais em um real e vinte e três: o
  // separador de milhar tem de sair antes.
  it("não confunde milhar com decimal", () => {
    expect(parseAmount("R$ 1.230,00")).toBe(1230);
  });

  it("vazio é ausência de valor, não zero", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
  });

  it("aceita número já pronto", () => {
    expect(parseAmount(42.5)).toBe(42.5);
  });

  it("texto sem número nenhum vira ausência", () => {
    expect(parseAmount("R$")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
  });
});
