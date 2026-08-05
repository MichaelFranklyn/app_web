/**
 * O pedido possível de um cliente, em linguagem de balcão.
 *
 * O motor de rotina passou a perguntar, antes de gastar um deslocamento, se a
 * reposição devida daquele cliente fecha o mínimo da fábrica
 * (`order_viability.py`). Sem isso, o cliente em ruptura que não fecha o mínimo
 * era o que a rotina MAIS recomendava: a ruptura subia a urgência, o vendedor
 * dirigia até lá e voltava sem pedido.
 *
 * Este util traduz o veredito em uma frase que o vendedor lê no card. A régua
 * de linguagem é a mesma do resto do sistema: dizer o que fazer, com números
 * concretos, sem vocabulário de modelo — "faltam R$ 400 para fechar o pedido
 * mínimo", nunca "ratio 0.8 / status quase".
 */

import { formatMoney } from "@/utils/format/masks";

export type ViabilityStatus = "fecha" | "quase" | "longe";

export interface ViabilitySuggestion {
  productId: string;
  productName: string | null;
  sku: string | null;
  quantity: string;
  value: string;
  /** Dias até acabar na loja. Negativo = já acabou. */
  daysUntilOut: number | null;
}

export interface Viability {
  status: ViabilityStatus;
  basketValue: string;
  minimumAmount: string;
  missingAmount: string;
  /** Dia em que a cesta deve cruzar o mínimo. Só existe em "longe". */
  readyOn: string | null;
  suggestions: ViabilitySuggestion[];
}

export type ViabilityTone = "green" | "amber" | "red";

export interface ViabilityNote {
  tone: ViabilityTone;
  /** Rótulo curto para o badge. */
  label: string;
  /** A frase completa para o card. */
  message: string;
  /** O que o vendedor faz com essa informação. Ausente quando não há ação. */
  action: string | null;
}

/** Data ISO ("2026-08-29") no formato curto brasileiro ("29/08"). */
const shortDate = (iso: string): string => {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
};

/**
 * A frase do card.
 *
 * "fecha" devolve `null` de propósito: quando o pedido fecha, o mínimo não é
 * informação — é o estado normal. Anunciá-lo em toda visita gastaria a atenção
 * do vendedor com o caso que não precisa de atenção, e ele pararia de ler o
 * aviso justamente nos casos em que ele importa.
 */
export const viabilityNote = (
  viability: Viability | null | undefined
): ViabilityNote | null => {
  if (!viability || viability.status === "fecha") return null;

  const missing = formatMoney(viability.missingAmount);
  const minimum = formatMoney(viability.minimumAmount);

  if (viability.status === "quase") {
    return {
      tone: "amber",
      label: "Falta pouco",
      message: `A reposição soma ${formatMoney(
        viability.basketValue
      )} e o mínimo da fábrica é ${minimum}. Faltam ${missing}.`,
      action: viability.suggestions.length
        ? "Leve estes produtos para fechar o pedido:"
        : "Vale conversar sobre o que mais dá para incluir.",
    };
  }

  // "longe": a viagem não se paga hoje. A data de virada é o que transforma
  // "não vá" em "vá no dia 22" — sem ela o vendedor só ouviria um "não".
  return {
    tone: "red",
    label: "Não fecha o mínimo",
    message: `A reposição soma ${formatMoney(
      viability.basketValue
    )}, longe do mínimo de ${minimum}. Faltam ${missing}.`,
    action: viability.readyOn
      ? `Pela previsão de consumo, fecha por volta de ${shortDate(
          viability.readyOn
        )} — melhor ligar agora e visitar lá.`
      : "Sozinho ele não alcança o mínimo: vale juntar outra fábrica ou negociar o piso.",
  };
};

/** "acaba em 6 dias" / "acabou há 2 dias" / "acaba hoje". */
export const stockTiming = (daysUntilOut: number | null): string | null => {
  if (daysUntilOut == null) return null;
  if (daysUntilOut === 0) return "acaba hoje";
  if (daysUntilOut > 0) return `acaba em ${daysUntilOut} dias`;
  const gone = Math.abs(daysUntilOut);
  return gone === 1 ? "acabou ontem" : `acabou há ${gone} dias`;
};
