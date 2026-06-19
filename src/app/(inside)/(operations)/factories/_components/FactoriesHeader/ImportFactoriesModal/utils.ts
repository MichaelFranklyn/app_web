import { downloadCSV, parseCSV } from "@/utils/format/csv";
import { toIsoDate } from "@/utils/format/date";

import { ImportFactoryRow } from "./interface";

/**
 * Cabeçalho da planilha modelo. A ordem das colunas define o mapeamento na
 * leitura do arquivo enviado — manter sincronizado com `rowToInput`.
 */
const EXAMPLE_HEADERS = [
  "CNPJ",
  "Taxa de comissão (%)",
  "Base de cálculo (Faturado ou Pedido)",
  "Dia de pagamento (1-31)",
  "Território",
  "Início do contrato (AAAA-MM-DD)",
  "Término do contrato (AAAA-MM-DD)",
  "Condições especiais",
];

const EXAMPLE_ROWS = [
  ["00.000.000/0001-91", "5", "Faturado", "10", "Sul", "2025-01-01", "2025-12-31", ""],
  ["11.222.333/0001-81", "7.5", "Pedido", "5", "Nacional", "", "", "Frete por conta da fábrica"],
];

export const downloadExampleSheet = (): void => {
  downloadCSV("modelo-importacao-fabricas.csv", [EXAMPLE_HEADERS, ...EXAMPLE_ROWS]);
};

const parseDecimal = (value: string): number => {
  // Aceita vírgula ou ponto como separador decimal (ex.: "7,5" ou "7.5").
  return Number(value.trim().replace(",", "."));
};

const toIsoOrNull = (value: string): string | null => {
  if (!value.trim()) return null;
  return toIsoDate(value) || null;
};

const rowToInput = (cells: string[]): ImportFactoryRow => {
  const note = (cells[7] ?? "").trim();
  return {
    cnpj: (cells[0] ?? "").replace(/\D/g, ""),
    commissionRate: parseDecimal(cells[1] ?? ""),
    commissionCalcBasis: (cells[2] ?? "").trim(),
    paymentTermDays: parseInt((cells[3] ?? "").replace(/\D/g, ""), 10),
    territory: (cells[4] ?? "").trim(),
    contractStart: toIsoOrNull(cells[5] ?? ""),
    contractEnd: toIsoOrNull(cells[6] ?? ""),
    specialConditions: note ? { note } : null,
  };
};

/**
 * Lê o conteúdo de um CSV e converte em linhas prontas para a mutation.
 * Descarta a primeira linha (cabeçalho). Lança erro se não houver dados.
 */
export const parseFactoriesFile = (text: string): ImportFactoryRow[] => {
  const matrix = parseCSV(text);
  const dataRows = matrix.slice(1);

  if (dataRows.length === 0) {
    throw new Error("A planilha não contém linhas de dados.");
  }

  return dataRows.map(rowToInput);
};
