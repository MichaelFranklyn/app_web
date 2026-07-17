import { downloadSheet } from "@/utils/import/writer";

import { ImportClientRow } from "./interface";

/**
 * Cabeçalho da planilha modelo. A ordem das colunas define o mapeamento na
 * leitura do arquivo enviado — manter sincronizado com `rowToInput`. Os demais
 * dados do cliente são preenchidos automaticamente via Receita Federal a partir
 * do CNPJ, então a planilha só pede CNPJ + observações internas (opcional).
 *
 * Espelha o `ImportCompanyClientRowInput` do backend: cnpj (obrigatório) e
 * notes (opcional).
 */
const EXAMPLE_HEADERS = ["CNPJ", "Observações"];

const EXAMPLE_ROWS = [
  ["00.000.000/0001-91", ""],
  ["11.222.333/0001-81", "Cliente indicado pela fábrica"],
];

export const downloadExampleSheet = (): Promise<void> =>
  downloadSheet(
    "modelo-importacao-clientes.xlsx",
    [EXAMPLE_HEADERS, ...EXAMPLE_ROWS],
    "Clientes"
  );

const rowToInput = (cells: string[]): ImportClientRow => {
  const notes = (cells[1] ?? "").trim();
  return {
    cnpj: (cells[0] ?? "").replace(/\D/g, ""),
    notes: notes || null,
  };
};

/**
 * Converte a matriz de células do arquivo (xlsx ou csv, já lido) em linhas
 * prontas para a mutation. Descarta a primeira linha (cabeçalho). Lança erro se
 * não houver dados.
 */
export const parseClientsRows = (matrix: string[][]): ImportClientRow[] => {
  const dataRows = matrix.slice(1);

  if (dataRows.length === 0) {
    throw new Error("A planilha não contém linhas de dados.");
  }

  return dataRows.map(rowToInput);
};
