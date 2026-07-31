import { FilterField } from "./interface";

/** Chaves que um campo ocupa em `values` (o período ocupa duas). */
export const fieldKeys = (field: FilterField): string[] =>
  field.type === "date-range" ? [field.key, field.toKey] : [field.key];

/** Campos que o usuário realmente vê (os escondidos não contam para nada). */
export const visibleFields = (fields: FilterField[]): FilterField[] =>
  fields.filter((field) => !field.hidden);

/**
 * Quantos filtros estão valendo agora — o número no botão.
 *
 * Conta CAMPOS, não chaves: um período preenchido só de um lado ("a partir
 * de 01/07") é um filtro, não dois. É esse número que o usuário compara com o
 * que vê no painel.
 */
export const activeFilterCount = (
  fields: FilterField[],
  values: Record<string, string>
): number =>
  visibleFields(fields).filter((field) =>
    fieldKeys(field).some((key) => Boolean(values[key]))
  ).length;
