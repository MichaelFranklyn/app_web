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
  avgVisitDurationMin: number;
  isRescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
  penaltyScorePerMiss: string;
  priorityWeights: PriorityWeights;
  seller: ScheduleConfigSeller | null;
}

export interface VisitScheduleConfigsResponse {
  schedule_configs: {
    edges: { node: ScheduleConfig }[];
    totalCount: number;
  };
}

export interface RoutineConfigSeller {
  id: string;
  name: string;
}

export interface RoutineConfigSellersResponse {
  config_sellers: {
    edges: { node: RoutineConfigSeller }[];
  };
}

export interface CreateScheduleConfigInput {
  sellerId: string;
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
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

export interface SettingsFormState {
  maxVisitsPerDay: number;
  workDays: number[];
  workStartTime: string;
  workEndTime: string;
  avgVisitDurationMin: number;
  isRescheduleSameWeek: boolean;
  maxRescheduleAttempts: number;
  penaltyScorePerMiss: string;
  priorityWeights: PriorityWeights;
}
