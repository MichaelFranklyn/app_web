/**
 * Piso de frete grátis da modalidade escolhida no pedido.
 *
 * Nulo quando a fábrica não oferece naquela modalidade — ou quando o vendedor
 * ainda não escolheu o frete, caso em que não há alvo a perseguir.
 */
export interface FreeFreightTarget {
  /** "CIF" | "FOB" — entra na mensagem, porque o piso é desta modalidade. */
  freightType: string;
  amount: number;
}
