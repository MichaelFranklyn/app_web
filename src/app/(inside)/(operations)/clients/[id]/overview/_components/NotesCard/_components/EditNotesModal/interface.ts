import { ClientDetail, CompanyClientLink } from "../../../../../interface";

export interface EditNotesModalProps {
  companyClientId: string;
  companyClient: CompanyClientLink | null;
  currentNotes: string;
  onSuccess?: () => void;
  onUpdateOptimistic: (updates: Partial<ClientDetail>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export interface UpdateNotesInput {
  notes: string;
}
