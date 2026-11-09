const digits = (value: string): string => value.replace(/\D+/g, "");

/** Menos dígitos que isso não vira busca por documento: "1" casaria com tudo. */
const MIN_DIGITS_FOR_DOCUMENT = 3;

/**
 * Casa um texto com o termo digitado pelo usuário.
 *
 * Além do `includes` sem diferenciar maiúsculas, compara só os dígitos quando
 * o termo é um número: documentos (CNPJ, CPF) aparecem formatados na tela e
 * ficam guardados sem pontuação — tanto faz digitar com ou sem a máscara.
 */
export const matchesSearchText = (haystack: string, term: string): boolean => {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  const text = haystack.toLowerCase();
  if (text.includes(needle)) return true;

  const needleDigits = digits(needle);
  if (needleDigits.length < MIN_DIGITS_FOR_DOCUMENT) return false;
  return digits(text).includes(needleDigits);
};
