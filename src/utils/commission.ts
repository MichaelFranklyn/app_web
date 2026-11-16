/**
 * A comissão que a tela pode mostrar a quem está logado.
 *
 * O servidor devolve `commissionAmount` (a da FÁBRICA) nulo para o vendedor —
 * regra do negócio: o vendedor nunca vê o percentual da fábrica, e o valor
 * dividido pelo pedido o entregaria. Ao lado vem `sellerCommissionAmount`, a
 * parte do vendedor. Gestor vê a da fábrica; vendedor, a dele.
 */
export interface CommissionPair {
  commissionAmount?: string | null;
  sellerCommissionAmount: string;
}

export const visibleCommission = (row: CommissionPair): string =>
  row.commissionAmount ?? row.sellerCommissionAmount;
