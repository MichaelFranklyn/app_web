import type { ScoreDimensions } from "@/utils/score";
import type { VisitContactType, VisitStatus } from "@/utils/visit";

export type PriorityTier = "TOP" | "HIGH" | "NORMAL";

export type PriorityUnavailableReason = "OPEN_ORDER" | "NEGATIVE" | "DEFERRED";

export interface PriorityFocusLink {
  id: string;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string | null;
  } | null;
  latestVisitScore: ScoreDimensions | null;
}

export interface PriorityScheduledTouch {
  itemId: string;
  date: string;
  contactType: VisitContactType;
  status: VisitStatus;
}

export interface PriorityClient {
  clientId: string;
  name: string;
  neighborhood: string | null;
  regionKey: string;
  cityLabel: string;
  latitude: number | null;
  longitude: number | null;
  score: number;
  rank: number;
  tier: PriorityTier;
  suggestedContactType: VisitContactType;
  isForced: boolean;
  availableFrom: string | null;
  focusLinks: PriorityFocusLink[];
  scheduled: PriorityScheduledTouch[];
}

export interface PriorityUnavailableClient {
  clientId: string;
  name: string;
  cityLabel: string;
  reason: PriorityUnavailableReason;
  until: string | null;
}

export interface PriorityClientsData {
  priority_clients: {
    weekStart: string;
    openDates: string[];
    workDates: string[];
    clients: PriorityClient[];
    unavailable: PriorityUnavailableClient[];
  } | null;
}

/** O que o vendedor escolheu para um cliente: como e (se quiser) quando. */
export interface StopChoice {
  contactType: VisitContactType;
  /** Nulo = o sistema escolhe o dia pela região. */
  date: string | null;
}

/** Escolhas da semana, por cliente. */
export type WeekSelection = Record<string, StopChoice>;

/** Os clientes de uma cidade, na ordem da fila. */
export interface RegionGroup {
  key: string;
  label: string;
  clients: PriorityClient[];
  /** Quantos estão na faixa mais urgente — o resumo do cabeçalho do grupo. */
  topCount: number;
}

/** "Mostrar": só a metade de cima da fila, ou a carteira inteira. */
export type PriorityScope = "priority" | "all";
