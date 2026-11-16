import type { VisitContactType } from "@/utils/visit";

export type PlanStopSkipReason =
  | "NOT_IN_WALLET"
  | "ALREADY_SCHEDULED"
  | "DUPLICATE";

export interface PlannedStop {
  clientId: string;
  name: string;
  cityLabel: string;
  neighborhood: string | null;
  contactType: VisitContactType;
  isNew: boolean;
  isSuggested: boolean;
  /** A parada é da rotina de OUTRO escritório da mesma pessoa (só leitura). */
  officeName: string | null;
  /** O mesmo cliente também está pendente, neste dia, no outro escritório. */
  alsoInOffice: string | null;
}

export interface PlannedDay {
  date: string;
  visitCount: number;
  callCount: number;
  estimatedKm: number | null;
  stops: PlannedStop[];
}

export interface SkippedStop {
  clientId: string;
  name: string;
  reason: PlanStopSkipReason;
  date: string | null;
}

/** Uma visita alinhada no mesmo dia com outro escritório da pessoa. */
export interface AlignedStop {
  clientId: string;
  name: string;
  officeName: string;
  /** Nulo quando a parada daqui não tinha dia e foi para o do outro escritório. */
  fromDate: string | null;
  toDate: string;
  /** Quem muda de dia é a visita do OUTRO escritório. */
  movesOtherOffice: boolean;
}

export interface WeekPlan {
  weekStart: string;
  added: number;
  ignoredDays: string[];
  days: PlannedDay[];
  skipped: SkippedStop[];
  aligned: AlignedStop[];
}

export interface PlanWeekResponse {
  planWeek: {
    status: boolean;
    message: string;
    data: WeekPlan | null;
  };
}
