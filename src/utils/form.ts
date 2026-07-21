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

/**
 * Normaliza o campo "prazo de entrega (dias)" do FormBuilder.
 *
 * Vazio → `null` (o backend aplica o prazo padrão da fábrica). Número válido e
 * não-negativo → inteiro arredondado. Lixo → `null`.
 */
export const parseDeliveryDays = (raw: unknown): number | null => {
  const text = String(raw ?? "").trim();
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};
