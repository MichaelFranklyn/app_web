import { describe, expect, it } from "vitest";

import { isValidCnpj, onlyDigits } from "./document";

describe("isValidCnpj", () => {
  it("aceita CNPJ real, com ou sem máscara", () => {
    expect(isValidCnpj("33000167000101")).toBe(true);
    expect(isValidCnpj("33.000.167/0001-01")).toBe(true);
  });

  it("rejeita dígito verificador errado", () => {
    // Número que chegou ao backend e voltou como "serviço indisponível":
    // a fonte respondia 400 (CNPJ inválido) e ninguém checava isso antes.
    expect(isValidCnpj("01050029000160")).toBe(false);
  });

  it("rejeita repetidos, que passam na conta mas não existem", () => {
    expect(isValidCnpj("00000000000000")).toBe(false);
    expect(isValidCnpj("11111111111111")).toBe(false);
  });

  it("rejeita comprimento diferente de 14 dígitos", () => {
    expect(isValidCnpj("3300016700010")).toBe(false);
    expect(isValidCnpj("")).toBe(false);
    expect(isValidCnpj(null)).toBe(false);
  });
});

describe("onlyDigits", () => {
  it("remove a máscara", () => {
    expect(onlyDigits("33.000.167/0001-01")).toBe("33000167000101");
  });

  it("tolera vazio", () => {
    expect(onlyDigits(undefined)).toBe("");
  });
});
