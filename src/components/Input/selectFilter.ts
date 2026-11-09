import { matchesSearchText } from "@/utils/search";

import type { SelectOption } from "./InputSelect";

/**
 * Texto que o filtro local do InputSelect enxerga: o rótulo mais o `searchText`
 * opcional da opção. O `searchText` existe para casar por dados que não cabem
 * no rótulo (ex.: razão social quando o rótulo mostra o nome fantasia).
 */
const optionHaystack = (option: SelectOption): string =>
  `${option.label} ${option.searchText ?? ""}`;

/**
 * Casa a opção com o termo digitado — texto e, a partir de 3 dígitos, só os
 * dígitos (documentos aparecem formatados e ninguém digita a pontuação).
 */
export const matchesSelectSearch = (
  option: SelectOption,
  term: string
): boolean => matchesSearchText(optionHaystack(option), term);
