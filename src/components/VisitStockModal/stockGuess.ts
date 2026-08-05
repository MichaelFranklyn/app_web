/**
 * O que o sistema estima hoje sobre o estoque de um produto, em linguagem de
 * balcão.
 *
 * Existe separado da linha porque é a decisão de produto que sustenta a Fase E:
 * confirmar ou corrigir um número é muito mais rápido que produzir um do zero.
 * Mostrar o palpite antes da pergunta é a diferença entre o cliente responder e
 * dar de ombros — e é isso que ataca os ~15% de respostas úteis relatados em
 * campo.
 */

export interface StockGuessInput {
  daysSinceStockout: number | null;
  signalConfidence: string | null;
}

/**
 * `null` quando não há palpite a mostrar.
 *
 * Dois casos, por razões opostas: sem `daysSinceStockout` não existe estimativa
 * (produto que o cliente nunca comprou), e com o estoque `confirmado` não há o
 * que decidir — repetir "confirmado há 2 dias" viraria ruído justamente onde a
 * pergunta não precisa ser feita.
 */
export const stockGuessLabel = ({
  daysSinceStockout,
  signalConfidence,
}: StockGuessInput): string | null => {
  if (daysSinceStockout == null) return null;
  if (signalConfidence === "confirmado") return null;

  const suffix =
    signalConfidence === "historico" ? "pelo histórico" : "estimativa fraca";

  if (daysSinceStockout > 0) {
    return `deve ter acabado há ${daysSinceStockout} dias · ${suffix}`;
  }
  if (daysSinceStockout === 0) return `deve acabar hoje · ${suffix}`;
  return `deve durar mais ${Math.abs(daysSinceStockout)} dias · ${suffix}`;
};
