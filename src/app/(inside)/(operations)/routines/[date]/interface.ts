export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED";

export type DayStatus = "PLANNED" | "IN_PROGRESS" | "DONE";

export type VisitOutcome = "SOLD" | "NOT_BOUGHT" | "RESCHEDULED" | "CLOSED";

export type StockObservation = "OUT_OF_STOCK" | "LOW" | "ADEQUATE" | "HIGH";

export interface VisitClient {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
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

export interface VisitItem {
  id: string;
  plannedOrder: number;
  estimatedTravelMin: number | null;
  status: VisitStatus;
  outcome: VisitOutcome | null;
  stockObservation: StockObservation | null;
  notes: string | null;
  clientFactoryLink: VisitClientFactoryLink | null;
}

export interface VisitDay {
  id: string;
  date: string;
  departureType: string;
  departureAddress: string | null;
  routeDistanceKm: string;
  routeDurationMin: number;
  status: DayStatus;
  items: VisitItem[];
}

export interface VisitScheduleSeller {
  id: string;
  user: {
    name: string;
  } | null;
}

export interface VisitWeekSchedule {
  id: string;
  weekStart: string;
  status: string;
  seller: VisitScheduleSeller | null;
  days: VisitDay[];
}

export interface VisitsWeekScheduleResponse {
  week_schedule: {
    edges: { node: VisitWeekSchedule }[];
  };
}
