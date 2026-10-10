import { SheetMatrix } from "@/utils/import/reader";

import { Mapping } from "./interface";

/**
 * Como o arquivo virou linhas de pedido:
 * - `items`: um formato conhecido leu o PDF sozinho;
 * - `grid`: PDF sem formato conhecido — a pessoa apontou as colunas;
 * - `sheet`: planilha, lida aqui no navegador.
 */
export type ReadingKind = "items" | "grid" | "sheet";

/** O que o sistema SUGERIU ao abrir o arquivo, antes de a pessoa mexer. */
export interface ReadingGuess {
  sheet: string | null;
  headerIndex: number;
  mapping: Mapping;
}

interface SourceArgs {
  kind: ReadingKind;
  fileName: string;
  fileRef: string | null;
  guess: ReadingGuess | null;
  sheetNames: string[];
  sheet: string | null;
  headerIndex: number;
  headers: string[];
  mapping: Mapping;
  matrix: SheetMatrix | null;
  rowsRead: number;
}

/** Linhas da grade que acompanham o diagnóstico (o backend corta de novo). */
const SAMPLE_ROWS = 40;

/**
 * O relato que acompanha o preview: de que arquivo vieram as linhas e o que a
 * pessoa teve de corrigir na leitura.
 *
 * Não muda nada do que o preview devolve. Serve para o backend registrar os
 * arquivos que o sistema não leu sozinho — aba errada, cabeçalho errado, coluna
 * errada, código sem produto — e é com esse registro que o leitor é corrigido.
 * Quando um formato conhecido já entregou os itens prontos (`items`), não há
 * sugestão a comparar e só o arquivo é identificado.
 */
export const buildImportSource = ({
  kind,
  fileName,
  fileRef,
  guess,
  sheetNames,
  sheet,
  headerIndex,
  headers,
  mapping,
  matrix,
  rowsRead,
}: SourceArgs) => ({
  fileName,
  fileRef,
  reading:
    kind === "items"
      ? { kind, rowsRead }
      : {
          kind,
          rowsRead,
          sheetNames,
          sheet,
          guessedSheet: guess?.sheet ?? sheet,
          headerIndex,
          guessedHeaderIndex: guess?.headerIndex ?? headerIndex,
          headers,
          mapping,
          guessedMapping: guess?.mapping ?? mapping,
          sampleRows: (matrix ?? []).slice(0, SAMPLE_ROWS),
        },
});
