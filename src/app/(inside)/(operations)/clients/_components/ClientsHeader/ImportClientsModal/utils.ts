import { downloadCSV, parseCSV } from "@/utils/format/csv";

import { ImportClientRow } from "./interface";

/**
 * Cabeçalho da planilha modelo. A ordem das colunas define o mapeamento na
 * leitura do arquivo enviado — manter sincronizado com `rowToInput`. Os demais
 * dados do cliente são preenchidos automaticamente via Receita Federal a partir
 * do CNPJ, então a planilha só pede CNPJ + observações internas (opcional).
 */
const EXAMPLE_HEADERS = ["CNPJ", "Observações"];

const EXAMPLE_ROWS = [
  ["00.000.000/0001-91", ""],
  ["11.222.333/0001-81", "Cliente indicado pela fábrica"],
];

export const downloadExampleSheet = (): void => {
  downloadCSV("modelo-importacao-clientes.csv", [
    EXAMPLE_HEADERS,
    ...EXAMPLE_ROWS,
  ]);
};

const rowToInput = (cells: string[]): ImportClientRow => {
  const notes = (cells[1] ?? "").trim();
  return {
    cnpj: (cells[0] ?? "").replace(/\D/g, ""),
    notes: notes || null,
  };
};

/**
 * Lê o conteúdo de um CSV e converte em linhas prontas para a mutation.
 * Descarta a primeira linha (cabeçalho). Lança erro se não houver dados.
 */
export const parseClientsFile = (text: string): ImportClientRow[] => {
  const matrix = parseCSV(text);
  const dataRows = matrix.slice(1);

  if (dataRows.length === 0) {
    throw new Error("A planilha não contém linhas de dados.");
  }

  return dataRows.map(rowToInput);
};
