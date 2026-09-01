import { RoutineCapacity, VisitScheduleDay } from "../../interface";

export interface ClientLinkNode {
  id: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

export interface SellerClientLinksQueryData {
  seller_client_links: {
    edges: { node: ClientLinkNode }[];
    totalCount: number;
  };
}

export interface CreateVisitItemResponse {
  createVisitScheduleItem?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

export interface CreateVisitDayResponse {
  createVisitScheduleDay?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

export interface AddVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dia já existente na rotina; null quando o dia ainda não tem rota. */
  day: VisitScheduleDay | null;
  /** Data ISO do dia (necessária para criá-lo quando ainda não existe). */
  date: string;
  /** VisitSchedule da semana (para criar o dia quando ainda não existe). */
  scheduleId: string;
  /** Próximo dia útil da semana (para "agendar no dia seguinte"); null se ele não tiver rota. */
  nextDay: VisitScheduleDay | null;
  sellerId: string;
  capacity: RoutineCapacity;
  onDone: () => void;
}
