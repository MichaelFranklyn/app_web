export const priceKey = (productId: string, tierId: string) =>
  `${productId}:${tierId}`;

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
