import type { ClientDetail } from "../../../interface";

// Use parent type directly
type CurrentAddress = ClientDetail | null;

export interface AddressCardProps {
  clientId: string;
  address: string;
  currentAddress?: CurrentAddress;
  onUpdateOptimistic: (updates: Partial<ClientDetail>) => void;
  onCommit: () => void;
  onRollback: () => void;
}
