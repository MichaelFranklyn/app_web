/** Conectivos que não viram inicial ("Maria das Dores" → "MD", não "MD" de "das"). */
const CONNECTORS = new Set(["de", "da", "do", "das", "dos", "e"]);

/**
 * Iniciais de PESSOA para avatar: primeira letra do primeiro e do último nome.
 *
 * O padrão espalhado era `name.slice(0, 2).toUpperCase()`, que dava "JO" para
 * "João Sacramento" — duas letras do mesmo nome, que não é como ninguém
 * abrevia gente (crítica de 23/11/2026). Para empresa, ver `companyInitials`.
 */
export const personInitials = (name?: string | null): string => {
  const words = (name ?? "")
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word))
    .filter((word) => !CONNECTORS.has(word.toLowerCase()));
  if (words.length === 0) return "";
  const initial = (word: string) =>
    word.match(/\p{L}/u)?.[0].toUpperCase() ?? "";
  const first = initial(words[0]);
  return words.length === 1 ? first : first + initial(words[words.length - 1]);
};
