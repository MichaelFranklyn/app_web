export interface UpdateAccessResponse {
  updateSellerFactoryAccess: {
    status: boolean;
    message: string;
    data: { id: string; isActive: boolean } | null;
  };
}

export interface EditSellerAccessModalProps {
  accessId: string;
  sellerName: string;
  isActive: boolean;
  sellerIsActive: boolean;
  onUpdateOptimistic: (id: string, updates: { isActive: boolean }) => void;
  onCommit: () => void;
  onRollback: () => void;
}
