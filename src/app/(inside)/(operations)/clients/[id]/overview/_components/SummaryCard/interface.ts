export interface SummaryCardProps {
  lastVisitDate: string;
  cnae: string;
  cnaeDescription: string | null;
  /** Rede a que a loja pertence; nulo para o cliente independente. */
  networkName: string | null;
  /** Ramo de atividade escolhido pela empresa (≠ CNAE, que vem da Receita). */
  segmentName: string | null;
}
