import { SheetMatrix } from "./reader";

/**
 * Baixa uma matriz de células como planilha Excel (.xlsx).
 *
 * As planilhas MODELO saem em xlsx, não em CSV: é o formato que o usuário já
 * abre no Excel sem diálogo de importação, sem separador para escolher e sem
 * perder acento — e é o mesmo formato que a fábrica manda. O SheetJS é
 * carregado sob demanda (import dinâmico), como na leitura.
 *
 * A primeira linha é tratada como cabeçalho para dimensionar as colunas: sem
 * isso o Excel abre tudo com largura padrão e o cabeçalho aparece cortado.
 */
export const downloadSheet = async (
  filename: string,
  rows: SheetMatrix,
  sheetName = "Modelo"
): Promise<void> => {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet["!cols"] = columnWidths(rows);

  const workbook = XLSX.utils.book_new();
  // O Excel recusa nome de aba com mais de 31 caracteres.
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
};

/** Largura de cada coluna pelo maior conteúdo, com folga e teto. */
const columnWidths = (rows: SheetMatrix) => {
  const count = Math.max(...rows.map((row) => row.length), 0);
  return Array.from({ length: count }, (_, index) => {
    const longest = rows.reduce(
      (max, row) => Math.max(max, String(row[index] ?? "").length),
      0
    );
    return { wch: Math.min(Math.max(longest + 2, 10), 45) };
  });
};
