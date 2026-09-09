/**
 * De quem é a baixa em período, e o que ela deixa de fora.
 *
 * Mora aqui, e não dentro do componente, porque é a regra que impede o erro que
 * já aconteceu em produção: o gestor que também vende abre a tela na ótica do
 * vendedor, o seletor cai no próprio perfil por padrão, e a prévia dizia apenas
 * "99 boleto(s) em aberto vencem neste período". A baixa saiu de uma carteira
 * só — 674 boletos das outras três continuaram vencidos, e o cartão de insights
 * que os mostrava parecia errado.
 */

/** Rótulo do recorte, para entrar no meio da frase da prévia. */
export const settleScopeLabel = (
  sellerId: string | null,
  sellerName: string | null
): string =>
  sellerId ? `de ${sellerName ?? "este vendedor"}` : "de todos os vendedores";

/**
 * Quantos boletos do período ficam de fora por causa do recorte de vendedor.
 *
 * Sem recorte não há o que ficar de fora. A prévia geral pode não ter chegado
 * ainda (`undefined`) — nesse caso não se afirma nada, em vez de acusar um
 * número negativo ou um zero que parece resposta.
 */
export const outOfScopeCount = (
  scopedCount: number,
  allCount: number | undefined,
  sellerId: string | null
): number =>
  sellerId && allCount !== undefined ? Math.max(0, allCount - scopedCount) : 0;
