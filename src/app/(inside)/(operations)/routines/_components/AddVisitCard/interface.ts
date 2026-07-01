import { VisitScheduleDay } from "../../interface";

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
  /** Dia já existente na rotina; null quando é uma folga (dia ainda não criado). */
  day: VisitScheduleDay | null;
  /** Data ISO do dia (necessária para criar o dia quando é folga). */
  date: string;
  /** VisitSchedule da semana (para criar o dia quando é folga). */
  scheduleId: string;
  /** Próximo dia útil da semana (para "agendar no dia seguinte"); null se folga. */
  nextDay: VisitScheduleDay | null;
  sellerId: string;
  maxVisitsPerDay: number;
  onDone: () => void;
}
