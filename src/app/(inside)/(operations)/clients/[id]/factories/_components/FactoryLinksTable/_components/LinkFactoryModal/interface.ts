export interface LinkFactoryModalProps {
  clientId: string;
  onSuccess?: () => void;
}

export interface LinkFactoryInput {
  clientId: string;
  sellerId: string;
  factoryId: string;
  priceTierId: string;
  priority?: string;
  visitFrequencyDays?: number;
}
