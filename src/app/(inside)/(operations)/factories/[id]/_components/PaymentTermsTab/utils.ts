import { FormFieldSchema } from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import { plural } from "@/utils/format/plural";
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
  return plural(n, "parcela", "parcelas");
}

/** Valor da opção "Todos os níveis": o prazo não pertence a nenhum nível. */
export const ALL_TIERS = "all";

export type TierOption = SelectOption;

/**
 * Opções do campo "Nível dos clientes": "Todos os níveis" primeiro (o caso
 * comum, e o que todo prazo antigo é), depois os níveis da fábrica.
 */
export function tierFieldOptions(tiers: TierOption[]): TierOption[] {
  return [{ value: ALL_TIERS, label: "Todos os níveis" }, ...tiers];
}

/** A opção que o campo mostra para o nível gravado no prazo. */
export function tierFieldValue(
  tierId: string | null,
  tiers: TierOption[]
): TierOption {
  return (
    tierFieldOptions(tiers).find((o) => o.value === (tierId ?? ALL_TIERS)) ??
    tierFieldOptions(tiers)[0]
  );
}

/** O que o campo escolhido grava: id do nível, ou null para "todos". */
export function tierIdFromField(
  value: string | null | undefined
): string | null {
  return value && value !== ALL_TIERS ? value : null;
}

/** Nome do nível na coluna da tabela; sem nível, "Todos". */
export function tierLabel(tierId: string | null, tiers: TierOption[]): string {
  if (!tierId) return "Todos";
  return tiers.find((t) => t.value === tierId)?.label ?? "—";
}

/**
 * Campo "Nível dos clientes" dos modais de prazo — ou nada, quando a fábrica
 * tem um nível só (a aba manda a lista vazia nesse caso).
 */
export function tierFormFields(tiers: TierOption[]): FormFieldSchema[] {
  if (tiers.length === 0) return [];
  return [
    {
      name: "priceTierId",
      type: "select-single",
      label: "Nível dos clientes",
      placeholder: "Selecione o nível",
      options: tierFieldOptions(tiers),
      hint: "Nos pedidos de clientes deste nível, este prazo vem sugerido. O vendedor ainda pode trocar.",
    },
  ];
}
