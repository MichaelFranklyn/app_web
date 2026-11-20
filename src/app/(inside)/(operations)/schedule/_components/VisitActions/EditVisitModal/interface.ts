import { VisitScheduleItem } from "../../../interface";

export interface UpdateVisitScheduleItemResponse {
  updateVisitScheduleItem?: {
    status: boolean;
    message: string;
  };
}

export interface EditVisitModalProps {
  item: VisitScheduleItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
  /** Chamado quando a visita passa a CONCLUÍDA aqui (para oferecer pedido/estoque). */
  onCompleted?: () => void;
}
