import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatDateDMY,
  formatDateMY,
  formatMoney,
  formatNumber,
  maskCEP,
  maskCNPJ,
  maskCPF,
  maskCurrency,
  maskPhoneBR,
  onlyDigits,
  parseMoneyToNumber,
} from "./masks";

describe("onlyDigits", () => {
  it("remove tudo que não é dígito", () => {
    expect(onlyDigits("abc12.3-4/5")).toBe("12345");
    expect(onlyDigits("(11) 98765-4321")).toBe("11987654321");
  });
});

describe("máscaras de documento/contato", () => {
  it("maskCPF", () => {
    expect(maskCPF("12345678901")).toBe("123.456.789-01");
  });
  it("maskCNPJ", () => {
    expect(maskCNPJ("12345678000199")).toBe("12.345.678/0001-99");
  });
  it("maskCEP", () => {
    expect(maskCEP("12345678")).toBe("12345-678");
  });
  it("maskPhoneBR — celular (11 dígitos)", () => {
    expect(maskPhoneBR("11987654321")).toBe("(11) 98765-4321");
  });
  it("maskPhoneBR — fixo (10 dígitos)", () => {
    expect(maskPhoneBR("1133334444")).toBe("(11) 3333-4444");
  });
});

describe("maskCurrency", () => {
  it("monta o valor da direita para a esquerda com centavos", () => {
    expect(maskCurrency("100")).toBe("1,00");
    expect(maskCurrency("12345")).toBe("123,45");
    expect(maskCurrency("1234567")).toBe("12.345,67");
  });
  it("retorna vazio sem dígitos", () => {
    expect(maskCurrency("abc")).toBe("");
  });
});

describe("parseMoneyToNumber", () => {
  it("converte string BRL para number", () => {
    expect(parseMoneyToNumber("1.234,56")).toBe(1234.56);
    expect(parseMoneyToNumber("R$ 1.000,00")).toBe(1000);
  });
  it("retorna 0 para vazio", () => {
    expect(parseMoneyToNumber("")).toBe(0);
  });
});

describe("formatAmount", () => {
  it("formata com 2 casas e separador de milhar pt-BR (sem símbolo)", () => {
    expect(formatAmount(1234.5)).toBe("1.234,50");
    expect(formatAmount("10")).toBe("10,00");
  });
});

// Intl pt-BR insere um NBSP entre "R$" e o número; comparamos sem espaços
// para não depender do caractere exato.
const stripSpaces = (s: string) => s.replace(/\s/g, "");

describe("formatMoney", () => {
  it("formata número e string como BRL", () => {
    expect(stripSpaces(formatMoney(1234.5))).toBe("R$1.234,50");
    expect(stripSpaces(formatMoney("1000"))).toBe("R$1.000,00");
  });
  it("retorna vazio p/ valor não finito", () => {
    expect(formatMoney("abc")).toBe("");
    expect(formatMoney(Infinity)).toBe("");
  });
});

describe("formatNumber", () => {
  it("aplica separador de milhar pt-BR", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
  });
  it("retorna vazio p/ não finito", () => {
    expect(formatNumber(NaN)).toBe("");
  });
});

describe("formatDateDMY / formatDateMY", () => {
  it("formata ISO em DD/MM/YYYY e MM/YYYY", () => {
    expect(formatDateDMY("2026-05-31T12:00:00Z")).toBe("31/05/2026");
    expect(formatDateMY("2026-05-31T12:00:00Z")).toBe("05/2026");
  });
  it("retorna vazio p/ ausente ou inválida", () => {
    expect(formatDateDMY()).toBe("");
    expect(formatDateDMY("data inválida")).toBe("");
    expect(formatDateMY()).toBe("");
    expect(formatDateMY("nope")).toBe("");
  });
});
