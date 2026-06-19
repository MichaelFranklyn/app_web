import { ClientDetail, CompanyClientLink } from "../../../interface";

export interface NotesCardProps {
  companyClientId: string;
  companyClient: CompanyClientLink | null;
  notes: string;
  onUpdated?: () => void;
  onUpdateOptimistic: (updates: Partial<ClientDetail>) => void;
  onCommit: () => void;
  onRollback: () => void;
}
