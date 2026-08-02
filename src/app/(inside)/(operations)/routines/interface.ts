// Fonte única: o enum de resultado ganhou os valores exclusivos do contato remoto.
import type { VisitContactType, VisitOutcome } from "@/utils/visit";
// As cinco dimensões do score chegam junto com o total: são elas que explicam,
// no painel da visita, POR QUE aquela empresa está pedindo atenção.
import type { ScoreDimensions } from "@/utils/score";

export type { VisitContactType, VisitOutcome };

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

/** Com quem falar no cliente — alimenta os botões de ligar e WhatsApp. */
export interface VisitPrimaryContact {
  id: string;
  name: string;
  phone: string | null;
}

export interface VisitClient {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  companyClient: { id: string } | null;
  primaryContact: VisitPrimaryContact | null;
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
  latestVisitScore: ScoreDimensions | null;
}

// Fábrica que esta visita vai tratar. A visita é ao CLIENTE: quando ele tem mais
// de uma fábrica urgente, o vendedor vai uma vez e conversa sobre todas elas.
export interface VisitFocusFactory {
  scoreTotal: string | null;
  factory: VisitFactory | null;
  /**
   * Vínculo (vendedor × cliente × fábrica) que gerou o foco, com as dimensões
   * do score ATUAL. `scoreTotal` acima é o número congelado na geração da
   * rotina; o motivo exibido tem de ser o de hoje, senão o painel explicaria
   * uma urgência que o cliente já resolveu.
   */
  clientFactoryLink: {
    id: string;
    latestVisitScore: ScoreDimensions | null;
  } | null;
}

export interface VisitScheduleItem {
  id: string;
  plannedOrder: number;
  /** Visita presencial ou contato remoto (ligação/WhatsApp). */
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
  maxRemoteContactsPerDay: number;
  isRemoteContactEnabled: boolean;
}

/**
 * Tetos diários do vendedor, um por tipo de toque.
 *
 * Viaja junto porque a rotina agora tem duas capacidades independentes — três
 * props soltas atravessariam cinco níveis de componente até o modal de
 * adicionar, que é onde elas finalmente são lidas.
 */
export interface RoutineCapacity {
  maxVisitsPerDay: number;
  maxRemoteContactsPerDay: number;
  isRemoteContactEnabled: boolean;
}

export interface VisitScheduleConfigQueryData {
  visit_schedule_configs: {
    edges: { node: VisitScheduleConfigNode }[];
  };
}
