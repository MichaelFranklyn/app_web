import type { VisitContactType } from "@/utils/visit";

export interface ScheduledVisit {
  itemId: string;
  clientId: string;
  clientName: string;
  cityLabel: string;
  neighborhood: string | null;
  date: string;
  contactType: VisitContactType;
}

export interface ScheduledVisitsData {
  scheduledVisits: ScheduledVisit[];
}
