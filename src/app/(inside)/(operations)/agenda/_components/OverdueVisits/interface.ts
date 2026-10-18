import {
  VisitClientFactoryLink,
  VisitContactType,
  VisitStatus,
} from "../../interface";

/**
 * Visita de um dia que já passou e que ninguém marcou.
 *
 * Vem da query `overdueVisits`, que atravessa semanas — por isso traz o próprio
 * `day`, ao contrário do item da rotina, que já chega dentro do dia.
 */
export interface OverdueVisit {
  id: string;
  plannedOrder: number;
  contactType: VisitContactType;
  status: VisitStatus;
  day: { id: string; date: string } | null;
  clientFactoryLink: VisitClientFactoryLink | null;
}

export interface OverdueVisitsQueryData {
  overdueVisits: OverdueVisit[];
}

/** Desfechos que o vendedor pode registrar direto na lista, sem abrir modal. */
export type OverdueOutcome = "COMPLETED" | "CLIENT_ABSENT" | "NO_TIME";
