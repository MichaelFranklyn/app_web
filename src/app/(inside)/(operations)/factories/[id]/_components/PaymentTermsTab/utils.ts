/**
 * Converte o texto livre digitado (ex.: "30/60/90", "30, 60, 90", "à vista")
 * na lista ordenada de offsets em dias. Aceita qualquer separador não-numérico;
 * remove duplicados e ordena. "0" (ou vazio interpretado como à vista) → [0].
 */
export function parseInstallments(raw: string): number[] {
  const nums = (raw.match(/\d+/g) ?? []).map(Number).filter((n) => n >= 0);
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

/** Rótulo compacto das parcelas: [30,60,90] → "30/60/90"; [0] → "À vista". */
export function formatInstallments(days: number[]): string {
  if (!days.length) return "—";
  if (days.length === 1 && days[0] === 0) return "À vista";
  return days.join("/");
}

/** "3 parcelas" / "1 parcela" a partir da quantidade de offsets. */
export function installmentsCountLabel(days: number[]): string {
  const n = days.length;
  return `${n} parcela${n === 1 ? "" : "s"}`;
}
