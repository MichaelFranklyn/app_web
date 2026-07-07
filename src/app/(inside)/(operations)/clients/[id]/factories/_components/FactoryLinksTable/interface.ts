import { SellerClientFactory } from "../../../interface";

export interface FactoryLinksTableProps {
  clientId: string;
  connections: SellerClientFactory[];
  onChanged: () => void;
  /** Abre o modal de vínculo automaticamente (fluxo pós-criação do cliente). */
  autoOpenLink?: boolean;
  onUpdateOptimistic: (
    id: string,
    updates: Partial<SellerClientFactory>
  ) => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}
