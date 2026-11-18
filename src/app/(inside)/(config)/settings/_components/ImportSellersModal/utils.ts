import { downloadSheet } from "@/utils/import/writer";

import { ImportSellerRow } from "./interface";

/**
 * Cabeçalho da planilha modelo. A ordem das colunas define o mapeamento na
 * leitura — manter sincronizado com `rowToInput`.
 */
const EXAMPLE_HEADERS = ["Nome", "Email", "CPF", "Região"];

const EXAMPLE_ROWS = [
  ["Maria Souza", "maria@empresa.com.br", "123.456.789-09", "Sul"],
  ["João Lima", "joao@empresa.com.br", "", "Capital"],
];

export const downloadExampleSheet = (): Promise<void> =>
  downloadSheet(
    "modelo-importacao-vendedores.xlsx",
    [EXAMPLE_HEADERS, ...EXAMPLE_ROWS],
    "Vendedores"
  );

const optional = (value: string | undefined): string | null => {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
};

const rowToInput = (cells: string[]): ImportSellerRow => ({
  name: (cells[0] ?? "").trim(),
  email: (cells[1] ?? "").trim(),
  cpf: optional(cells[2]),
  region: optional(cells[3]),
});

const isBlankRow = (cells: string[]) =>
  cells.every((cell) => !(cell ?? "").trim());

/**
 * Converte a matriz de células do arquivo (já lido) em linhas para a mutation.
 * Descarta o cabeçalho e as linhas totalmente vazias (sobra comum do Excel).
 * Nome e email incompletos seguem para o backend, que devolve o erro POR
 * LINHA — assim a pessoa vê qual linha corrigir, em vez de um erro geral.
 */
export const parseSellersRows = (matrix: string[][]): ImportSellerRow[] => {
  const dataRows = matrix.slice(1).filter((cells) => !isBlankRow(cells));

  if (dataRows.length === 0) {
    throw new Error("A planilha não contém linhas de dados.");
  }

  return dataRows.map(rowToInput);
};
