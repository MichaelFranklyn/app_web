export interface DeleteSellerAccessModalProps {
  accessId: string;
  sellerName: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export interface DeleteAccessResponse {
  deleteSellerFactoryAccess: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}
