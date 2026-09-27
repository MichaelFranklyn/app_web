"use client";

import { useMemo, useState } from "react";

import {
  SheetMatrix,
  guessBestSheet,
  guessHeaderRow,
  readWorkbook,
  splitAt,
} from "@/utils/import/reader";

import { HistoryMapping, QuantityUnit } from "./interface";
import { guessMapping } from "./utils";

/**
 * O arquivo e o que se entendeu dele: a aba, a linha do cabeçalho, as colunas
 * de cada campo e em que a quantidade está contada. Trocar o cabeçalho refaz o
 * palpite das colunas — os títulos mudaram.
 */
export function useHistorySheet() {
  const [files, setFiles] = useState<File[]>([]);
  const [matrix, setMatrix] = useState<SheetMatrix>([]);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<HistoryMapping | null>(null);
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>("UNITS");
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  const applyHeader = (source: SheetMatrix, index: number) => {
    setHeaderIndex(index);
    setMapping(guessMapping(splitAt(source, index).headers));
  };

  const onFiles = async (next: File[]) => {
    setFiles(next);
    setReadError(null);
    setMatrix([]);
    setMapping(null);
    const file = next[0];
    if (!file) return;
    setReading(true);
    try {
      const workbook = await readWorkbook(file);
      const sheet = guessBestSheet(workbook);
      const source = sheet ? workbook.sheets[sheet] : [];
      if (source.length < 2) throw new Error("empty");
      setMatrix(source);
      applyHeader(source, guessHeaderRow(source));
    } catch {
      setReadError(
        "Não foi possível ler este arquivo. Confira se é uma planilha Excel (.xlsx) ou CSV com os pedidos."
      );
    } finally {
      setReading(false);
    }
  };

  // Memoizado: `data.rows` alimenta os valores distintos de fábrica e vendedor,
  // e um array novo a cada render reabria o palpite de correspondências em
  // laço (Maximum update depth).
  const data = useMemo(
    () => splitAt(matrix, headerIndex),
    [matrix, headerIndex]
  );

  return {
    files,
    onFiles,
    reading,
    readError,
    matrix,
    headerIndex,
    setHeaderIndex: (index: number) => applyHeader(matrix, index),
    data,
    mapping,
    setMapping,
    quantityUnit,
    setQuantityUnit,
  };
}
