import { SelectOption } from "@/components/Input";
import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";
import { isPdfName } from "../presets";
import { PreviewItem } from "../interface";

/** Colunas mapeadas de uma planilha para o item de pedido. */
export interface ColumnMapping {
  sku: ColumnChoice;
  quantity: ColumnChoice;
  unitPrice: ColumnChoice;
}

/**
 * Monta o preview de itens a partir das linhas já fatiadas da planilha e do
 * mapeamento de colunas. Descarta linhas sem SKU ou com quantidade ≤ 0. Função
 * pura — não depende do estado do wizard.
 */
export const buildSpreadsheetPreview = (
  sheet: { rows: string[][] } | null,
  mapping: ColumnMapping
): PreviewItem[] => {
  if (!sheet) return [];
  return sheet.rows
    .map((cells) => {
      const qty = parseNumber(valueForChoice(mapping.quantity, cells));
      const price =
        mapping.unitPrice.kind === "none"
          ? null
          : parseNumber(valueForChoice(mapping.unitPrice, cells));
      return {
        sku: valueForChoice(mapping.sku, cells).trim(),
        name: null,
        quantity: Number.isFinite(qty) ? String(qty) : "0",
        unitPrice:
          price != null && Number.isFinite(price) ? String(price) : null,
      };
    })
    .filter((r) => r.sku !== "" && Number(r.quantity) > 0);
};

/** Classifica o arquivo de amostra pelo nome, para o campo `fileType`. */
export const fileTypeOf = (name: string): "PDF" | "XLSX" | "CSV" => {
  if (isPdfName(name)) return "PDF";
  return /\.csv$/i.test(name) ? "CSV" : "XLSX";
};

/**
 * Opções do seletor de preço unitário (PDF multilinha): os valores "R$" da
 * primeira linha de amostra que os traz, mais a opção "sem preço". Vazio quando
 * nenhuma linha do preview oferece valores.
 */
export const buildPriceOptions = (
  preview: PreviewItem[] | null
): SelectOption[] => {
  const sample = preview?.find((it) => (it.priceOptions?.length ?? 0) > 0);
  if (!sample) return [];
  return [
    ...(sample.priceOptions ?? []).map((v, i) => ({
      value: String(i),
      label: v,
    })),
    { value: "none", label: "Sem preço (usar a tabela da fábrica)" },
  ];
};
