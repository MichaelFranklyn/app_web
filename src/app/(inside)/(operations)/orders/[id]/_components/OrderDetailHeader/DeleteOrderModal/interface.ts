export interface DeleteOrderResponse {
  deleteOrder: {
    status: boolean;
    code: number;
    message: string;
  };
}

export interface DeleteOrderModalProps {
  orderId: string;
  /** Aberto de fora (menu "Mais ações"): sem `open`, desenha o próprio botão. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
