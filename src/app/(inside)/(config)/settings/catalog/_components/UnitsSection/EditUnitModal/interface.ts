export interface UpdateProductUnitResponse {
  updateProductUnit: {
    status: boolean;
    message: string;
  };
}

export interface EditUnitModalProps {
  unit: { id: string; label: string };
  onUpdateOptimistic: (id: string, updates: { label: string }) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}
