import type {
  VisitContactType,
  VisitOutcome,
  VisitStatus,
} from "@/utils/visit";

export interface VisitResponseStop {
  id: string;
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
  date: string;
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
