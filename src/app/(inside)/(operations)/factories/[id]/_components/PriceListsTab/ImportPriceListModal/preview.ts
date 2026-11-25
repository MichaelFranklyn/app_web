import { formatPercentPoints } from "@/utils/format/percent";
import { parseNumber } from "@/utils/import/columns";

import { buildImportInput } from "./build";

/** Uma linha já montada para envio — é o que a prévia mostra. */
export type ImportPreviewRow = ReturnType<
  typeof buildImportInput
>["input"]["rows"][number];

/** Quantos produtos a prévia mostra: o bastante para conferir, sem virar lista. */
export const PREVIEW_SIZE = 3;

/** Primeiros produtos COM preço — uma linha sem preço não ajuda a conferir. */
export const pickPreviewRows = (rows: ImportPreviewRow[]): ImportPreviewRow[] =>
  rows.filter((row) => row.prices.length > 0).slice(0, PREVIEW_SIZE);

/**
 * Alíquota da planilha como vai ser gravada: "0,0325" em fração vira "3,25%".
 * Texto que não é número aparece como está (a pessoa vê que errou a coluna).
 */
export const formatRateSample = (
  value: string,
  asFraction: boolean
): string => {
  const n = parseNumber(value);
  if (!Number.isFinite(n)) return value;
  return formatPercentPoints(asFraction ? n * 100 : n, 2, { trimZeros: true });
};
