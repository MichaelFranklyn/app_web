import { normalizeLabel } from "@/utils/import/similarity";
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

const CNPJ_HEADERS = [
  "cnpj",
  "cpf/cnpj",
  "cnpj/cpf",
  "cnpj do cliente",
  "documento",
];
const NOTES_HEADERS = ["observacoes", "observacao", "obs"];

const looksLikeDocument = (value: string): boolean =>
  [11, 14].includes(value.replace(/\D/g, "").length);

/**
 * Onde está o CNPJ. No modelo daqui é a primeira coluna; na lista exportada de
 * outro sistema (a Mercos traz razão social, fantasia, endereço…) pode estar
 * em qualquer lugar. Vale o título da coluna; sem título conhecido, a coluna
 * em que a maioria das linhas tem cara de CNPJ/CPF; sem nada disso, a primeira.
 */
export const findColumns = (
  matrix: string[][]
): { cnpj: number; notes: number | null } => {
  const headers = (matrix[0] ?? []).map((h) => normalizeLabel(h));
  const notesIndex = headers.findIndex((h) => NOTES_HEADERS.includes(h));
  const notes = notesIndex >= 0 ? notesIndex : null;

  const byHeader = headers.findIndex((h) => CNPJ_HEADERS.includes(h));
  if (byHeader >= 0) return { cnpj: byHeader, notes };

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
  return {
    cnpj: bestHits > sample.length / 2 ? best : 0,
    notes,
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

  const { cnpj, notes } = findColumns(matrix);
  return dataRows.map((cells) => {
    const note = notes === null ? "" : (cells[notes] ?? "").trim();
    return {
      cnpj: (cells[cnpj] ?? "").replace(/\D/g, ""),
      notes: note || null,
    };
  });
};
