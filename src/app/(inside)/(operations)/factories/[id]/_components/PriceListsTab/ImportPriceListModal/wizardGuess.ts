import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";
import { guessHeaderRow, SheetMatrix, splitAt } from "@/utils/import/reader";

import { StMvaChoices } from "./StMvaFields";

/**
 * Se todos os valores da coluna são ≤ 1 (ex.: 0,0325), a planilha traz fração
 * decimal e não percentual — sinaliza a conversão ×100 no backend.
 */
export const looksLikeFraction = (
  choice: ColumnChoice,
  dataRows: string[][]
): boolean => {
  if (choice.kind === "none") return false;
  const values = dataRows
    .map((cells) => parseNumber(valueForChoice(choice, cells)))
    .filter((v) => Number.isFinite(v) && v > 0);
  return values.length > 0 && values.every((v) => v <= 1);
};

/** Palpites de coluna deduzidos dos cabeçalhos da grade (sem o mapeamento base). */
export interface GuessedColumns {
  headerIndex: number;
  ipiChoice: ColumnChoice;
  ipiAsFraction: boolean;
  ncmChoice: ColumnChoice;
  stMva: StMvaChoices;
  taxesAsFraction: boolean;
}

/**
 * Adivinha a linha de cabeçalho e as colunas fiscais (IPI, NCM, ST) de uma grade
 * de tabela de preço. Função pura: recebe a grade crua, devolve os palpites — o
 * hook decide como aplicá-los ao estado.
 */
export const guessColumns = (parsed: SheetMatrix): GuessedColumns => {
  const headerIndex = guessHeaderRow(parsed);
  const split = splitAt(parsed, headerIndex);
  // Hints em ordem de prioridade: o mais específico ganha mesmo que outra
  // coluna apareça antes (ex.: "icms cred" acha ICMS CREDITO e não ICMS).
  const findHeader = (...hints: string[]): ColumnChoice => {
    for (const hint of hints) {
      const idx = split.headers.findIndex((h) =>
        h.toLowerCase().includes(hint)
      );
      if (idx >= 0) return { kind: "column", index: idx };
    }
    return { kind: "none" };
  };
  const ipiChoice = findHeader("ipi");
  // Colunas fiscais da planilha estilo Bahia: MVA, ICMS Crédito, Alíquota Interna.
  const stMva: StMvaChoices = {
    mva: findHeader("mva"),
    icmsCredit: findHeader("icms créd", "icms cred", "icms"),
    internalRate: findHeader("interna"),
  };
  return {
    headerIndex,
    ipiChoice,
    ipiAsFraction: looksLikeFraction(ipiChoice, split.rows),
    ncmChoice: findHeader("ncm"),
    stMva,
    taxesAsFraction: looksLikeFraction(stMva.internalRate, split.rows),
  };
};
