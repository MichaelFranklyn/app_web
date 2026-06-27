export interface DeleteProductUnitResponse {
  deleteProductUnit: {
    status: boolean;
    message: string;
  };
}

export interface DeleteUnitModalProps {
  unitId: string;
  unitLabel: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onDone: () => void;
}
