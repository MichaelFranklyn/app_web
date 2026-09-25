/**
 * Endereço da página de novo pedido (`/orders/new`) e o que ela já recebe
 * decidido. A página lê estes mesmos nomes (`orders/new/utils.ts`), por isso o
 * contrato mora num lugar só.
 */
export type NewOrderFrom =
  | { clientId: string }
  | { factoryId: string }
  | {
      /** Visita de onde o pedido saiu — amarra o pedido à ida que o gerou. */
      visitItemId: string;
      sellerId: string;
      clientId: string;
      factoryId: string;
    };

/**
 * @param from o que vem decidido; sem nada, é o pedido aberto da lista.
 * @param back tela para onde "Cancelar" volta (a de quem abriu).
 */
export const newOrderUrl = (from?: NewOrderFrom, back?: string): string => {
  const params = new URLSearchParams(from);
  if (params.size === 0) return "/orders/new";
  if (back) params.set("from", back);
  return `/orders/new?${params.toString()}`;
};
