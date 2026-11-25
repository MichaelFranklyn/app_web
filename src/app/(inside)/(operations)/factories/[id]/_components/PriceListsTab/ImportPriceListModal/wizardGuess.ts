import {
  ColumnChoice,
  parseNumber,
  valueForChoice,
} from "@/utils/import/columns";
import { guessHeaderRow, SheetMatrix, splitAt } from "@/utils/import/reader";

import { toTitleCase } from "@/utils/format/titleCase";

import { TierColumn } from "./interface";
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

/** Uma coluna de preço de uma LISTA anterior (obsoleta), com a dica da vigente. */
export interface StaleListColumn {
  index: number;
  listNumber: number;
  latestNumber: number;
  latestHeader: string;
}

const LIST_NUMBER = /lista\s*(\d+)/i;

/**
 * Colunas de preço de uma lista ANTERIOR. Planilhas de fábrica costumam trazer a
 * lista vigente e a anterior lado a lado, com o mesmo nome de nível ("LISTA 38
 * DIAMANTE" e "LISTA 39 DIAMANTE") — marcar a antiga como nível importa preços
 * desatualizados. Acha o padrão "LISTA N" nos cabeçalhos e, havendo mais de um N,
 * marca como obsoletas as colunas de N menor que o máximo (a vigente).
 */
export const findStaleListColumns = (headers: string[]): StaleListColumn[] => {
  const numbered = headers
    .map((header, index) => {
      const match = header.match(LIST_NUMBER);
      return match ? { index, header, listNumber: Number(match[1]) } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  if (numbered.length < 2) return [];
  const latestNumber = Math.max(...numbered.map((n) => n.listNumber));
  const latestHeader =
    numbered.find((n) => n.listNumber === latestNumber)?.header ?? "";
  return numbered
    .filter((n) => n.listNumber < latestNumber)
    .map((n) => ({
      index: n.index,
      listNumber: n.listNumber,
      latestNumber,
      latestHeader,
    }));
};

/** Palpites de coluna deduzidos dos cabeçalhos da grade (sem o mapeamento base). */
export interface GuessedColumns {
  headerIndex: number;
  ipiChoice: ColumnChoice;
  ipiAsFraction: boolean;
  ncmChoice: ColumnChoice;
  stMva: StMvaChoices;
  taxesAsFraction: boolean;
  tierColumns: TierColumn[];
}

const PRICE_WORD = /\b(pre[çc]os?|price|valor)\b/i;
// Colunas fiscais também podem trazer "valor" no título ("VALOR IPI"): nunca são nível.
const TAX_WORD = /\b(ipi|icms|st|mva|ncm|al[íi]quota|fecp|pis|cofins)\b|%/i;

/**
 * Colunas de preço que viram nível: "PREÇO CAPITAL" → nível "Capital",
 * "LISTA 39 DIAMANTE" → "Diamante". Ignora colunas fiscais e as de lista
 * anterior (obsoletas). O nome do nível é o que sobra do título; se não sobrar
 * nada ("PREÇO"), fica em branco para a pessoa digitar.
 */
export const guessTierColumns = (headers: string[]): TierColumn[] => {
  const stale = new Set(findStaleListColumns(headers).map((c) => c.index));
  return headers
    .map((header, index) => ({ header: header.trim(), index }))
    .filter(
      ({ header, index }) =>
        !stale.has(index) &&
        !TAX_WORD.test(header) &&
        (PRICE_WORD.test(header) || LIST_NUMBER.test(header))
    )
    .map(({ header, index }) => {
      const rest = header
        .replace(LIST_NUMBER, "")
        .replace(PRICE_WORD, "")
        .replace(/^[\s\-–:/.]+|[\s\-–:/.]+$/g, "")
        .replace(/^(d[aeo]s?)\s+/i, "")
        .trim();
      return {
        id: `t${index + 1}`,
        columnIndex: index,
        tierName: toTitleCase(rest),
      };
    });
};

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
  const mva = findHeader("mva");
  const internalRate = findHeader("interna");
  // Uma coluna "ICMS" solta não é sinal de ST: só vira crédito de ICMS quando a
  // planilha traz MVA ou alíquota interna — senão o bloco ST abriria marcado
  // numa tabela que não tem ST.
  const hasStEvidence = mva.kind !== "none" || internalRate.kind !== "none";
  const stMva: StMvaChoices = {
    mva,
    icmsCredit: hasStEvidence
      ? findHeader("icms créd", "icms cred", "icms")
      : findHeader("icms créd", "icms cred"),
    internalRate,
  };
  return {
    headerIndex,
    ipiChoice,
    ipiAsFraction: looksLikeFraction(ipiChoice, split.rows),
    ncmChoice: findHeader("ncm"),
    stMva,
    taxesAsFraction: looksLikeFraction(stMva.internalRate, split.rows),
    tierColumns: guessTierColumns(split.headers),
  };
};
