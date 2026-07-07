export interface LinkFactoryModalProps {
  clientId: string;
  onSuccess?: () => void;
  /** Abre o modal automaticamente (fluxo pós-criação do cliente). */
  autoOpen?: boolean;
}

export interface LinkFactoryInput {
  clientId: string;
  sellerId: string;
  factoryId: string;
  priceTierId: string;
  priority?: string;
  visitFrequencyDays?: number;
}
