export interface CreateProductUnitResponse {
  createProductUnit: {
    status: boolean;
    message: string;
  };
}

export interface AddUnitModalProps {
  onAddOptimistic: (unit: {
    id: string;
    label: string;
    isActive: boolean;
  }) => void;
  onDone: () => void;
}
