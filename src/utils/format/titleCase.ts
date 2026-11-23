/**
 * Nome em CAIXA ALTA (como vem da Receita e das planilhas de fábrica) em Title
 * Case para a tela: "MERCADO SÃO JOSÉ LTDA" → "Mercado São José Ltda".
 *
 * Só mexe no que está TODO em maiúsculas: um nome em caixa mista foi digitado
 * assim por alguém e é respeitado. Preposições ficam em minúsculas ("Casa DE
 * CARNES" não, "Casa de Carnes" sim), e as siglas societárias continuam
 * siglas (S/A, ME, EPP).
 */
const LOWERCASE_WORDS = new Set([
  "da",
  "das",
  "de",
  "di",
  "do",
  "dos",
  "du",
  "e",
]);
const KEEP_UPPERCASE = new Set([
  "S/A",
  "S.A.",
  "SA",
  "ME",
  "EPP",
  "EIRELI",
  "MEI",
  "LTDA-ME",
]);

const capitalize = (word: string): string =>
  word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);

export const toTitleCase = (text: string): string => {
  const hasLetters = /\p{L}/u.test(text);
  if (!hasLetters || text !== text.toLocaleUpperCase("pt-BR")) return text;
  return text
    .split(/(\s+)/)
    .map((token, index) => {
      if (/^\s+$/.test(token) || token === "") return token;
      if (KEEP_UPPERCASE.has(token)) return token;
      const lower = token.toLocaleLowerCase("pt-BR");
      if (index > 0 && LOWERCASE_WORDS.has(lower)) return lower;
      // "AUTO-PEÇAS" → "Auto-Peças"
      return lower.split("-").map(capitalize).join("-");
    })
    .join("");
};
