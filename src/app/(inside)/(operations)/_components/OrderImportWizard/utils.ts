import { maskCurrency } from "@/utils/format/masks";
import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";

import { ExtractedItem, Mapping } from "./interface";

export { fileToBase64 } from "@/utils/file";

export const NONE: ColumnChoice = { kind: "none" };

/** Linha normalizada a enviar para o preview de importação. */
export interface ImportRow {
  sku: string;
  quantity: number;
  unitPrice: number | null;
}

// Só linhas com SKU e quantidade positiva viram item; o resto é descartado.
const isValidRow = (row: ImportRow): boolean =>
  row.sku !== "" && Number.isFinite(row.quantity) && row.quantity > 0;

/** Linhas a importar a partir da planilha mapeada (Excel/CSV). */
export const rowsFromSheet = (
  sheet: { rows: string[][] } | null,
  mapping: Mapping
): ImportRow[] => {
  if (!sheet) return [];
  return sheet.rows
    .map((cells) => {
      const priceRaw =
        mapping.unitPrice.kind === "none"
          ? NaN
          : parseNumber(valueForChoice(mapping.unitPrice, cells));
      return {
        sku: valueForChoice(mapping.sku, cells).trim(),
        quantity: parseNumber(valueForChoice(mapping.quantity, cells)),
        unitPrice: Number.isFinite(priceRaw) ? priceRaw : null,
      };
    })
    .filter(isValidRow);
};

/** Linhas a importar a partir dos itens já extraídos pelo modelo da fábrica. */
export const rowsFromItems = (items: ExtractedItem[]): ImportRow[] =>
  items
    .map((it) => {
      const price = it.unitPrice != null ? parseNumber(it.unitPrice) : null;
      return {
        sku: it.sku.trim(),
        quantity: parseNumber(it.quantity),
        unitPrice: price != null && Number.isFinite(price) ? price : null,
      };
    })
    .filter(isValidRow);

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
