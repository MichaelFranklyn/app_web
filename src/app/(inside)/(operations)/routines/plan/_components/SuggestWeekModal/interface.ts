import type { VisitContactType } from "@/utils/visit";

export interface SuggestedStop {
  clientId: string;
  contactType: VisitContactType;
  date: string;
}

export interface SuggestWeekPlanData {
  suggestWeekPlan: {
    weekStart: string;
    days: string[];
    stops: SuggestedStop[];
  } | null;
}
