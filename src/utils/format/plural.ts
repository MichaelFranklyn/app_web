/**
 * "1 pedido" / "3 pedidos": a contagem com a palavra no número certo.
 *
 * O "(s)" ("1 cliente(s)") e o plural fixo ("1 pedidos") eram o jeito de não
 * decidir; para quem lê, os dois parecem erro (crítica dos Relatórios,
 * 20/11/2026). O número sai no formato brasileiro (1.234).
 */
export const plural = (
  count: number,
  singular: string,
  pluralForm: string
): string =>
  `${count.toLocaleString("pt-BR")} ${count === 1 ? singular : pluralForm}`;

/**
 * Só a palavra no número certo, sem o número: para quando a contagem já está
 * escrita em outro lugar da frase ("3 itens **vão** para um novo pedido",
 * "ficaram de fora"). Mesma regra do `plural`: 1 é singular, o resto
 * (inclusive 0) é plural.
 */
export const pluralWord = (
  count: number,
  singular: string,
  pluralForm: string
): string => (count === 1 ? singular : pluralForm);
