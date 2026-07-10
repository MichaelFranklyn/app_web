export type ScheduleStatus = "DRAFT" | "CONFIRMED";

export type DayStatus = "PLANNED" | "IN_PROGRESS" | "DONE";

export type DepartureType = "HOME" | "CUSTOM" | "GPS";

export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED";

export type VisitOutcome = "SOLD" | "NOT_BOUGHT" | "RESCHEDULED" | "CLOSED";

export interface VisitClient {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  companyClient: { id: string } | null;
}

export interface VisitFactory {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
}

export interface VisitClientFactoryLink {
  id: string;
  client: VisitClient | null;
  factory: VisitFactory | null;
  latestVisitScore: { scoreTotal: string } | null;
}

// Fábrica que esta visita vai tratar. A visita é ao CLIENTE: quando ele tem mais
// de uma fábrica urgente, o vendedor vai uma vez e conversa sobre todas elas.
export interface VisitFocusFactory {
  scoreTotal: string | null;
  factory: VisitFactory | null;
}

export interface VisitScheduleItem {
  id: string;
  plannedOrder: number;
  estimatedTravelMin: number | null;
  status: VisitStatus;
  outcome: VisitOutcome | null;
  notes: string | null;
  /** O que motivou a visita (sugestão do sistema). */
  focusFactories: VisitFocusFactory[];
  /** O que o vendedor de fato tratou, derivado das observações de estoque. */
  treatedFactories: VisitFactory[];
  clientFactoryLink: VisitClientFactoryLink | null;
}

export interface VisitScheduleDay {
  id: string;
  date: string;
  status: DayStatus;
  departureType: DepartureType;
  routeDistanceKm: string;
  routeDurationMin: number;
  items: VisitScheduleItem[];
}

export interface VisitScheduleSeller {
  id: string;
  user: {
    name: string;
  } | null;
}

export interface VisitSchedule {
  id: string;
  weekStart: string;
  status: ScheduleStatus;
  generatedAt: string;
  seller: VisitScheduleSeller | null;
  days: VisitScheduleDay[];
}

export interface VisitSchedulesQueryData {
  visit_schedules: {
    edges: { node: VisitSchedule }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface RoutineSellerOption {
  id: string;
  name: string;
}

export interface RoutineSellersQueryData {
  routine_sellers: {
    edges: { node: RoutineSellerOption }[];
  };
}

export interface VisitScheduleConfigNode {
  id: string;
  sellerId: string;
  maxVisitsPerDay: number;
}

export interface VisitScheduleConfigQueryData {
  visit_schedule_configs: {
    edges: { node: VisitScheduleConfigNode }[];
  };
}
