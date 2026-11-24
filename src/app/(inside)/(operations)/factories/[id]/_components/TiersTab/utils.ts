/**
 * Nível comercial como a aba o lê. Calculado = `baseTierId` + percentual
 * ("Diamante = Gold −10%"): os preços dele são gravados a partir dos do base e
 * refeitos pelo servidor; ninguém os edita à mão.
 */
export interface PriceTier {
  id: string;
  name: string;
  baseTierId: string | null;
  adjustmentPercent: string | null;
  baseTier: { id: string; name: string } | null;
}

export type PricingKind = "own" | "percent";
export type Direction = "down" | "up";

export interface TierFormValues {
  name: string;
  kind: PricingKind;
  baseTierId: string | null;
  direction: Direction;
  /** Sempre positivo na tela; o sinal vem de `direction`. */
  percent: string;
}

export type TierFormErrors = Partial<
  Record<"name" | "baseTierId" | "percent", string>
>;

export const EMPTY_TIER_FORM: TierFormValues = {
  name: "",
  kind: "own",
  baseTierId: null,
  direction: "down",
  percent: "",
};

const parsePercent = (raw: string): number =>
  Number(String(raw).trim().replace(",", "."));

export const tierToForm = (tier: PriceTier): TierFormValues => {
  if (!tier.baseTierId || tier.adjustmentPercent == null) {
    return { ...EMPTY_TIER_FORM, name: tier.name };
  }
  const pct = Number(tier.adjustmentPercent);
  return {
    name: tier.name,
    kind: "percent",
    baseTierId: tier.baseTierId,
    direction: pct < 0 ? "down" : "up",
    percent: String(Math.abs(pct)).replace(".", ","),
  };
};

/** Percentual com sinal, como o servidor guarda (−10 = 10% abaixo). */
export const signedAdjustment = (values: TierFormValues): number => {
  const pct = parsePercent(values.percent);
  return values.direction === "down" ? -pct : pct;
};

export const validateTierForm = (values: TierFormValues): TierFormErrors => {
  const errors: TierFormErrors = {};
  if (!values.name.trim()) errors.name = "Diga o nome do nível";
  if (values.kind !== "percent") return errors;
  if (!values.baseTierId) errors.baseTierId = "Escolha o nível de referência";
  const pct = parsePercent(values.percent);
  if (!values.percent.trim() || !Number.isFinite(pct) || pct <= 0) {
    errors.percent = "Diga o percentual (maior que zero)";
  } else if (values.direction === "down" && pct >= 100) {
    errors.percent = "O desconto tem que ser menor que 100%";
  } else if (pct >= 10000) {
    errors.percent = "Percentual alto demais";
  }
  return errors;
};

/** Níveis que podem servir de base: com preço próprio e diferentes do editado. */
export const baseTierOptions = (tiers: PriceTier[], selfId?: string) =>
  tiers
    .filter((t) => t.id !== selfId && !t.baseTierId)
    .map((t) => ({ value: t.id, label: t.name }));

/** Quem é calculado sobre este nível (ele não pode virar calculado). */
export const dependentsOf = (tiers: PriceTier[], tierId: string): string[] =>
  tiers.filter((t) => t.baseTierId === tierId).map((t) => t.name);

/** Preço de exemplo para a prévia: R$ 100 no base vira quanto aqui. */
export const examplePrice = (values: TierFormValues): number | null => {
  if (values.kind !== "percent" || validateTierForm(values).percent) {
    return null;
  }
  return Math.round(100 * (1 + signedAdjustment(values) / 100) * 100) / 100;
};

/** Campos de preço do input de criação (nome vai à parte). */
export const pricingCreateInput = (values: TierFormValues) =>
  values.kind === "percent"
    ? {
        baseTierId: values.baseTierId,
        adjustmentPercent: String(signedAdjustment(values)),
      }
    : {};

/**
 * Campos de preço do input de edição — só o que mudou. Voltar a preço próprio
 * manda `clearBaseTier` (os preços já gravados ficam e passam a ser editáveis).
 */
export const pricingUpdateInput = (
  values: TierFormValues,
  tier: PriceTier
): Record<string, unknown> => {
  if (values.kind === "own") {
    return tier.baseTierId ? { clearBaseTier: true } : {};
  }
  const adjustment = signedAdjustment(values);
  const unchanged =
    tier.baseTierId === values.baseTierId &&
    tier.adjustmentPercent != null &&
    Number(tier.adjustmentPercent) === adjustment;
  return unchanged
    ? {}
    : { baseTierId: values.baseTierId, adjustmentPercent: String(adjustment) };
};
