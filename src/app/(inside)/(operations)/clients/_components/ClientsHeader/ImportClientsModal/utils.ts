import { maskCNPJ } from "@/utils/format/masks";
import { normalizeLabel } from "@/utils/import/similarity";

import { ImportClientRow, ImportSheetRow } from "./interface";

/**
 * Cabeçalho da planilha. Uma linha = um cliente numa fábrica e o vendedor que o
 * atende nela: o cliente atendido em três fábricas aparece em três linhas,
 * repetindo o CNPJ. Os demais dados do cliente vêm da Receita pelo CNPJ.
 *
 * Espelha o `ImportCompanyClientRowInput` do backend: cnpj (obrigatório),
 * notes, sellerEmail e factoryName (os dois últimos juntos, ou nenhum).
 */
export const SHEET_HEADERS = [
  "CNPJ",
  "Observações",
  "Email do vendedor",
  "Fábrica",
];

const EXAMPLE_ROWS = [
  ["11.222.333/0001-81", "Cliente indicado pela fábrica", "", ""],
];

/** A carteira da empresa como planilha, pronta para editar e reenviar. */
export const buildSheetMatrix = (rows: ImportSheetRow[]): string[][] => [
  SHEET_HEADERS,
  ...(rows.length === 0
    ? EXAMPLE_ROWS
    : rows.map((row) => [
        maskCNPJ(row.cnpj ?? ""),
        row.notes ?? "",
        row.sellerEmail ?? "",
        row.factoryName ?? "",
      ])),
];

const CNPJ_HEADERS = [
  "cnpj",
  "cpf/cnpj",
  "cnpj/cpf",
  "cnpj do cliente",
  "documento",
];
const NOTES_HEADERS = ["observacoes", "observacao", "obs"];
const SELLER_HEADERS = [
  "email do vendedor",
  "e-mail do vendedor",
  "vendedor",
  "email vendedor",
];
const FACTORY_HEADERS = ["fabrica", "fabricas", "representada"];

const looksLikeDocument = (value: string): boolean =>
  [11, 14].includes(value.replace(/\D/g, "").length);

const indexOrNull = (headers: string[], names: string[]): number | null => {
  const index = headers.findIndex((h) => names.includes(h));
  return index >= 0 ? index : null;
};

interface SheetColumns {
  cnpj: number;
  notes: number | null;
  seller: number | null;
  factory: number | null;
}

/**
 * Onde está cada coluna. No modelo daqui o CNPJ é a primeira; na lista
 * exportada de outro sistema (a Mercos traz razão social, fantasia,
 * endereço…) pode estar em qualquer lugar. Vale o título da coluna; sem título
 * conhecido, a coluna em que a maioria das linhas tem cara de CNPJ/CPF; sem
 * nada disso, a primeira. Vendedor e fábrica só valem pelo título.
 */
export const findColumns = (matrix: string[][]): SheetColumns => {
  const headers = (matrix[0] ?? []).map((h) => normalizeLabel(h));
  const named = {
    notes: indexOrNull(headers, NOTES_HEADERS),
    seller: indexOrNull(headers, SELLER_HEADERS),
    factory: indexOrNull(headers, FACTORY_HEADERS),
  };

  const byHeader = headers.findIndex((h) => CNPJ_HEADERS.includes(h));
  if (byHeader >= 0) return { cnpj: byHeader, ...named };

  const sample = matrix.slice(1, 51);
  let best = 0;
  let bestHits = 0;
  headers.forEach((_, index) => {
    const hits = sample.filter((row) =>
      looksLikeDocument(row[index] ?? "")
    ).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = index;
    }
  });
  return { cnpj: bestHits > sample.length / 2 ? best : 0, ...named };
};

const cell = (cells: string[], index: number | null): string | null =>
  index === null ? null : (cells[index] ?? "").trim() || null;

/**
 * Converte a matriz de células do arquivo (xlsx ou csv, já lido) em linhas
 * prontas para a mutation. Descarta a primeira linha (cabeçalho) e as linhas
 * totalmente vazias. Lança erro se não houver dados.
 */
export const parseClientsRows = (matrix: string[][]): ImportClientRow[] => {
  const dataRows = matrix
    .slice(1)
    .filter((cells) => cells.some((value) => (value ?? "").trim() !== ""));

  if (dataRows.length === 0) {
    throw new Error("A planilha não contém linhas de dados.");
  }

  const columns = findColumns(matrix);
  return dataRows.map((cells) => ({
    cnpj: (cells[columns.cnpj] ?? "").replace(/\D/g, ""),
    notes: cell(cells, columns.notes),
    sellerEmail: cell(cells, columns.seller),
    factoryName: cell(cells, columns.factory),
  }));
};
