import type { SelectOption } from "./InputSelect";

/**
 * Texto que o filtro local do InputSelect enxerga: o rótulo mais o `searchText`
 * opcional da opção. O `searchText` existe para casar por dados que não cabem
 * no rótulo (ex.: razão social quando o rótulo mostra o nome fantasia).
 */
const optionHaystack = (option: SelectOption): string =>
  `${option.label} ${option.searchText ?? ""}`.toLowerCase();

const digits = (value: string): string => value.replace(/\D+/g, "");

/**
 * Casa a opção com o termo digitado.
 *
 * Além do `includes` no texto, compara só os dígitos quando o usuário digita um
 * número: documentos aparecem formatados na tela (00.000.000/0000-00) e ninguém
 * digita a pontuação ao procurar. O piso de 3 dígitos evita que "1" case com
 * qualquer opção que tenha algum número.
 */
export const matchesSelectSearch = (
  option: SelectOption,
  term: string
): boolean => {
  const haystack = optionHaystack(option);
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  if (haystack.includes(needle)) return true;

  const needleDigits = digits(needle);
  if (needleDigits.length < 3) return false;
  return digits(haystack).includes(needleDigits);
};
