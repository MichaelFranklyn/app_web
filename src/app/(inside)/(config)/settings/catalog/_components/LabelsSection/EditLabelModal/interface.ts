export interface UpdateProductUnitLabelResponse {
  updateProductUnitLabel: {
    status: boolean;
    message: string;
  };
}

export interface EditLabelModalProps {
  label: { id: string; label: string };
  onUpdateOptimistic: (id: string, updates: { label: string }) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}
