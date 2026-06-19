export interface UpdateAccessModalProps {
  id: string;
  sellerName: string;
  factoryName: string;
  isActive: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRevoke: () => void;
  onCommit: () => void;
  onRollback: () => void;
}

export interface UpdateResponse {
  updateSellerFactoryAccess: {
    status: boolean;
    message: string;
  };
}
