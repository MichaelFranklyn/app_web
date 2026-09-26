import type {
  VisitContactType,
  VisitOutcome,
  VisitStatus,
} from "@/utils/visit";

export interface VisitResponseStop {
  id: string;
  /** Dia da parada — separa as paradas na folha da semana. */
  date: string;
  plannedOrder: number;
  contactType: VisitContactType;
  clientName: string;
  clientAlias: string | null;
  clientCity: string | null;
  clientState: string | null;
  factoryNames: string[];
  status: VisitStatus;
  outcome: VisitOutcome | null;
  notes: string | null;
  /** Já existe pedido amarrado a esta visita — a caixa abre marcada. */
  hasLinkedOrder: boolean;
}

export interface VisitResponseForm {
  /** O dia do link; na folha da semana, a segunda-feira. */
  date: string;
  /** Domingo da semana; nulo no link de um dia. */
  endDate: string | null;
  /** Folha da semana: só os dias que já chegaram, agrupados por data. */
  isWeek: boolean;
  sellerName: string;
  companyName: string;
  companyLogoUrl: string | null;
  submittedAt: string | null;
  stops: VisitResponseStop[];
}

export interface VisitResponseFormData {
  visitResponseForm: {
    status: boolean;
    message: string;
    data: VisitResponseForm | null;
  } | null;
}
