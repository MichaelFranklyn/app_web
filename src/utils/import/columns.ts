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
  // Grupos de dígitos (com seus separadores de milhar/decimal) no texto. Símbolo
  // nas bordas ("R$", "%") não conta. DOIS grupos separados por texto no meio —
  // "1 c/100 pçs" (1 caixa c/ 100 peças) — são ambíguos: concatenar daria 1100.
  // Devolve NaN para o chamador tratar como ausente (múltiplo assumido/revisão)
  // em vez de gravar um valor errado silenciosamente.
  const groups = value.match(/-?\d[\d.,]*/g);
  if (!groups || groups.length !== 1) return NaN;
  const cleaned = groups[0];
  // Última vírgula/ponto é o separador decimal; o resto é milhar.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalSep = lastComma > lastDot ? "," : ".";
  const normalized = cleaned
    .replace(new RegExp(`\\${decimalSep === "," ? "." : ","}`, "g"), "")
    .replace(decimalSep, ".");
  return Number(normalized);
};

/**
 * Primeiros valores distintos (não vazios) de uma coluna — a amostra que aparece
 * ao lado do seletor para a pessoa reconhecer a coluna pelo conteúdo, não só
 * pelo cabeçalho. Valor fixo não tem amostra (já está escrito na tela).
 */
export const sampleValues = (
  rows: string[][],
  choice: ColumnChoice | undefined,
  limit = 3
): string[] => {
  if (!choice || choice.kind !== "column") return [];
  const seen = new Set<string>();
  for (const row of rows) {
    const value = String(row[choice.index] ?? "").trim();
    if (value) seen.add(value);
    if (seen.size >= limit) break;
  }
  return [...seen];
};
