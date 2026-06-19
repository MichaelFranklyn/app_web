import { SellerClientFactory } from "../../../interface";

export interface FactoryLinksTableProps {
  clientId: string;
  connections: SellerClientFactory[];
  onChanged: () => void;
  onUpdateOptimistic: (
    id: string,
    updates: Partial<SellerClientFactory>
  ) => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}
