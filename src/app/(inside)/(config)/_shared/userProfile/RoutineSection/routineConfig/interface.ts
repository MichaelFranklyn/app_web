export type PriorityWeights = Record<string, number>;

export interface ScheduleConfigSeller {
  id: string;
  user: {
    name: string;
  } | null;
}

export interface ScheduleConfig {
  id: string;
  sellerId: string;
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  isRemoteContactEnabled: boolean;
  maxRemoteContactsPerDay: number;
  remoteContactIntervalPct: number;
  avgVisitDurationMin: number;
  isRescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
  penaltyScorePerMiss: string;
  priorityWeights: PriorityWeights;
  seller: ScheduleConfigSeller | null;
}

export interface CreateScheduleConfigInput {
  sellerId: string;
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  isRemoteContactEnabled: boolean;
  maxRemoteContactsPerDay: number;
  remoteContactIntervalPct: number;
  avgVisitDurationMin: number;
  isRescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
  penaltyScorePerMiss: string;
  priorityWeights: PriorityWeights;
}

export interface CreateScheduleConfigResponse {
  createScheduleConfig: {
    status: boolean;
    message: string;
    data: ScheduleConfig | null;
  };
}

export interface UpdateScheduleConfigInput {
  maxVisitsPerDay?: number;
  workDays?: number[];
  workStartTime?: string;
  workEndTime?: string;
  isRemoteContactEnabled?: boolean;
  maxRemoteContactsPerDay?: number;
  remoteContactIntervalPct?: number;
  avgVisitDurationMin?: number;
  isRescheduleSameWeek?: boolean;
  maxRescheduleAttempts?: number;
  penaltyScorePerMiss?: string;
  priorityWeights?: PriorityWeights;
}

export interface UpdateScheduleConfigResponse {
  updateScheduleConfig: {
    status: boolean;
    message: string;
    data: ScheduleConfig | null;
  };
}

/** A configuração inteira, incluindo os pesos que hoje só o padrão define. */
export interface SettingsFormState {
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  isRemoteContactEnabled: boolean;
  maxRemoteContactsPerDay: number;
  remoteContactIntervalPct: number;
  avgVisitDurationMin: number;
  isRescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
  penaltyScorePerMiss: string;
  priorityWeights: PriorityWeights;
}

/**
 * Os parâmetros operacionais da rotina — os que o card do perfil mostra e edita.
 * Os pesos do score (`penaltyScorePerMiss`, `priorityWeights`) ficam de fora:
 * são calibragem do algoritmo e hoje não têm tela (entram com o padrão).
 */
export type RoutineOperationalForm = Omit<
  SettingsFormState,
  "penaltyScorePerMiss" | "priorityWeights"
>;
