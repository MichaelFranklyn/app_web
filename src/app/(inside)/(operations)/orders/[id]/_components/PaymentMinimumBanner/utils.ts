import { PaymentTermRef } from "../../interface";

/**
 * Nomes das condições de pagamento cujo piso este total já alcança, do maior
 * piso para o menor.
 *
 * Maior primeiro porque é a sugestão mais próxima do que o vendedor queria:
 * quem pediu 30/60/90 prefere 30/60 a "À vista". Espelha o `reachable_terms`
 * do backend, que monta a mensagem de bloqueio com a mesma ordem.
 */
export function reachableTermNames(
  total: number,
  terms: PaymentTermRef[]
): string[] {
  return terms
    .filter((term) => !term.minOrderAmount || total >= term.minOrderAmount)
    .sort((a, b) => (b.minOrderAmount ?? 0) - (a.minOrderAmount ?? 0))
    .map((term) => term.name);
}
