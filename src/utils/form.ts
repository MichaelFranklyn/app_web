/**
 * Extrai o valor de um campo do FormBuilder.
 *
 * Selects retornam `{ label, value }`; demais campos retornam o valor direto.
 * Normaliza ambos para `string`.
 */
export const extractSelectValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: unknown }).value)
    : String(raw ?? "");
