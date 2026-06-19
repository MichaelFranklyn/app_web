import { ClientData } from "../../../../interface";
import { ClientDetail } from "../../../../../interface";

export interface EditAddressModalProps {
  clientId: string;
  currentAddress?: ClientData | null;
  onSuccess?: () => void;
  onUpdateOptimistic: (updates: Partial<ClientDetail>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export interface UpdateAddressInput {
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}
