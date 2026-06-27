import { parseCSV } from "@/utils/format/csv";

export type SheetMatrix = string[][];

export interface SheetData {
  headers: string[];
  rows: string[][];
}

/** Arquivo aberto com todas as abas convertidas em matrizes de células. */
export interface WorkbookData {
  sheetNames: string[];
  sheets: Record<string, SheetMatrix>;
}

/**
 * Lê o arquivo inteiro (CSV ou Excel .xlsx/.xls) com TODAS as abas — planilhas
 * reais de fábrica misturam formulário de pedido, ajustes e a tabela de preço
 * em abas diferentes; quem escolhe a aba é a UI. CSV vira uma aba única.
 * O Excel é carregado sob demanda (import dinâmico do SheetJS) para não pesar
 * o bundle de quem só usa CSV.
 *
 * Não assume onde está o cabeçalho — planilhas reais de fábrica costumam ter
 * linhas de título/logo antes dele. Quem escolhe a linha do cabeçalho é a UI.
 */
export const readWorkbook = async (file: File): Promise<WorkbookData> => {
  const name = file.name.toLowerCase();
  const isCsv = name.endsWith(".csv") || file.type === "text/csv";

  if (isCsv) {
    const matrix = dropEmptyRows(parseCSV(await file.text()));
    return { sheetNames: ["CSV"], sheets: { CSV: matrix } };
  }

  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheets: Record<string, SheetMatrix> = {};
  for (const sheetName of workbook.SheetNames) {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(
      workbook.Sheets[sheetName],
      {
        header: 1,
        blankrows: false,
        raw: false,
        defval: "",
      }
    );
    sheets[sheetName] = dropEmptyRows(
      matrix.map((row) => row.map((cell) => String(cell ?? "")))
    );
  }

  return { sheetNames: workbook.SheetNames, sheets };
};

/** A aba com mais linhas é quase sempre a tabela de preço (vs. formulário/ajustes). */
export const guessBestSheet = (workbook: WorkbookData): string | null => {
  let best: string | null = null;
  let bestRows = 0;
  for (const name of workbook.sheetNames) {
    const rows = workbook.sheets[name]?.length ?? 0;
    if (rows > bestRows) {
      bestRows = rows;
      best = name;
    }
  }
  return best;
};

/** Compat: lê só a primeira aba (fluxos que não têm seletor de aba). */
export const readSpreadsheet = async (file: File): Promise<SheetMatrix> => {
  const workbook = await readWorkbook(file);
  return workbook.sheets[workbook.sheetNames[0]] ?? [];
};

const dropEmptyRows = (matrix: string[][]): SheetMatrix =>
  matrix.filter((row) => row.some((cell) => String(cell).trim() !== ""));

/** Palpite do cabeçalho: a linha com mais células preenchidas entre as primeiras. */
export const guessHeaderRow = (matrix: SheetMatrix): number => {
  const limit = Math.min(matrix.length, 15);
  let best = 0;
  let bestCount = -1;
  for (let i = 0; i < limit; i++) {
    const count = matrix[i].filter((cell) => cell.trim() !== "").length;
    if (count > bestCount) {
      bestCount = count;
      best = i;
    }
  }
  return best;
};

const cleanCell = (cell: string): string => cell.replace(/\s+/g, " ").trim();

/** Separa a matriz em cabeçalho + linhas de dados a partir da linha escolhida. */
export const splitAt = (
  matrix: SheetMatrix,
  headerIndex: number
): SheetData => {
  const headers = (matrix[headerIndex] ?? []).map(cleanCell);
  const rows = matrix
    .slice(headerIndex + 1)
    .filter((row) => row.some((cell) => cell.trim() !== ""));
  return { headers, rows };
};
