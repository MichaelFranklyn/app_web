import { toIsoDate } from "@/utils/format/date";
import { downloadSheet } from "@/utils/import/writer";

import { ImportFactoryRow } from "./interface";

/**
 * Cabeçalho da planilha modelo. A ordem das colunas define o mapeamento na
 * leitura do arquivo enviado — manter sincronizado com `rowToInput`.
 *
 * "Base de cálculo" aceita Faturado (comissão no faturamento) ou Pagamento
 * (comissão conforme o cliente paga) — os mesmos dois modos do formulário de
 * vínculo. O backend rejeita a linha se vier outra coisa.
 */
const EXAMPLE_HEADERS = [
  "CNPJ",
  "Taxa de comissão (%)",
  "Base de cálculo (Faturado ou Pagamento)",
  "Dia de pagamento (1-31)",
  "Território",
  "Início do contrato (AAAA-MM-DD)",
  "Término do contrato (AAAA-MM-DD)",
  "Condições especiais",
];

const EXAMPLE_ROWS = [
  [
    "00.000.000/0001-91",
    "5",
    "Faturado",
    "10",
    "Sul",
    "2025-01-01",
    "2025-12-31",
    "",
  ],
  [
    "11.222.333/0001-81",
    "7,5",
    "Pagamento",
    "5",
    "Nacional",
    "",
    "",
    "Frete por conta da fábrica",
  ],
];

export const downloadExampleSheet = (): Promise<void> =>
  downloadSheet(
    "modelo-importacao-fabricas.xlsx",
    [EXAMPLE_HEADERS, ...EXAMPLE_ROWS],
    "Fábricas"
  );

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
 * Converte a matriz de células do arquivo (xlsx ou csv, já lido) em linhas
 * prontas para a mutation. Descarta a primeira linha (cabeçalho). Lança erro se
 * não houver dados.
 */
export const parseFactoriesRows = (matrix: string[][]): ImportFactoryRow[] => {
  const dataRows = matrix.slice(1);

  if (dataRows.length === 0) {
    throw new Error("A planilha não contém linhas de dados.");
  }

  return dataRows.map(rowToInput);
};
