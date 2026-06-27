import { maskCurrency } from "@/utils/format/masks";
import { ColumnChoice, parseNumber } from "@/utils/import/columns";

import { Mapping } from "./interface";

export { fileToBase64 } from "@/utils/file";

export const NONE: ColumnChoice = { kind: "none" };

/** Palpite de coluna por palavra-chave no cabeçalho (SKU, quantidade, preço). */
export const guessMapping = (headers: string[]): Mapping => {
  const find = (...hints: string[]): ColumnChoice => {
    for (const hint of hints) {
      const idx = headers.findIndex((h) => h.toLowerCase().includes(hint));
      if (idx >= 0) return { kind: "column", index: idx };
    }
    return NONE;
  };
  return {
    sku: find("sku", "código", "codigo", "cod", "ref"),
    quantity: find("qtd", "quant", "qtde", "qt"),
    unitPrice: find("preço", "preco", "valor", "unit"),
  };
};

export const confidenceTone = (value: number): "green" | "amber" | "red" =>
  value >= 90 ? "green" : value >= 50 ? "amber" : "red";

// O SKU casou (senão seria 0%); a confiança mede o PREÇO/NÍVEL, não o SKU.
export const confidenceHelp = (value: number): string => {
  if (value >= 100)
    return "O preço do arquivo bate com um nível da tabela ativa.";
  if (value >= 90)
    return "O arquivo não trouxe preço; usamos o preço da tabela ativa.";
  if (value >= 70)
    return (
      "O SKU casou, mas o preço do arquivo não corresponde a nenhum nível da tabela " +
      "(ex.: houve desconto). Escolhemos o nível de preço mais próximo — confira e, " +
      "se precisar, troque o nível ao lado."
    );
  if (value >= 50)
    return "O produto não tem preço na tabela ativa; escolha o nível comercial.";
  return "SKU não encontrado no catálogo desta fábrica.";
};

// Preço vindo do backend ("13.23") → máscara BRL digitável ("13,23"). parseNumber
// continua lendo o valor mascarado na hora de confirmar.
export const toMoneyMask = (value: string | null | undefined): string => {
  if (!value) return "";
  const n = parseNumber(String(value));
  return Number.isFinite(n) ? maskCurrency(n.toFixed(2)) : "";
};
