export const priceKey = (productId: string, tierId: string) =>
  `${productId}:${tierId}`;

/**
 * Nome da regra de imposto do IPI. É o mesmo nome usado pelo import de tabela
 * de preço ao gravar a alíquota no produto (`IPI_RULE_NAME` do backend).
 */
export const IPI_RULE_NAME = "IPI";

/**
 * Escolhe o nível comercial de um item recém-selecionado, para que o preço seja
 * sugerido sem o vendedor precisar mexer no nível a cada item.
 *
 * Na ordem: o nível que já está em uso (herdado do item anterior do pedido), o
 * nível acordado no vínculo do cliente com a fábrica, ou — se o produto só tem
 * preço em um nível — esse. Os dois primeiros só valem se tiverem preço para
 * ESTE produto; senão cairia num nível que deixa o preço vazio de novo.
 *
 * Devolve "" quando nada se aplica: o vendedor escolhe o nível na mão.
 */
export const resolveTierForProduct = (
  currentTierId: string,
  linkedTierId: string | null,
  pricedTierIds: string[]
): string => {
  if (currentTierId && pricedTierIds.includes(currentTierId))
    return currentTierId;
  if (linkedTierId && pricedTierIds.includes(linkedTierId)) return linkedTierId;
  if (pricedTierIds.length === 1) return pricedTierIds[0];
  return currentTierId || linkedTierId || "";
};

/**
 * A quantidade respeita o múltiplo de venda? Tolerante a ponto flutuante:
 * múltiplos podem ser fracionários (ex.: 25,5 kg por saco).
 */
export const isQuantityMultiple = (
  quantity: number,
  multiple: number
): boolean => {
  if (!multiple || multiple <= 0) return true;
  const ratio = quantity / multiple;
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
};
