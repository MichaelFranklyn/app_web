export interface DeleteOrderModalProps {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  orderId: string;
  /** Código curto exibido na lista (ex.: #A1B2C3). */
  orderCode: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export interface DeleteOrderResponse {
  deleteOrder: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}
