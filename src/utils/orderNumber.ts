/**
 * Como o pedido se chama para quem usa o sistema.
 *
 * O número (`Order.number`) é sequencial por empresa — "#128" se dita por
 * telefone, se lembra e se acha na busca. O código antigo (8 primeiros
 * caracteres do UUID, "A3F9C2E1") continua existindo como DETALHE: aparece no
 * cabeçalho do pedido para quem precisa casar com algo emitido antes da troca.
 */

/** "#128". */
export const formatOrderNumber = (number: number): string => `#${number}`;

/** "A3F9C2E1": o código técnico, derivado do id. */
export const orderShortCode = (id: string): string =>
  id.slice(0, 8).toUpperCase();
