import { describe, expect, it } from "vitest";

import { WorkbookData } from "@/utils/import/reader";

import { guessMapping, guessOrderSheet } from "./utils";

const wb = (sheets: Record<string, number>): WorkbookData => ({
  sheetNames: Object.keys(sheets),
  sheets: Object.fromEntries(
    Object.entries(sheets).map(([name, rows]) => [
      name,
      Array.from({ length: rows }, () => ["x"]),
    ])
  ),
});

describe("guessOrderSheet", () => {
  it("prefere a aba do PEDIDO mesmo quando não é a maior", () => {
    // Caso PADRÃO FORTE: 'Base' é a maior (catálogo), mas o pedido está em 'PEDIDO'.
    const workbook = wb({
      PEDIDO: 20,
      Ajuste: 5,
      "Base Padrão Kit": 100,
      Base: 800,
    });
    expect(guessOrderSheet(workbook)).toBe("PEDIDO");
  });

  it("reconhece variações de nome (Ficha/Orçamento)", () => {
    expect(guessOrderSheet(wb({ Base: 500, "Ficha Pedido": 30 }))).toBe(
      "Ficha Pedido"
    );
    expect(guessOrderSheet(wb({ Dados: 500, Orçamento: 12 }))).toBe(
      "Orçamento"
    );
  });

  it("sem nome reconhecível, cai para a 1ª aba não vazia (nunca a maior)", () => {
    expect(guessOrderSheet(wb({ Vazia: 0, Primeira: 3, Grande: 900 }))).toBe(
      "Primeira"
    );
  });

  it("retorna null quando não há aba com conteúdo", () => {
    expect(guessOrderSheet(wb({ A: 0, B: 0 }))).toBeNull();
  });
});

describe("guessMapping", () => {
  it("prefere QUANTIDADE TOTAL sobre QUANT. DE EMBALAGEM (PADRÃO FORTE)", () => {
    const headers = [
      "CODIGO",
      "DESCRIÇÃO DA MERCADORIA",
      "EMBALAGEM MINIMA",
      "QUANT. DE EMBALAGEM",
      "QUANTIDADE TOTAL",
      "VALOR UNITÁRIO",
    ];
    const m = guessMapping(headers);
    expect(m.sku).toEqual({ kind: "column", index: 0 });
    expect(m.quantity).toEqual({ kind: "column", index: 4 });
    expect(m.unitPrice).toEqual({ kind: "column", index: 5 });
  });

  it("cai para o palpite genérico quando não há coluna 'total'", () => {
    const m = guessMapping(["Código", "Qtde", "Preço"]);
    expect(m.quantity).toEqual({ kind: "column", index: 1 });
  });
});
