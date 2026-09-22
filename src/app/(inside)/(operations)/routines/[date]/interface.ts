// Fonte única: o enum de resultado ganhou os valores exclusivos do contato remoto.
import type {
  VisitContactType,
  VisitOutcome,
  VisitStatus,
} from "@/utils/visit";

export type { VisitContactType, VisitOutcome, VisitStatus };

// Tipos compartilhados com a grade semanal (nível-pai da rota).
//
// Cliente, fábrica e vínculo são os MESMOS da semana e vivem lá: a folha
// impressa da rotina semanal passou a precisar de endereço e de negativado,
// que só o dia trazia. Duas declarações do mesmo nó divergem na primeira vez
// que alguém acrescenta um campo em uma só.
import { VisitFocusFactory } from "../interface";
import type { Viability } from "@/utils/viability";

export type {
  VisitClient,
  VisitClientFactoryLink,
  VisitFactory,
  VisitPrimaryContact,
} from "../interface";

import type { VisitClientFactoryLink, VisitFactory } from "../interface";

export type DayStatus = "PLANNED" | "IN_PROGRESS" | "DONE";

export interface VisitItem {
  id: string;
  /** Veio de um DIA FIXO (compromisso com o cliente), não da escolha do motor. */
  fixedScheduleId: string | null;
  plannedOrder: number;
  contactType: VisitContactType;
  estimatedTravelMin: number | null;
  /** Hora prevista de início da visita ("09:40"); nula em contato remoto. */
  plannedStartTime: string | null;
  /** Hora prevista de término da visita ("10:10"). */
  plannedEndTime: string | null;
  /** Minutos que a parada ocupa na agenda (config do vendedor). */
  visitDurationMin: number | null;
  status: VisitStatus;
  outcome: VisitOutcome | null;
  notes: string | null;
  /** A visita tomou a jornada inteira — as outras paradas do dia saíram. */
  isWholeDay: boolean;
  focusFactories: VisitFocusFactory[];
  treatedFactories: VisitFactory[];
  /**
   * O pedido possível contra o mínimo da fábrica, congelado no planejamento.
   * Nulo quando a fábrica não tem mínimo cadastrado.
   */
  viability: Viability | null;
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
