export interface DeleteProductUnitLabelResponse {
  deleteProductUnitLabel: {
    status: boolean;
    message: string;
  };
}

export interface DeleteLabelModalProps {
  labelId: string;
  labelText: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}
