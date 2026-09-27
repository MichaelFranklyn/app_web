/** Normaliza para comparação: sem acento, minúsculo, espaços colapsados. */
export const normalizeLabel = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const levenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

/** Semelhança entre dois textos, de 0 (nada a ver) a 1 (iguais). */
export const similarity = (a: string, b: string): number => {
  const na = normalizeLabel(a);
  const nb = normalizeLabel(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  return 1 - levenshtein(na, nb) / Math.max(na.length, nb.length);
};

/** Abaixo disto, "parecido" é chute: melhor deixar a pessoa escolher. */
export const MATCH_THRESHOLD = 0.7;

/** O texto existente mais parecido (>= 70%) ou null. */
export const suggestMatch = (
  value: string,
  options: string[]
): string | null => {
  let best: string | null = null;
  let bestScore = 0;
  for (const option of options) {
    const score = similarity(value, option);
    if (score > bestScore) {
      bestScore = score;
      best = option;
    }
  }
  return bestScore >= MATCH_THRESHOLD ? best : null;
};
