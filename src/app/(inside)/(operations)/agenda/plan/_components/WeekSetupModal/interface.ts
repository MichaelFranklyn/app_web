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

export interface WeekPlan {
  weekStart: string;
  added: number;
  ignoredDays: string[];
  days: PlannedDay[];
  skipped: SkippedStop[];
}

export interface PlanWeekResponse {
  planWeek: {
    status: boolean;
    message: string;
    data: WeekPlan | null;
  };
}
