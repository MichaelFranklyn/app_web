/**
 * Faz o parse de um texto CSV em matriz de células, respeitando aspas, vírgulas
 * e quebras de linha escapadas. Aceita separador `,` ou `;` (detectado na primeira
 * linha não vazia). Ignora o BOM inicial e linhas totalmente vazias.
 */
export const parseCSV = (text: string): string[][] => {
  const clean = text.replace(/^﻿/, "");
  const delimiter = detectDelimiter(clean);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];

    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
};

const detectDelimiter = (text: string): string => {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim() !== "") ?? "";
  return firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
};

export const downloadCSV = (filename: string, rows: string[][]): void => {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
