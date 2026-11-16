export interface VisitEditable {
  id: string;
  status: string;
  outcome: string | null;
  outcomeReason: string | null;
  notes: string | null;
}

export interface UpdateVisitInput {
  status?: string;
  outcome?: string | null;
  outcomeReason?: string | null;
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
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  visit: VisitEditable;
  onUpdateOptimistic: (id: string, updates: Partial<VisitEditable>) => void;
  onCommit: () => void;
  onRollback: () => void;
}
