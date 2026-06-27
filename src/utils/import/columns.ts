/** Escolha de origem de um campo: nenhuma, uma coluna da planilha, ou valor fixo. */
export type ColumnChoice =
  | { kind: "none" }
  | { kind: "column"; index: number }
  | { kind: "fixed"; value: string };

export const valueForChoice = (
  choice: ColumnChoice | undefined,
  cells: string[]
): string => {
  if (!choice) return "";
  if (choice.kind === "fixed") return choice.value;
  if (choice.kind === "column") return String(cells[choice.index] ?? "");
  return "";
};

/** Valores distintos (não vazios) de um campo, conforme a escolha de coluna/valor fixo. */
export const distinctValues = (
  rows: string[][],
  choice: ColumnChoice | undefined
): string[] => {
  if (!choice) return [];
  if (choice.kind === "fixed") {
    const value = choice.value.trim();
    return value ? [value] : [];
  }
  if (choice.kind === "column") {
    const set = new Set<string>();
    for (const row of rows) {
      const value = String(row[choice.index] ?? "").trim();
      if (value) set.add(value);
    }
    return [...set];
  }
  return [];
};

/** Parse de número aceitando vírgula/ponto e símbolos (ex.: " R$ 1.41 " → 1.41). */
export const parseNumber = (value: string): number => {
  const cleaned = value.replace(/[^0-9.,-]/g, "").trim();
  if (!cleaned) return NaN;
  // Última vírgula/ponto é o separador decimal; o resto é milhar.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : ".";
  const normalized = cleaned
    .replace(new RegExp(`\\${decimalSep === "," ? "." : ","}`, "g"), "")
    .replace(decimalSep, ".");
  return Number(normalized);
};
