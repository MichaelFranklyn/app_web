export interface CreateProductUnitLabelResponse {
  createProductUnitLabel: {
    status: boolean;
    message: string;
  };
}

export interface AddLabelModalProps {
  onAddOptimistic: (label: {
    id: string;
    label: string;
    isActive: boolean;
  }) => void;
  onDone: () => void;
}
