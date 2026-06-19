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

export type StockObservation = "OUT_OF_STOCK" | "LOW" | "ADEQUATE" | "HIGH";

export interface VisitClient {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
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
}

export interface VisitScheduleItem {
  id: string;
  plannedOrder: number;
  estimatedTravelMin: number | null;
  status: VisitStatus;
  outcome: VisitOutcome | null;
  stockObservation: StockObservation | null;
  notes: string | null;
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
