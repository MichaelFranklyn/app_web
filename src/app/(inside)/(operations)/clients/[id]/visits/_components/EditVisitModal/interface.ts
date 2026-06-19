export interface VisitEditable {
  id: string;
  status: string;
  outcome: string | null;
  outcomeReason: string | null;
  stockObservation: string | null;
  notes: string | null;
}

export interface UpdateVisitInput {
  status?: string;
  outcome?: string | null;
  outcomeReason?: string | null;
  stockObservation?: string | null;
  notes?: string | null;
}

export interface UpdateVisitResponse {
  updateVisitScheduleItem: {
    status: boolean;
    message: string;
    data: VisitEditable | null;
  };
}

export interface EditVisitModalProps {
  visit: VisitEditable;
  onUpdateOptimistic: (id: string, updates: Partial<VisitEditable>) => void;
  onCommit: () => void;
  onRollback: () => void;
}
