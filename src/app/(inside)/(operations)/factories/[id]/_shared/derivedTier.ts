import { formatPercentPoints } from "@/utils/format/percent";

/**
 * Nível calculado ("Diamante = Gold −10%"): os preços dele são gravados a
 * partir dos do base e refeitos pelo servidor — ninguém cria, edita ou remove
 * à mão. Lido pela aba de níveis, pela tabela de preço e pela ficha do produto.
 */
export interface DerivedTierFields {
  adjustmentPercent: string | null;
  baseTier: { id: string; name: string } | null;
}

/** "−10%" / "+5%" / "+12,5%": sinal sempre à mostra, que é o que o nome diz. */
export const signedPercent = (value: number): string =>
  `${value < 0 ? "−" : "+"}${formatPercentPoints(Math.abs(value), 2, { trimZeros: true })}`;

/** "Gold −10%"; null quando o nível tem preço próprio. */
export const describeDerived = (
  tier: DerivedTierFields | null | undefined
): string | null => {
  if (!tier?.baseTier || tier.adjustmentPercent == null) return null;
  return `${tier.baseTier.name} ${signedPercent(Number(tier.adjustmentPercent))}`;
};
