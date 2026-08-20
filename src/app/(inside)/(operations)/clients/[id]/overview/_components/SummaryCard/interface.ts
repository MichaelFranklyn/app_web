export interface SummaryCardProps {
  lastVisitDate: string;
  /**
   * A data da última visita chega depois do resto: ela sai de uma consulta
   * pesada (os vínculos com as fábricas) que não segura mais a aba inteira.
   */
  lastVisitLoading?: boolean;
  cnae: string;
  cnaeDescription: string | null;
  /** Rede a que a loja pertence; nulo para o cliente independente. */
  networkName: string | null;
  /** Ramo de atividade escolhido pela empresa (≠ CNAE, que vem da Receita). */
  segmentName: string | null;
}
