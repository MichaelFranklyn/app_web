/**
 * O cálculo de preço reconhece o IPI por este nome (no back, `IPI_RULE_NAME`)
 * para somá-lo à base da ST — por isso a regra "IPI" não se renomeia.
 */
export const IPI_RULE_NAME = "IPI";

/** "Nenhum produto", "1 produto", "12 produtos". */
export function formatProductCount(count: number): string {
  if (count === 0) return "Nenhum produto";
  return `${count.toLocaleString("pt-BR")} ${count === 1 ? "produto" : "produtos"}`;
}
